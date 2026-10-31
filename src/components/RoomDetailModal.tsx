import React from 'react';
import { Room } from '../types/hotel';
import { X, Check, Bed, Users, Maximize2, ShieldCheck, Clock, ArrowRight } from 'lucide-react';

interface RoomDetailModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (room: Room) => void;
}

export const RoomDetailModal: React.FC<RoomDetailModalProps> = ({
  room,
  isOpen,
  onClose,
  onBookNow,
}) => {
  if (!isOpen || !room) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#2B1E16]/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D47]">
              Chamber Specifications
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C130D]">
              {room.room_name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#2B1E16]/60 hover:text-[#1C130D] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          
          {/* Main Visual */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#2B1E16]/5 border border-[#2B1E16]/10">
            <img
              src={room.image_url}
              alt={room.room_name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="absolute bottom-4 right-4 bg-[#1C130D]/85 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium">
              <span className="font-serif text-lg font-semibold text-[#E8D3B9]">
                ₹{room.price_per_night.toLocaleString('en-IN')}
              </span>
              <span className="text-white/70 ml-1 text-xs">/ night + taxes</span>
            </div>
          </div>

          {/* Key Metric Strip (Unboxed metadata) */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-[#FAF8F5] rounded-xl border border-[#2B1E16]/10 text-center">
            <div className="flex flex-col items-center justify-center">
              <Maximize2 className="w-4 h-4 text-[#9E7D47] mb-1" />
              <div className="text-[11px] uppercase tracking-wider text-[#2B1E16]/60 font-semibold">Chamber Size</div>
              <div className="text-xs sm:text-sm font-semibold text-[#1C130D]">{room.room_size}</div>
            </div>
            <div className="flex flex-col items-center justify-center border-x border-[#2B1E16]/10">
              <Bed className="w-4 h-4 text-[#9E7D47] mb-1" />
              <div className="text-[11px] uppercase tracking-wider text-[#2B1E16]/60 font-semibold">Bedding</div>
              <div className="text-xs sm:text-sm font-semibold text-[#1C130D]">{room.bed_type}</div>
            </div>
            <div className="flex flex-col items-center justify-center">
              <Users className="w-4 h-4 text-[#9E7D47] mb-1" />
              <div className="text-[11px] uppercase tracking-wider text-[#2B1E16]/60 font-semibold">Occupancy</div>
              <div className="text-xs sm:text-sm font-semibold text-[#1C130D]">Max {room.max_guests} Guests</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1C130D] mb-2">
              Chamber Overview
            </h3>
            <p className="text-sm text-[#2B1E16]/80 leading-relaxed">
              {room.description}
            </p>
          </div>

          {/* Amenities & Facilities */}
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#1C130D] mb-3">
              Included Facilities &amp; In-Room Comforts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm text-[#2B1E16]/80">
              {room.facilities.map((fac, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-[#FAF8F5] rounded-lg">
                  <Check className="w-4 h-4 text-[#9E7D47] shrink-0" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Hotel Policies Note */}
          <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/50 space-y-2 text-xs text-amber-950">
            <div className="font-semibold flex items-center gap-1.5 text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-800" />
              <span>Stay Guidelines &amp; Policies</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-amber-800 shrink-0" />
              <span>Check-In: 12:00 PM · Check-Out: 11:00 AM</span>
            </div>
            <p>
              Cancellation Policy: Cancellations made at least 48 hours before scheduled check-in incur zero fees. Valid Government ID required for all adult guests.
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-t border-[#2B1E16]/10 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-semibold text-[#2B1E16] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
          >
            Back to List
          </button>

          <button
            onClick={() => {
              onClose();
              onBookNow(room);
            }}
            className="px-6 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer inline-flex items-center gap-2"
          >
            <span>Book This Chamber</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
