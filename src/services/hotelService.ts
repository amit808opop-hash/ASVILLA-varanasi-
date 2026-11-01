import { supabase } from '../lib/supabase';
import { Room, Booking, PaymentRecord, BookingFormData, PaymentStatus, BookingStatus, UserProfile } from '../types/hotel';

// Default initial ASVILLA rooms in Varanasi
export const INITIAL_ROOMS: Room[] = [
  {
    id: 'room-1',
    room_name: 'Maharaja Heritage Suite',
    slug: 'maharaja-heritage-suite',
    description: 'Our premier sanctuary features handcrafted teakwood archways, authentic Varanasi brocade silks, a private sitting lounge, and high carved ceilings inspired by 18th-century royal havelis.',
    price_per_night: 12500,
    max_guests: 3,
    bed_type: 'Royal Teak King Bed',
    room_size: '680 sq.ft',
    image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'Private Heritage Balcony',
      'Deep Soaking Tub',
      'Complimentary Gourmet Breakfast',
      'High-Speed Wi-Fi',
      '24/7 Butler Service',
      'Artisanal Tea & Espresso Bar',
      'Climate Control AC',
      'Electronic Safe'
    ],
    is_active: true,
  },
  {
    id: 'room-2',
    room_name: 'Kashi Courtyard Deluxe',
    slug: 'kashi-courtyard-deluxe',
    description: 'A serene ground-floor haven that opens towards ASVILLA’s tranquil fountain courtyard. Bathed in morning sunshine with custom brass lanterns and crisp Egyptian cotton linens.',
    price_per_night: 8200,
    max_guests: 2,
    bed_type: 'Heritage King Bed',
    room_size: '480 sq.ft',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'Courtyard View',
      'Walk-in Rain Shower',
      'Artisanal Toiletries',
      'High-Speed Wi-Fi',
      'Complimentary Breakfast',
      'Daily Housekeeping',
      'Smart LED TV'
    ],
    is_active: true,
  },
  {
    id: 'room-3',
    room_name: 'Ganges Royal Executive',
    slug: 'ganges-royal-executive',
    description: 'Designed for discerning travelers and long-stay guests, offering a solid rosewood writing desk, hand-woven carpets, vintage brass accents, and a calm, contemplative atmosphere.',
    price_per_night: 9800,
    max_guests: 2,
    bed_type: 'Carved Wood King Bed',
    room_size: '540 sq.ft',
    image_url: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'Executive Work Desk',
      'Panoramic Arch Window',
      'Complimentary Breakfast',
      'High-Speed Wi-Fi',
      'Tea & Coffee Selection',
      'Evening Turn-down Service',
      'Bathrobes & Slippers'
    ],
    is_active: true,
  },
  {
    id: 'room-4',
    room_name: 'Mansion Classic Room',
    slug: 'mansion-classic-room',
    description: 'An intimate, beautifully appointed bedroom marrying classic Indian heritage architecture with contemporary conveniences. Ideal for couples seeking a quiet retreat.',
    price_per_night: 5900,
    max_guests: 2,
    bed_type: 'Comfort Queen Bed',
    room_size: '380 sq.ft',
    image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      'Walk-in Shower',
      'High-Speed Wi-Fi',
      'Coffee & Tea Maker',
      'Climate Control AC',
      'Daily Housekeeping',
      'Mineral Water'
    ],
    is_active: true,
  },
  {
    id: 'room-5',
    room_name: 'Imperial Family Haveli Suite',
    slug: 'imperial-family-haveli-suite',
    description: 'Our most expansive heritage accommodation, featuring two connecting chambers, an ornate sitting room, dual bathrooms, and ample room for multi-generational travelers.',
    price_per_night: 15500,
    max_guests: 5,
    bed_type: '2 King Beds + Divan',
    room_size: '850 sq.ft',
    image_url: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
    facilities: [
      '2 En-suite Bathrooms',
      'Private Living Room',
      'Private Pantry',
      'Complimentary Breakfast',
      'Butler Service',
      'High-Speed Wi-Fi',
      'Luggage Dressing Area'
    ],
    is_active: true,
  }
];

