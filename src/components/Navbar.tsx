import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, LogOut, Menu, X, CalendarCheck } from 'lucide-react';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAuth: (initialTab?: 'login' | 'register') => void;
  onOpenAdmin: () => void;
  onOpenDashboard: () => void;
  activeView: 'home' | 'rooms' | 'about' | 'contact' | 'dashboard' | 'admin';
  setActiveView: (view: 'home' | 'rooms' | 'about' | 'contact' | 'dashboard' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAuth,
  onOpenAdmin,
  onOpenDashboard,
  activeView,
  setActiveView,
}) => {
  const { profile, isAdmin, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigateTo = (view: 'home' | 'rooms' | 'about' | 'contact') => {
    setActiveView(view);
    setMobileMenuOpen(false);
    const element = document.getElementById(view);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#2B1E16]/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-20">
          
          {/* Zone 1: Brand Wordmark (Display Serif, Single Element) */}
          <button
            onClick={() => {
              setActiveView('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2 group text-left cursor-pointer"
          >
            <span className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.2em] text-[#2B1E16] group-hover:text-[#9E7D47] transition-colors uppercase">
              ASVILLA
            </span>
          </button>

          {/* Zone 2: Navigation Links (Clean single-line text links) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide">
            <button
              onClick={() => navigateTo('home')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'home'
                  ? 'text-[#9E7D47] border-b-2 border-[#9E7D47]'
                  : 'text-[#2B1E16]/80 hover:text-[#2B1E16]'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => navigateTo('rooms')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'rooms'
                  ? 'text-[#9E7D47] border-b-2 border-[#9E7D47]'
                  : 'text-[#2B1E16]/80 hover:text-[#2B1E16]'
              }`}
            >
              Rooms &amp; Suites
            </button>
            <button
              onClick={() => navigateTo('about')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'about'
                  ? 'text-[#9E7D47] border-b-2 border-[#9E7D47]'
                  : 'text-[#2B1E16]/80 hover:text-[#2B1E16]'
              }`}
            >
              About ASVILLA
            </button>
            <button
              onClick={() => navigateTo('contact')}
              className={`transition-colors cursor-pointer py-1 ${
                activeView === 'contact'
                  ? 'text-[#9E7D47] border-b-2 border-[#9E7D47]'
                  : 'text-[#2B1E16]/80 hover:text-[#2B1E16]'
              }`}
            >
              Contact
            </button>

            {profile && (
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  onOpenDashboard();
                }}
                className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 ${
                  activeView === 'dashboard'
                    ? 'text-[#9E7D47] border-b-2 border-[#9E7D47]'
                    : 'text-[#2B1E16]/80 hover:text-[#2B1E16]'
                }`}
              >
                <CalendarCheck className="w-4 h-4" />
                <span>My Bookings</span>
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  setActiveView('admin');
                  onOpenAdmin();
                }}
                className={`transition-colors cursor-pointer py-1 flex items-center gap-1.5 text-amber-800 hover:text-amber-900 font-semibold ${
                  activeView === 'admin' ? 'border-b-2 border-amber-800' : ''
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-[#9E7D47]" />
                <span>Admin Panel</span>
              </button>
            )}
          </nav>

          {/* Zone 3: Primary Actions (Auth / Booking CTA) */}
          <div className="flex items-center gap-3 shrink-0">
            {profile ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    onOpenDashboard();
                  }}
                  className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#2B1E16] bg-[#F5EFEB] hover:bg-[#EAE1D9] border border-[#2B1E16]/10 rounded-lg transition-colors cursor-pointer"
                  title="View User Dashboard"
                >
                  <User className="w-3.5 h-3.5 text-[#9E7D47]" />
                  <span className="max-w-[120px] truncate">{profile.full_name || 'My Profile'}</span>
                </button>
                <button
                  onClick={signOut}
                  className="p-2 text-xs font-medium text-[#2B1E16]/70 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('login')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#2B1E16] hover:text-[#9E7D47] border border-[#2B1E16]/15 hover:border-[#9E7D47] rounded-lg transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            <button
              onClick={onOpenBooking}
              className="px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold tracking-wide text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              Book Now
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#2B1E16] hover:bg-[#F5EFEB] rounded-lg cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#2B1E16]/10 bg-[#FAF8F5] px-4 pt-4 pb-6 space-y-3">
          <button
            onClick={() => navigateTo('home')}
            className="block w-full text-left py-2 text-base font-medium text-[#2B1E16]"
          >
            Home
          </button>
          <button
            onClick={() => navigateTo('rooms')}
            className="block w-full text-left py-2 text-base font-medium text-[#2B1E16]"
          >
            Rooms &amp; Suites
          </button>
          <button
            onClick={() => navigateTo('about')}
            className="block w-full text-left py-2 text-base font-medium text-[#2B1E16]"
          >
            About ASVILLA
          </button>
          <button
            onClick={() => navigateTo('contact')}
            className="block w-full text-left py-2 text-base font-medium text-[#2B1E16]"
          >
            Contact
          </button>

          <div className="pt-2 border-t border-[#2B1E16]/10 space-y-2">
            {profile ? (
              <>
                <button
                  onClick={() => {
                    setActiveView('dashboard');
                    onOpenDashboard();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium text-[#2B1E16]"
                >
                  <CalendarCheck className="w-4 h-4 text-[#9E7D47]" />
                  <span>My Dashboard &amp; Bookings</span>
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setActiveView('admin');
                      onOpenAdmin();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full py-2 text-sm font-medium text-amber-900"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#9E7D47]" />
                    <span>Admin Panel</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    signOut();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full py-2 text-sm font-medium text-red-700"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenAuth('login');
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 w-full py-2 text-sm font-medium text-[#2B1E16]"
              >
                <User className="w-4 h-4 text-[#9E7D47]" />
                <span>Guest Sign In / Register</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
