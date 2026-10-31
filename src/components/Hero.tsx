import React, { useState } from 'react';
import { Calendar, Users, Search, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface HeroProps {
  onSearch: (checkIn: string, checkOut: string, guests: number) => void;
  onExploreRooms: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onExploreRooms }) => {
  // Tomorrow as default checkin, day after as checkout
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [checkIn, setCheckIn] = useState(formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState(formatDate(dayAfter));
  const [guests, setGuests] = useState(2);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(checkIn, checkOut, guests);
  };

  return (
    <section id="home" className="relative pt-6 pb-16 md:pt-12 md:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Split Grid Hero: Left Editorial Story, Right Architectural Visual */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          
          {/* Left Column: Heading, Intro, Kicker */}
          <div className="lg:col-span-6 flex flex-col justify-center">
            
            {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.25em] text-[#9E7D47] mb-4">
              <span>Varanasi, Uttar Pradesh</span>
              <span aria-hidden="true">·</span>
              <span>Heritage Hospitality</span>
              <span aria-hidden="true">·</span>
              <span>Kashi Sanctum</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-[#1C130D] leading-[1.12] mb-6 text-balance">
              Experience the Timeless Charm of Varanasi
            </h1>

            <p className="text-base sm:text-lg text-[#2B1E16]/80 leading-relaxed max-w-xl mb-8">
              Nestled near the quiet lanes of Ravindrapuri, <strong className="font-semibold text-[#1C130D]">ASVILLA</strong> is an authentic heritage hotel in Kashi. Imbued with hand-carved stone arches, warm teakwood suites, and tranquil fountain courtyards, we welcome you to a peaceful retreat steeped in sacred grace.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-[#2B1E16]/75 mb-8">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#9E7D47]" />
                <span>Zero Advance Pay at Hotel (COD)</span>
              </div>
              <span aria-hidden="true" className="text-[#2B1E16]/30">·</span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#9E7D47]" />
                <span>Instant UPI QR Verification</span>
              </div>
            </div>

            <div>
              <button
                onClick={onExploreRooms}
                className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold tracking-wide text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
              >
                <span>Browse Heritage Rooms</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: High Quality Heritage Hotel Facade with Fallback */}
          <div className="lg:col-span-6 relative flex flex-col">
            <div className="relative w-full h-[360px] sm:h-[460px] lg:h-full rounded-2xl overflow-hidden bg-[#2B1E16] shadow-xl border border-[#2B1E16]/10">
              <img
                src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1400&q=80"
                alt="ASVILLA Heritage Hotel in Varanasi"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                onError={(e) => {
                  // Fallback to secondary authentic hotel photo
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1400&q=80';
                }}
              />
              
              {/* Subtle Atmospheric Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1C130D]/80 via-[#1C130D]/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white">
                <div className="text-xs uppercase tracking-[0.2em] text-[#C5A880] mb-1 font-medium">
                  ASVILLA Heritage Sanctuary
                </div>
                <div className="font-serif text-xl sm:text-2xl font-normal leading-snug">
                  Restored with historic craftsmanship, designed for modern tranquility.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Quick Reservation Search Bar */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-[#2B1E16]/10 p-4 sm:p-6 transition-all">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            
            {/* Check-In */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/70 mb-1.5">
                Check-in Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#9E7D47] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={checkIn}
                  min={formatDate(today)}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (e.target.value >= checkOut) {
                      const next = new Date(e.target.value);
                      next.setDate(next.getDate() + 1);
                      setCheckOut(formatDate(next));
                    }
                  }}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  required
                />
              </div>
            </div>

            {/* Check-Out */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/70 mb-1.5">
                Check-out Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#9E7D47] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  required
                />
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/70 mb-1.5">
                Number of Guests
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#9E7D47] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                >
                  <option value={1}>1 Guest (Solo)</option>
                  <option value={2}>2 Guests (Double)</option>
                  <option value={3}>3 Guests (Suite)</option>
                  <option value={4}>4 Guests (Family)</option>
                  <option value={5}>5+ Guests (Haveli Suite)</option>
                </select>
              </div>
            </div>

            {/* Submit CTA */}
            <div>
              <button
                type="submit"
                className="w-full h-[42px] inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-[#9E7D47] hover:bg-[#856734] rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Search Available Rooms</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </section>
  );
};
