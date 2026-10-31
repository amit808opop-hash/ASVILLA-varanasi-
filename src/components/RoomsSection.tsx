import React, { useState } from 'react';
import { Room } from '../types/hotel';
import { RoomCard } from './RoomCard';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

interface RoomsSectionProps {
  rooms: Room[];
  loading: boolean;
  onViewDetails: (room: Room) => void;
  onBookNow: (room: Room) => void;
  guestFilter?: number;
}

export const RoomsSection: React.FC<RoomsSectionProps> = ({
  rooms,
  loading,
  onViewDetails,
  onBookNow,
  guestFilter = 0,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'suite' | 'deluxe' | 'classic'>('all');
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(20000);

  const filteredRooms = rooms.filter(room => {
    if (!room.is_active) return false;
    if (guestFilter > 0 && room.max_guests < guestFilter) return false;

    if (selectedCategory === 'suite' && !room.room_name.toLowerCase().includes('suite')) return false;
    if (selectedCategory === 'deluxe' && !room.room_name.toLowerCase().includes('deluxe')) return false;
    if (selectedCategory === 'classic' && (!room.room_name.toLowerCase().includes('classic') && !room.room_name.toLowerCase().includes('room'))) return false;

    if (room.price_per_night < minPrice || room.price_per_night > maxPrice) return false;

    return true;
  });

  return (
    <section id="rooms" className="py-16 md:py-24 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#9E7D47] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Refined Accommodations</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#1C130D] mb-4">
            Rooms &amp; Suites
          </h2>
          <p className="text-sm sm:text-base text-[#2B1E16]/75 leading-relaxed">
            Each room at ASVILLA is an intimate tribute to Varanasi’s artisanal heritage—featuring carved woods, pure fabrics, and serene courtyards.
          </p>
        </div>

        {/* Interactive Filter Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-10 pb-6 border-b border-[#2B1E16]/10">
          
          {/* Category Tabs (Interactive buttons) */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[#F0EAE1] rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-[#1C130D] shadow-xs'
                  : 'text-[#2B1E16]/70 hover:text-[#1C130D]'
              }`}
            >
              All Chambers ({rooms.filter(r => r.is_active).length})
            </button>
            <button
              onClick={() => setSelectedCategory('suite')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'suite'
                  ? 'bg-white text-[#1C130D] shadow-xs'
                  : 'text-[#2B1E16]/70 hover:text-[#1C130D]'
              }`}
            >
              Suites
            </button>
            <button
              onClick={() => setSelectedCategory('deluxe')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'deluxe'
                  ? 'bg-white text-[#1C130D] shadow-xs'
                  : 'text-[#2B1E16]/70 hover:text-[#1C130D]'
              }`}
            >
              Deluxe Rooms
            </button>
          </div>

          {/* Quick Price Range Indicator */}
          <div className="flex items-center gap-3 text-xs text-[#2B1E16]/70 font-medium">
            <SlidersHorizontal className="w-4 h-4 text-[#9E7D47]" />
            <span>Showing {filteredRooms.length} available room{filteredRooms.length === 1 ? '' : 's'}</span>
          </div>

        </div>

        {/* Room Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl h-[460px] animate-pulse border border-[#2B1E16]/10 p-4">
                <div className="bg-[#EAE1D9] h-52 rounded-lg mb-4" />
                <div className="h-4 bg-[#EAE1D9] rounded w-3/4 mb-2" />
                <div className="h-3 bg-[#EAE1D9] rounded w-1/2 mb-4" />
                <div className="h-16 bg-[#EAE1D9] rounded mb-4" />
              </div>
            ))}
          </div>
        ) : filteredRooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-[#2B1E16]/10 p-8 max-w-lg mx-auto">
            <h3 className="font-serif text-2xl text-[#1C130D] mb-2">No Matching Chambers Found</h3>
            <p className="text-xs sm:text-sm text-[#2B1E16]/70 mb-6">
              Try adjusting your guest count or filters to discover other available rooms at ASVILLA.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setMinPrice(0);
                setMaxPrice(20000);
              }}
              className="px-4 py-2 text-xs font-semibold text-[#1C130D] bg-[#F5EFEB] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                onViewDetails={onViewDetails}
                onBookNow={onBookNow}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};
