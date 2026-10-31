import React from 'react';
import { ShieldCheck, HeartHandshake, MapPin, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white border-y border-[#2B1E16]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9E7D47] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The ASVILLA Story</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C130D] mb-4">
            About ASVILLA Heritage Hotel
          </h2>
          <p className="text-base text-[#2B1E16]/75 leading-relaxed">
            A sanctuary of gracious living situated in the spiritual cradle of Varanasi, Uttar Pradesh. Restored with reverence to timeless Indian haveli architecture while presenting contemporary luxury comforts.
          </p>
        </div>

        {/* Narrative & High Quality Imagery Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-20">
          
          {/* Narrative Column */}
          <div className="lg:col-span-6 space-y-6 text-[#2B1E16]/80 text-sm sm:text-base leading-relaxed">
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1C130D] mb-2">
                Our Hotel &amp; Heritage Architecture
              </h3>
              <p>
                ASVILLA stands as an ode to Varanasi’s storied masonry traditions. Constructed using regional Chunar sandstone and embellished with handcrafted floral jharokhas, our hotel provides an atmosphere of calm elegance where guests can retreat after exploring the ancient streets.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1C130D] mb-2">
                Warm &amp; Attentive Hospitality
              </h3>
              <p>
                From the gentle aroma of fresh jasmine upon arrival to our courtyard tea service and bespoke morning dining, ASVILLA’s staff embodies the ancient philosophy of <em>Atithi Devo Bhava</em>. Every guest is treated as family, with personalized concierge support for smooth hotel stays.
              </p>
            </div>

            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#1C130D] mb-2">
                Tranquil Location in Varanasi
              </h3>
              <p>
                Conveniently positioned in Ravindrapuri near Assi, ASVILLA offers a rare combination: peaceful, quiet nights free of street honking, coupled with effortless accessibility to Varanasi’s historic city center, railway junction, and airport access roads.
              </p>
            </div>
          </div>

          {/* Photo Showcase (Two high-fidelity hotel photos) */}
          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-xl overflow-hidden aspect-[3/4] bg-[#F5EFEB] border border-[#2B1E16]/10 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"
                  alt="ASVILLA Hotel Courtyard View"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#2B1E16]/10 text-xs text-[#2B1E16]/75">
                <span className="font-semibold text-[#1C130D]">Courtyard Sanctuary</span>
                <p className="text-[11px] mt-0.5">Sunlit corridors and marble fountains.</p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <div className="rounded-xl overflow-hidden aspect-[3/4] bg-[#F5EFEB] border border-[#2B1E16]/10 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80"
                  alt="ASVILLA Heritage Interior"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#2B1E16]/10 text-xs text-[#2B1E16]/75">
                <span className="font-semibold text-[#1C130D]">Artisanal Interiors</span>
                <p className="text-[11px] mt-0.5">Teakwood carvings and pure Varanasi brocades.</p>
              </div>
            </div>
          </div>

        </div>

        {/* 4 Pillars: Why Choose ASVILLA */}
        <div className="pt-12 border-t border-[#2B1E16]/10">
          <div className="text-center mb-10">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#1C130D]">
              Why Guests Choose ASVILLA
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#2B1E16]/10">
              <div className="w-10 h-10 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#1C130D] mb-1.5">
                Authentic Heritage
              </h4>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Handcrafted stone architecture and custom teakwood fittings celebrating Varanasi craftsmanship.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#2B1E16]/10">
              <div className="w-10 h-10 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] mb-4">
                <MapPin className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#1C130D] mb-1.5">
                Peaceful Kashi Location
              </h4>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Tucked away in quiet Ravindrapuri, guaranteeing calm rest while remaining minutes from landmark sites.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#2B1E16]/10">
              <div className="w-10 h-10 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#1C130D] mb-1.5">
                Secure &amp; Flexible Booking
              </h4>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Zero advance booking option with Pay at Hotel (COD) or direct UPI QR transfer with fast verification.
              </p>
            </div>

            <div className="p-6 bg-[#FAF8F5] rounded-xl border border-[#2B1E16]/10">
              <div className="w-10 h-10 rounded-lg bg-[#9E7D47]/10 flex items-center justify-center text-[#9E7D47] mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h4 className="font-serif text-lg font-semibold text-[#1C130D] mb-1.5">
                24/7 Dedicated Care
              </h4>
              <p className="text-xs text-[#2B1E16]/75 leading-relaxed">
                Personalized assistance, round-the-clock front desk, and customized hospitality throughout your stay.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
