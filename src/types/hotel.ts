export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: UserRole;
  created_at: string;
}

export interface Room {
  id: string;
  room_name: string;
  slug: string;
  description: string;
  price_per_night: number;
  max_guests: number;
  bed_type: string;
  room_size: string;
  image_url: string;
  facilities: string[];
  is_active: boolean;
  created_at?: string;
}

export type PaymentMethod = 'COD' | 'UPI';
export type PaymentStatus = 'Pending' | 'Awaiting Verification' | 'Paid' | 'Refunded';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Completed';

export interface Booking {
  id: string;
  booking_reference: string;
  user_id?: string | null;
  room_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  adults: number;
  children: number;
  total_nights: number;
  total_amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  booking_status: BookingStatus;
  transaction_reference?: string;
  created_at: string;
  room?: Room;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  user_id?: string | null;
  amount: number;
  payment_method: PaymentMethod;
  transaction_reference?: string;
  payment_status: PaymentStatus;
  verified_at?: string | null;
  created_at: string;
}

export interface BookingFormData {
  roomId: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  paymentMethod: PaymentMethod;
  transactionReference?: string;
}
