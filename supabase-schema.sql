-- ==============================================================================
-- ASVILLA Varanasi Hotel Booking System - Complete Supabase Schema
-- Run this script in the Supabase SQL Editor (https://kidfjovrvpscsatjahlf.supabase.co)
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Create ROOMS Table
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night > 0),
  max_guests INT NOT NULL DEFAULT 2 CHECK (max_guests > 0),
  bed_type TEXT NOT NULL DEFAULT 'King Bed',
  room_size TEXT NOT NULL DEFAULT '450 sq.ft',
  image_url TEXT NOT NULL,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Create BOOKINGS Table
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_reference TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE RESTRICT,
  guest_name TEXT NOT NULL,
  guest_email TEXT NOT NULL,
  guest_phone TEXT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  adults INT NOT NULL DEFAULT 1 CHECK (adults > 0),
  children INT NOT NULL DEFAULT 0 CHECK (children >= 0),
  total_nights INT NOT NULL CHECK (total_nights > 0),
  total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'UPI')),
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Awaiting Verification', 'Paid', 'Refunded')),
  booking_status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (booking_status IN ('Confirmed', 'Pending', 'Cancelled', 'Completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT valid_booking_dates CHECK (check_out > check_in)
);

-- 5. Create PAYMENTS Table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('COD', 'UPI')),
  transaction_reference TEXT,
  payment_status TEXT NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Awaiting Verification', 'Paid', 'Refunded')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- 6. AVAILABILITY CHECK & OVERLAP PREVENTION (Backend Database Function)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.check_room_available(
  target_room_id UUID,
  check_in_date DATE,
  check_out_date DATE,
  exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  conflict_count INT;
BEGIN
  SELECT COUNT(*)
  INTO conflict_count
  FROM public.bookings
  WHERE room_id = target_room_id
    AND booking_status NOT IN ('Cancelled')
    AND (exclude_booking_id IS NULL OR id <> exclude_booking_id)
    AND NOT (check_out <= check_in_date OR check_in >= check_out_date);

  RETURN conflict_count = 0;
END;
$$;

-- Trigger to reject overlapping bookings at database level
CREATE OR REPLACE FUNCTION public.prevent_double_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.booking_status <> 'Cancelled' THEN
    IF NOT public.check_room_available(NEW.room_id, NEW.check_in, NEW.check_out, NEW.id) THEN
      RAISE EXCEPTION 'Room is already booked for the selected dates (% to %).', NEW.check_in, NEW.check_out;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_double_booking ON public.bookings;
CREATE TRIGGER trg_prevent_double_booking
BEFORE INSERT OR UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.prevent_double_booking();

-- ==============================================================================
-- 7. AUTH TRIGGER: Auto-Create Profile on User Signup
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Guest User'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone = EXCLUDED.phone;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current authenticated user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- PROFILES Policies:
-- Users can read their own profile, Admins can read all profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Users can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id OR public.is_admin());

-- Users can update own profile (except role)
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND (role = 'user' OR public.is_admin()));

-- ROOMS Policies:
-- Anyone can view active rooms (public read)
DROP POLICY IF EXISTS "Anyone can view active rooms" ON public.rooms;
CREATE POLICY "Anyone can view active rooms" ON public.rooms
  FOR SELECT USING (true);

-- Admins can insert, update, delete rooms
DROP POLICY IF EXISTS "Admins can insert rooms" ON public.rooms;
CREATE POLICY "Admins can insert rooms" ON public.rooms
  FOR INSERT WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can update rooms" ON public.rooms;
CREATE POLICY "Admins can update rooms" ON public.rooms
  FOR UPDATE USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete rooms" ON public.rooms;
CREATE POLICY "Admins can delete rooms" ON public.rooms
  FOR DELETE USING (public.is_admin());

-- BOOKINGS Policies:
-- Users can view their own bookings, admins can view all bookings
DROP POLICY IF EXISTS "Users view own bookings" ON public.bookings;
CREATE POLICY "Users view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Anyone authenticated or guest can create booking
DROP POLICY IF EXISTS "Anyone can insert booking" ON public.bookings;
CREATE POLICY "Anyone can insert booking" ON public.bookings
  FOR INSERT WITH CHECK (true);