// Local storage keys for resilient fallback / caching
const LOCAL_STORAGE_ROOMS = 'asvilla_rooms_v1';
const LOCAL_STORAGE_BOOKINGS = 'asvilla_bookings_v1';
const LOCAL_STORAGE_PAYMENTS = 'asvilla_payments_v1';

function getLocalRooms(): Room[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ROOMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return INITIAL_ROOMS;
}

function saveLocalRooms(rooms: Room[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

function getLocalBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_BOOKINGS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return [];
}

function saveLocalBookings(bookings: Booking[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

function getLocalPayments(): PaymentRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_PAYMENTS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
  return [];
}

function saveLocalPayments(payments: PaymentRecord[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_PAYMENTS, JSON.stringify(payments));
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

export const hotelService = {
  // Fetch all active rooms (or all rooms if admin)
  async getRooms(includeInactive = false): Promise<Room[]> {
    try {
      let query = supabase.from('rooms').select('*').order('price_per_night', { ascending: true });
      if (!includeInactive) {
        query = query.eq('is_active', true);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        // Cache to local
        saveLocalRooms(data);
        return data as Room[];
      }
    } catch (err) {
      console.warn('Supabase fetch rooms failed, using cached/initial:', err);
    }
    const local = getLocalRooms();
    return includeInactive ? local : local.filter(r => r.is_active);
  },

  async getRoomById(id: string): Promise<Room | null> {
    const rooms = await this.getRooms(true);
    return rooms.find(r => r.id === id) || null;
  },

  async addRoom(roomData: Omit<Room, 'id' | 'created_at'>): Promise<Room> {
    const newRoom: Room = {
      ...roomData,
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `room-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('rooms').insert([newRoom]).select().single();
      if (!error && data) {
        const local = getLocalRooms();
        saveLocalRooms([...local, data]);
        return data as Room;
      }
    } catch (err) {
      console.warn('Supabase add room failed, updating locally:', err);
    }

    const local = getLocalRooms();
    const updated = [...local, newRoom];
    saveLocalRooms(updated);
    return newRoom;
  },

  async updateRoom(id: string, updates: Partial<Room>): Promise<Room> {
    try {
      const { data, error } = await supabase.from('rooms').update(updates).eq('id', id).select().single();
      if (!error && data) {
        const local = getLocalRooms();
        const updated = local.map(r => (r.id === id ? { ...r, ...data } : r));
        saveLocalRooms(updated);
        return data as Room;
      }
    } catch (err) {
      console.warn('Supabase update room failed, updating locally:', err);
    }

    const local = getLocalRooms();
    const existing = local.find(r => r.id === id);
    if (!existing) throw new Error('Room not found');
    const updatedRoom = { ...existing, ...updates };
    const updated = local.map(r => (r.id === id ? updatedRoom : r));
    saveLocalRooms(updated);
    return updatedRoom;
  },

  async deleteRoom(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('rooms').delete().eq('id', id);
      if (!error) {
        const local = getLocalRooms();
        saveLocalRooms(local.filter(r => r.id !== id));
        return true;
      }
    } catch (err) {
      console.warn('Supabase delete room failed, deleting locally:', err);
    }

    const local = getLocalRooms();
    saveLocalRooms(local.filter(r => r.id !== id));
    return true;
  },

  // Check room availability for date range (prevents overlapping bookings)
  async checkRoomAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeBookingId?: string
  ): Promise<boolean> {
    if (!checkIn || !checkOut || checkIn >= checkOut) {
      return false;
    }

    // Attempt Supabase availability check
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('id, check_in, check_out, booking_status')
        .eq('room_id', roomId)
        .neq('booking_status', 'Cancelled');

      if (!error && data) {
        const conflict = data.some(b => {
          if (excludeBookingId && b.id === excludeBookingId) return false;
          // Overlap condition: NOT (existing_checkout <= new_checkin OR existing_checkin >= new_checkout)
          return !(b.check_out <= checkIn || b.check_in >= checkOut);
        });
        return !conflict;
      }
    } catch (err) {
      console.warn('Supabase availability check failed, using local check:', err);
    }

    // Fallback to local check
    const localBookings = getLocalBookings();
    const conflict = localBookings.some(b => {
      if (b.room_id !== roomId) return false;
      if (b.booking_status === 'Cancelled') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;
      return !(b.check_out <= checkIn || b.check_in >= checkOut);
    });

    return !conflict;
  },

  // Create a new reservation
  async createBooking(formData: BookingFormData, userId?: string | null): Promise<Booking> {
    // 1. Mandatory Guest Authentication Check at Service Layer
    let effectiveUserId = userId || null;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        effectiveUserId = user.id;
      }
    } catch (e) {
      // ignore
    }

    if (!effectiveUserId) {
      throw new Error('Authentication required. Please sign in or create an account before completing your hotel reservation.');
    }

    const isAvailable = await this.checkRoomAvailability(formData.roomId, formData.checkIn, formData.checkOut);
    if (!isAvailable) {
      throw new Error('This room is not available for the selected dates. Please choose different dates or another room.');
    }

    const room = await this.getRoomById(formData.roomId);
    if (!room) {
      throw new Error('Selected room could not be found.');
    }

    const checkInDate = new Date(formData.checkIn);
    const checkOutDate = new Date(formData.checkOut);
    const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
    const totalNights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const totalAmount = totalNights * room.price_per_night;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingReference = `ASV-${new Date().getFullYear()}-${randomSuffix}`;
    const bookingId = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `book-${Date.now()}`;

    const paymentStatus: PaymentStatus =
      formData.paymentMethod === 'UPI' ? 'Awaiting Verification' : 'Pending';

    const bookingStatus: BookingStatus = 'Confirmed';

    const newBooking: Booking = {
      id: bookingId,
      booking_reference: bookingReference,
      user_id: effectiveUserId,
      room_id: formData.roomId,
      guest_name: formData.guestName,
      guest_email: formData.guestEmail,
      guest_phone: formData.guestPhone,
      check_in: formData.checkIn,
      check_out: formData.checkOut,
      adults: formData.adults,
      children: formData.children,
      total_nights: totalNights,
      total_amount: totalAmount,
      payment_method: formData.paymentMethod,
      payment_status: paymentStatus,
      booking_status: bookingStatus,
      transaction_reference: formData.transactionReference || '',
      created_at: new Date().toISOString(),
      room,
    };

    // Save to Supabase
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert([{
          id: newBooking.id,
          booking_reference: newBooking.booking_reference,
          user_id: newBooking.user_id,
          room_id: newBooking.room_id,
          guest_name: newBooking.guest_name,
          guest_email: newBooking.guest_email,
          guest_phone: newBooking.guest_phone,
          check_in: newBooking.check_in,
          check_out: newBooking.check_out,
          adults: newBooking.adults,
          children: newBooking.children,
          total_nights: newBooking.total_nights,
          total_amount: newBooking.total_amount,
          payment_method: newBooking.payment_method,
          payment_status: newBooking.payment_status,
          booking_status: newBooking.booking_status,
        }])
        .select()
        .single();

      if (!error && data) {
        // Also insert payment record
        await supabase.from('payments').insert([{
          booking_id: newBooking.id,
          user_id: newBooking.user_id,
          amount: newBooking.total_amount,
          payment_method: newBooking.payment_method,
          transaction_reference: newBooking.transaction_reference,
          payment_status: newBooking.payment_status,
        }]);
      }
    } catch (err) {
      console.warn('Supabase booking creation failed, continuing with local store:', err);
    }

    // Always maintain local cache
    const localBookings = getLocalBookings();
    saveLocalBookings([newBooking, ...localBookings]);

    const localPayments = getLocalPayments();
    const newPayment: PaymentRecord = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `pay-${Date.now()}`,
      booking_id: newBooking.id,
      user_id: newBooking.user_id,
      amount: newBooking.total_amount,
      payment_method: newBooking.payment_method,
      transaction_reference: newBooking.transaction_reference,
      payment_status: newBooking.payment_status,
      created_at: new Date().toISOString(),
    };
    saveLocalPayments([newPayment, ...localPayments]);

    return newBooking;
  },

  // Get user bookings or all bookings
  async getBookings(userId?: string | null, email?: string | null): Promise<Booking[]> {
    try {
      let query = supabase.from('bookings').select('*, room:rooms(*)').order('created_at', { ascending: false });
      if (userId) {
        query = query.eq('user_id', userId);
      } else if (email) {
        query = query.eq('guest_email', email);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data as Booking[];
      }
    } catch (err) {
      console.warn('Supabase getBookings failed, reading local:', err);
    }

    const local = getLocalBookings();
    if (userId) {
      return local.filter(b => b.user_id === userId);
    }
    if (email) {
      return local.filter(b => b.guest_email.toLowerCase() === email.toLowerCase());
    }
    return local;
  },

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: 'Cancelled' })
        .eq('id', bookingId);
      if (!error) {
        // also update local
        const local = getLocalBookings();
        saveLocalBookings(local.map(b => (b.id === bookingId ? { ...b, booking_status: 'Cancelled' } : b)));
        return true;
      }
    } catch (err) {
      console.warn('Supabase cancel failed, updating local:', err);
    }

    const local = getLocalBookings();
    saveLocalBookings(local.map(b => (b.id === bookingId ? { ...b, booking_status: 'Cancelled' } : b)));
    return true;
  },

  // Update booking status by admin
  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<boolean> {
    try {
      await supabase.from('bookings').update({ booking_status: status }).eq('id', bookingId);
    } catch (err) {
      console.warn('Supabase updateBookingStatus error:', err);
    }

    const local = getLocalBookings();
    saveLocalBookings(local.map(b => (b.id === bookingId ? { ...b, booking_status: status } : b)));
    return true;
  },

  // Update payment status (e.g. verify UPI payment or confirm COD received)
  async updatePaymentStatus(
    bookingId: string,
    status: PaymentStatus,
    transactionReference?: string
  ): Promise<boolean> {
    try {
      const now = status === 'Paid' ? new Date().toISOString() : null;
      await supabase
        .from('bookings')
        .update({ payment_status: status })
        .eq('id', bookingId);

      await supabase
        .from('payments')
        .update({
          payment_status: status,
          verified_at: now,
          ...(transactionReference ? { transaction_reference: transactionReference } : {}),
        })
        .eq('booking_id', bookingId);
    } catch (err) {
      console.warn('Supabase updatePaymentStatus error:', err);
    }

    const localBookings = getLocalBookings();
    saveLocalBookings(
      localBookings.map(b => (b.id === bookingId ? { ...b, payment_status: status } : b))
    );

    const localPayments = getLocalPayments();
    saveLocalPayments(
      localPayments.map(p =>
        p.booking_id === bookingId
          ? {
              ...p,
              payment_status: status,
              verified_at: status === 'Paid' ? new Date().toISOString() : null,
              ...(transactionReference ? { transaction_reference: transactionReference } : {}),
            }
          : p
      )
    );
    return true;
  },

  // Fetch all payments for admin
  async getPayments(): Promise<PaymentRecord[]> {
    try {
      const { data, error } = await supabase.from('payments').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return data as PaymentRecord[];
      }
    } catch (err) {
      console.warn('Supabase getPayments error:', err);
    }
    return getLocalPayments();
  },

  // Fetch user profiles for admin
  async getProfiles(): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data as UserProfile[];
      }
    } catch (err) {
      console.warn('Supabase getProfiles error:', err);
    }
    return [];
  }
};
