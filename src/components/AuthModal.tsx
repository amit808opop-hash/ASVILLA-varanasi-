import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  KeyRound,
  Info,
  Send
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register' | 'admin';
  onSuccess?: (isAdminLogin?: boolean) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  onSuccess,
}) => {
  const { signIn, signInAdmin, signUp, resetPassword, resendVerificationEmail } = useAuth();
  const [tab, setTab] = useState<'login' | 'register' | 'forgot' | 'admin'>(initialTab);

  // Guest form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Admin form state
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [verificationPendingEmail, setVerificationPendingEmail] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setVerificationPendingEmail(null);
    setLoading(true);

    try {
      if (tab === 'login') {
        const res = await signIn(email.trim(), password);
        if (res.success) {
          onClose();
          if (onSuccess) onSuccess(false);
        } else {
          if (res.code === 'email_not_confirmed') {
            setVerificationPendingEmail(email.trim());
          }
          setErrorMsg(res.error || 'Invalid email or password.');
        }
      } else if (tab === 'register') {
        if (!fullName.trim() || !phone.trim()) {
          setErrorMsg('Please enter your full name and phone number.');
          setLoading(false);
          return;
        }

        const res = await signUp(fullName.trim(), email.trim(), phone.trim(), password);
        if (res.success) {
          if (res.needsEmailVerification) {
            setVerificationPendingEmail(email.trim());
            setSuccessMsg(`Account created in Supabase! A verification email has been dispatched to ${email.trim()}. Please verify your email before logging in. If email confirmation is turned off in your Supabase project, you can log in immediately.`);
            setTab('login');
          } else {
            setSuccessMsg('Account registered successfully! Welcome to ASVILLA.');
            setTimeout(() => {
              onClose();
              if (onSuccess) onSuccess(false);
            }, 1200);
          }
        } else {
          setErrorMsg(res.error || 'Could not complete registration.');
        }
      } else if (tab === 'forgot') {
        const res = await resetPassword(email.trim());
        if (res.success) {
          setSuccessMsg('Password reset instructions dispatched to your email.');
        } else {
          setErrorMsg(res.error || 'Failed to dispatch reset email.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationPendingEmail) return;
    setResendingEmail(true);
    setErrorMsg(null);
    try {
      const res = await resendVerificationEmail(verificationPendingEmail);
      if (res.success) {
        setSuccessMsg('Verification email resent! Please check your inbox and spam folder.');
      } else {
        setErrorMsg(res.error || 'Unable to resend verification email.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error resending verification email.');
    } finally {
      setResendingEmail(false);
    }
  };

  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await signInAdmin(adminPassword);
      if (res.success) {
        setSuccessMsg('Admin authentication verified. Redirecting to Admin Panel...');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess(true);
        }, 500);
      } else {
        setErrorMsg(res.error || 'Invalid admin credentials. Access denied.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#2B1E16]/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D47]">
              {tab === 'admin' ? 'Hotel Management' : 'Guest Portal'}
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C130D]">
              {tab === 'login' && 'Sign In to ASVILLA'}
              {tab === 'register' && 'Create Guest Account'}
              {tab === 'forgot' && 'Reset Password'}
              {tab === 'admin' && 'Admin Login'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2B1E16]/60 hover:text-[#1C130D] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Guest Tab Switcher (Visible only on guest views: login & register) */}
        {(tab === 'login' || tab === 'register') && (
          <div className="flex border-b border-[#2B1E16]/10 bg-[#FAF8F5]/50">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
                setSuccessMsg(null);
                setVerificationPendingEmail(null);
              }}
              className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 cursor-pointer transition-colors ${
                tab === 'login'
                  ? 'border-[#9E7D47] text-[#9E7D47] bg-white'
                  : 'border-transparent text-[#2B1E16]/70 hover:text-[#1C130D]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
                setSuccessMsg(null);
                setVerificationPendingEmail(null);
              }}
              className={`flex-1 py-3 text-xs font-semibold tracking-wide border-b-2 cursor-pointer transition-colors ${
                tab === 'register'
                  ? 'border-[#9E7D47] text-[#9E7D47] bg-white'
                  : 'border-transparent text-[#2B1E16]/70 hover:text-[#1C130D]'
              }`}
            >
              Register
            </button>
          </div>
        )}

        {/* Modal Form Body */}
        <div className="p-6">
          
          {errorMsg && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2 leading-relaxed">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span>{errorMsg}</span>
                {verificationPendingEmail && (
                  <div className="mt-2 pt-2 border-t border-red-200 flex items-center justify-between">
                    <span className="text-[11px] text-red-700">Didn't receive email?</span>
                    <button
                      type="button"
                      disabled={resendingEmail}
                      onClick={handleResendVerification}
                      className="text-[11px] font-semibold text-red-900 underline hover:no-underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Send className="w-3 h-3" />
                      <span>{resendingEmail ? 'Sending...' : 'Resend Verification'}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ADMIN LOGIN FORM */}
          {tab === 'admin' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Enter your authorized hotel administrator password to access room management, guest bookings, and financial verification.
              </p>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1.5">
                  Admin Password *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Enter admin password"
                    autoFocus
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {loading ? 'Verifying Admin Access...' : 'Sign In to Admin'}
              </button>

              <div className="pt-3 border-t border-[#2B1E16]/10 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setTab('login');
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setAdminPassword('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-[#2B1E16]/70 hover:text-[#1C130D] cursor-pointer font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Guest Login</span>
                </button>
              </div>
            </form>
          ) : (
            /* GUEST LOGIN / REGISTER / FORGOT FORM */
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              
              {tab === 'register' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Chandra"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>
              </div>

              {tab !== 'forgot' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75">
                      Password *
                    </label>
                    {tab === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setTab('forgot');
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] text-[#9E7D47] hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
              >
                {loading
                  ? 'Processing...'
                  : tab === 'login'
                  ? 'Sign In to Account'
                  : tab === 'register'
                  ? 'Complete Registration'
                  : 'Send Reset Link'}
              </button>

              {tab === 'forgot' ? (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-[#2B1E16]/70 hover:text-[#1C130D] cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : tab === 'login' ? (
                /* Simple Switch to Admin link - No admin email displayed! */
                <div className="mt-6 pt-4 border-t border-[#2B1E16]/10 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setTab('admin');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                      setAdminPassword('');
                    }}
                    className="text-xs text-[#9E7D47] hover:underline cursor-pointer font-medium"
                  >
                    Switch to Admin
                  </button>
                </div>
              ) : null}

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