-- Users can cancel their own bookings, admins can update any booking
DROP POLICY IF EXISTS "Users can cancel own booking or admin update" ON public.bookings;
CREATE POLICY "Users can cancel own booking or admin update" ON public.bookings
  FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());

-- PAYMENTS Policies:
-- Users view own payments, admins view all
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments
  FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

-- Insert payment on booking creation
DROP POLICY IF EXISTS "Anyone can insert payment" ON public.payments;
CREATE POLICY "Anyone can insert payment" ON public.payments
  FOR INSERT WITH CHECK (true);

-- Only admins can update payment verification status
DROP POLICY IF EXISTS "Only admins can update payments" ON public.payments;
CREATE POLICY "Only admins can update payments" ON public.payments
  FOR UPDATE USING (public.is_admin());

-- ==============================================================================
-- 9. INITIAL SEED DATA FOR ASVILLA HOTEL ROOMS
-- ==============================================================================

INSERT INTO public.rooms (room_name, slug, description, price_per_night, max_guests, bed_type, room_size, image_url, facilities)
VALUES
(
  'Maharaja Heritage Suite',
  'maharaja-heritage-suite',
  'Our flagship heritage sanctuary featuring handcrafted rosewood furnishings, intricate arched jharokha bay windows, private sitting lounge, and authentic Varanasi silk upholstery.',
  12500.00,
  3,
  'Royal Teak King Bed',
  '680 sq.ft',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
  ARRAY['Heritage Balcony', 'Deep Soaking Tub', 'Complimentary Breakfast', 'High-Speed Wi-Fi', '24/7 Butler Service', 'Mini Bar', 'Climate Control AC', 'Smart LED TV']
),
(
  'Kashi Courtyard Deluxe',
  'kashi-courtyard-deluxe',
  'A peaceful and sun-drenched sanctuary opening directly toward the tranquil inner fountain courtyard. Features warm timber beams, artisanal brass reading lamps, and plush Egyptian cotton bedding.',
  8200.00,
  2,
  'Heritage King Bed',
  '480 sq.ft',
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
  ARRAY['Courtyard View', 'Rain Shower', 'Espresso Machine', 'High-Speed Wi-Fi', 'Handcrafted Toiletries', 'Climate Control AC', 'Safe Locker']
),
(
  'Ganges Royal Executive',
  'ganges-royal-executive',
  'Designed for discerning travelers, offering an expansive writing desk, hand-woven carpets, vintage brass accents, and serene natural light with timeless Varanasi architectural character.',
  9800.00,
  2,
  'Carved Wood King Bed',
  '540 sq.ft',
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
  ARRAY['Panoramic Window', 'Executive Workstation', 'Complimentary Breakfast', 'High-Speed Wi-Fi', 'Tea Selection', 'Turn-down Service']
),
(
  'Mansion Classic Room',
  'mansion-classic-room',
  'An intimate, beautifully restored heritage bedroom marrying classic Indian hospitality with contemporary comforts. Ideal for couples and solo heritage seekers.',
  5900.00,
  2,
  'Queen Bed',
  '380 sq.ft',
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80',
  ARRAY['Rain Shower', 'Complimentary High-Speed Wi-Fi', 'Coffee/Tea Maker', 'Daily Housekeeping', 'Air Conditioning']
),
(
  'Imperial Family Haveli Suite',
  'imperial-family-haveli-suite',
  'A palatial two-bedroom haveli suite tailored for families visiting Kashi. Boasts an ornate living room, dual bathrooms, artisanal stone carvings, and ample luggage space.',
  15500.00,
  5,
  '2 King Beds + Divan',
  '850 sq.ft',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  ARRAY['2 En-suite Bathrooms', 'Separate Living Room', 'Private Pantry', 'Butler Service', 'High-Speed Wi-Fi', 'Complimentary Breakfast']
)
ON CONFLICT (slug) DO NOTHING;
