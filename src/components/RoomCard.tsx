import React from 'react';
import { Room } from '../types/hotel';
import { Bed, Users, Maximize2, Check, ArrowRight } from 'lucide-react';

interface RoomCardProps {
  room: Room;
  onViewDetails: (room: Room) => void;
  onBookNow: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({ room, onViewDetails, onBookNow }) => {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-[#2B1E16]/10 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full">
      
      {/* Photograph Container with 4:3 Ratio */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#2B1E16]/5">
        <img
          src={room.image_url}
          alt={room.room_name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Quiet Price Overlay on Corner */}
        <div className="absolute bottom-3 right-3 bg-[#1C130D]/85 backdrop-blur-sm text-white px-3 py-1.5 rounded-md text-xs font-medium">
          <span className="font-serif text-base font-semibold tracking-wide text-[#E8D3B9]">
            ₹{room.price_per_night.toLocaleString('en-IN')}
          </span>
          <span className="text-white/70 ml-1 text-[11px]">/ night</span>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-6 flex flex-col flex-1">
        
        {/* Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="flex items-center gap-2 text-xs text-[#2B1E16]/65 mb-2 font-medium">
          <span className="inline-flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-[#9E7D47]" />
            <span>{room.room_size}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Bed className="w-3.5 h-3.5 text-[#9E7D47]" />
            <span>{room.bed_type}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-[#9E7D47]" />
            <span>Up to {room.max_guests} Guests</span>
          </span>
        </div>

        {/* Room Title */}
        <h3 className="font-serif text-xl font-semibold text-[#1C130D] group-hover:text-[#9E7D47] transition-colors mb-2">
          {room.room_name}
        </h3>

        {/* Room Description */}
        <p className="text-xs sm:text-sm text-[#2B1E16]/75 line-clamp-2 leading-relaxed mb-4 flex-1">
          {room.description}
        </p>

        {/* Facilities Preview (First 3-4 key amenities) */}
        <div className="pt-3 border-t border-[#2B1E16]/10 mb-6">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D47] mb-2">
            Selected Highlights
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-[#2B1E16]/80">
            {room.facilities.slice(0, 4).map((fac, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate">
                <Check className="w-3.5 h-3.5 text-[#9E7D47] shrink-0" />
                <span className="truncate">{fac}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => onViewDetails(room)}
            className="w-full py-2.5 text-xs font-semibold text-[#2B1E16] bg-[#FAF8F5] hover:bg-[#F2ECE4] border border-[#2B1E16]/15 rounded-lg transition-colors cursor-pointer text-center"
          >
            View Details
          </button>
          <button
            onClick={() => onBookNow(room)}
            className="w-full py-2.5 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-1"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};
