import React from 'react';
import { Phone, Mail, MapPin, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: 'home' | 'rooms' | 'about' | 'contact') => void;
  onOpenPolicy: (type: 'privacy' | 'terms') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenPolicy }) => {
  return (
    <footer className="bg-[#1C130D] text-[#FAF8F5] pt-16 pb-12 border-t border-[#FAF8F5]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-[#FAF8F5]/10">
          
          {/* Col 1: ASVILLA Brand (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <span className="font-serif text-3xl font-bold tracking-[0.2em] text-[#E8D3B9] uppercase block">
              ASVILLA
            </span>
            <div className="text-xs uppercase tracking-widest text-[#C5A880] font-medium">
              Luxury Heritage Hotel · Varanasi, India
            </div>
            <p className="text-xs sm:text-sm text-[#FAF8F5]/75 leading-relaxed max-w-sm">
              An authentic heritage boutique retreat nestled in historic Ravindrapuri, Kashi. Dedicated exclusively to gracious guest hospitality, serene courtyard comfort, and timeless Indian architecture.
            </p>
            <div className="pt-2 text-xs text-[#FAF8F5]/60 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C5A880]" />
              <span>Direct Reservations · Zero Booking Commission</span>
            </div>
          </div>

          {/* Col 2: Navigation Links (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              Navigation
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF8F5]/80">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  Rooms &amp; Suites
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  About ASVILLA
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('contact')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  Contact Concierge
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Policies (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              Policies &amp; Trust
            </div>
            <ul className="space-y-2 text-xs sm:text-sm text-[#FAF8F5]/80">
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  Booking &amp; Cancellation
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('privacy')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenPolicy('terms')}
                  className="hover:text-[#E8D3B9] transition-colors cursor-pointer"
                >
                  Terms &amp; Conditions
                </button>
              </li>
              <li>
                <span className="text-[11px] text-[#FAF8F5]/60 block pt-1">
                  UPI ID: 8081144350-4@ybl
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Front Desk (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              Varanasi Address
            </div>
            <div className="space-y-2 text-xs text-[#FAF8F5]/80">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                <span>B-3/42 Ravindrapuri, Near Assi Ghat, Varanasi, UP 221005, India</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <a href="tel:+918081144350" className="hover:text-[#E8D3B9]">
                  +91 80811 44350
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                <a href="mailto:reservations@asvilla.com" className="hover:text-[#E8D3B9]">
                  reservations@asvilla.com
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Quiet Bottom Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#FAF8F5]/50">
          <div>
            © {new Date().getFullYear()} ASVILLA Varanasi. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Hospitality crafted with reverence for Kashi</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
