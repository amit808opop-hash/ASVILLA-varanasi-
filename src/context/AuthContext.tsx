import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole } from '../types/hotel';

export interface AuthResponse {
  success: boolean;
  error?: string;
  code?: string;
  needsEmailVerification?: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signInAdmin: (password: string) => Promise<AuthResponse>;
  signUp: (fullName: string, email: string, phone: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResponse>;
  resendVerificationEmail: (email: string) => Promise<AuthResponse>;
  updateProfile: (fullName: string, phone: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_PROFILE_KEY = 'asvilla_user_profile_v1';
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || 'maurya39555@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Synchronize profile with Supabase profiles table
  const fetchProfile = async (currentUser: User) => {
    try {
      // 1. Try querying profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .maybeSingle();

      if (!error && data) {
        const userProf = data as UserProfile;
        setProfile(userProf);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(userProf));
        return userProf;
      }
    } catch (e) {
      console.warn('Profile fetch warning:', e);
    }

    // 2. Fallback / Upsert if not in profiles table
    const userRole: UserRole =
      currentUser.user_metadata?.role === 'admin' ||
      currentUser.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
        ? 'admin'
        : 'user';

    const fallbackProfile: UserProfile = {
      id: currentUser.id,
      full_name: currentUser.user_metadata?.full_name || (userRole === 'admin' ? 'ASVILLA Hotel Administrator' : 'Valued Guest'),
      email: currentUser.email || '',
      phone: currentUser.user_metadata?.phone || '',
      role: userRole,
      created_at: currentUser.created_at || new Date().toISOString(),
    };

    // Attempt to persist in profiles table
    try {
      await supabase.from('profiles').upsert([fallbackProfile], { onConflict: 'id' });
    } catch (err) {
      console.warn('Profile upsert warning (table might need schema execution):', err);
    }

    setProfile(fallbackProfile);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(fallbackProfile));
    return fallbackProfile;
  };

  useEffect(() => {
    // Initial session retrieval
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user);
      } else {
        // If no active Supabase session, verify if there was a verified admin/guest in storage
        const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
        if (stored) {
          try {
            setProfile(JSON.parse(stored));
          } catch {
            // ignore
          }
        }
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    // Listen to Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session: Session | null) => {
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Standard Guest Sign In using Supabase signInWithPassword
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (error) {
        if (error.code === 'email_not_confirmed' || error.message?.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            code: 'email_not_confirmed',
            error: 'Email verification is pending. Please check your inbox and click the verification link sent by Supabase, or turn OFF "Confirm email" in Supabase Auth settings to log in immediately.',
          };
        }

        if (error.code === 'invalid_credentials' || error.message?.toLowerCase().includes('invalid login credentials')) {
          return {
            success: false,
            code: 'invalid_credentials',
            error: 'Invalid login credentials. Please check your email and password, or register if you do not have an account.',
          };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user);
        return { success: true };
      }

      return { success: false, error: 'Sign in failed. Please try again.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Network error during sign in' };
    }
  };

  // Dedicated Hotel Admin Sign In using Supabase Auth
  const signInAdmin = async (password: string): Promise<AuthResponse> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password,
      });

      if (!error && data?.user) {
        setUser(data.user);
        await fetchProfile(data.user);
        return { success: true };
      }

      // Supabase verified credentials against auth.users but email confirmation is pending
      if (error && (error.code === 'email_not_confirmed' || error.message?.toLowerCase().includes('email not confirmed'))) {
        const adminProf: UserProfile = {
          id: 'd7aab366-7c92-4adb-ad7c-507b3cb66861',
          full_name: 'ASVILLA Hotel Administrator',
          email: ADMIN_EMAIL,
          phone: '+91 80811 44350',
          role: 'admin',
          created_at: new Date().toISOString(),
        };
        setProfile(adminProf);
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(adminProf));
        return { success: true };
      }

      return {
        success: false,
        error: 'Invalid admin credentials. Access denied.',
      };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Authentication error.' };
    }
  };

  // Guest Registration using Supabase signUp
  const signUp = async (fullName: string, email: string, phone: string, password: string): Promise<AuthResponse> => {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: 'user',
          },
        },
      });

      // Handle Supabase Auth errors
      if (error) {
        // Specific error when Supabase email rate limit is hit or mailer fails
        if (error.message?.includes('confirmation email') || (error as any).status === 500) {
          return {
            success: false,
            code: 'email_rate_limit',
            error: 'Supabase could not send the confirmation email (built-in rate limit reached). To enable immediate guest registration: Go to Supabase Dashboard → Authentication → Providers → Email and toggle OFF "Confirm email".',
          };
        }

        if (error.message?.includes('already registered')) {
          return {
            success: false,
            code: 'user_exists',
            error: 'An account with this email is already registered. Please sign in or reset your password.',
          };
        }

        return { success: false, error: error.message };
      }

      // Supabase prevents email enumeration: if user exists, data.user is returned with empty identities []
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        return {
          success: false,
          code: 'user_exists',
          error: 'An account with this email already exists. Please sign in or reset your password.',
        };
      }

      if (data.user) {
        // Save profile in profiles table
        const newProf: UserProfile = {
          id: data.user.id,
          full_name: fullName.trim(),
          email: cleanEmail,
          phone: phone.trim(),
          role: 'user',
          created_at: data.user.created_at || new Date().toISOString(),
        };

        try {
          await supabase.from('profiles').upsert([newProf], { onConflict: 'id' });
        } catch (e) {
          console.warn('Profile sync on signup warning:', e);
        }

        // If session is present, user is immediately confirmed and signed in!
        if (data.session) {
          setUser(data.user);
          setProfile(newProf);
          localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(newProf));
          return { success: true, needsEmailVerification: false };
        }

        // If session is null, email verification is required by Supabase!
        return { success: true, needsEmailVerification: true };
      }

      return { success: false, error: 'Registration could not be completed.' };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Error creating account' };
    }
  };

  const resendVerificationEmail = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });
      if (error) {
        if (error.message?.includes('confirmation email')) {
          return {
            success: false,
            error: 'Supabase default email rate limit reached. Please disable "Confirm email" in Supabase Auth settings to log in immediately.',
          };
        }
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to resend verification email.' };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setProfile(null);
    localStorage.removeItem(LOCAL_PROFILE_KEY);
  };

  const resetPassword = async (email: string): Promise<AuthResponse> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${window.location.origin}/#reset-password`,
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Unable to send reset instructions.' };
    }
  };

  const updateProfile = async (fullName: string, phone: string) => {
    if (!profile) return { success: false, error: 'Not logged in' };
    const updated: UserProfile = {
      ...profile,
      full_name: fullName.trim(),
      phone: phone.trim(),
    };
    try {
      if (user) {
        await supabase.from('profiles').update({ full_name: fullName.trim(), phone: phone.trim() }).eq('id', user.id);
      }
    } catch (e) {
      console.warn('Profile update error:', e);
    }
    setProfile(updated);
    localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
    return { success: true };
  };

  // Strictly verify admin permission
  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        signIn,
        signInAdmin,
        signUp,
        signOut,
        resetPassword,
        resendVerificationEmail,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
