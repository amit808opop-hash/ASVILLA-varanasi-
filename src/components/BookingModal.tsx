import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { Room, Booking, PaymentMethod } from '../types/hotel';
import { hotelService } from '../services/hotelService';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Calendar,
  Users,
  CreditCard,
  QrCode,
  Copy,
  Check,
  AlertCircle,
  Building,
  CheckCircle2,
  Clock,
  Printer
} from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRoom: Room | null;
  rooms: Room[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
  onBookingSuccess?: (booking: Booking) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  selectedRoom,
  rooms,
  initialCheckIn,
  initialCheckOut,
  initialGuests = 2,
  onBookingSuccess,
}) => {
  const { profile } = useAuth();

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(today.getDate() + 2);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const [roomId, setRoomId] = useState<string>(selectedRoom?.id || rooms[0]?.id || '');
  const [checkIn, setCheckIn] = useState<string>(initialCheckIn || formatDate(tomorrow));
  const [checkOut, setCheckOut] = useState<string>(initialCheckOut || formatDate(dayAfter));
  const [adults, setAdults] = useState<number>(initialGuests > 0 ? initialGuests : 2);
  const [children, setChildren] = useState<number>(0);

  // Guest details
  const [guestName, setGuestName] = useState<string>(profile?.full_name || '');
  const [guestEmail, setGuestEmail] = useState<string>(profile?.email || '');
  const [guestPhone, setGuestPhone] = useState<string>(profile?.phone || '');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Status & Confirmation
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // UPI configuration
  const UPI_ID = '8081144350-4@ybl';
  const HOTEL_NAME = 'ASVILLA';

  useEffect(() => {
    if (selectedRoom) {
      setRoomId(selectedRoom.id);
    }
  }, [selectedRoom]);

  useEffect(() => {
    if (profile) {
      if (!guestName && profile.full_name) setGuestName(profile.full_name);
      if (!guestEmail && profile.email) setGuestEmail(profile.email);
      if (!guestPhone && profile.phone) setGuestPhone(profile.phone);
    }
  }, [profile]);

  const activeRoom = rooms.find((r) => r.id === roomId) || selectedRoom || rooms[0];

  // Calculate nights & amount
  const calculateNights = () => {
    if (!checkIn || !checkOut || checkIn >= checkOut) return 1;
    const d1 = new Date(checkIn);
    const d2 = new Date(checkOut);
    const diff = Math.abs(d2.getTime() - d1.getTime());
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const totalNights = calculateNights();
  const totalAmount = (activeRoom ? activeRoom.price_per_night : 0) * totalNights;

  // Generate UPI QR Code on Canvas when UPI is selected
  useEffect(() => {
    if (paymentMethod === 'UPI' && qrCanvasRef.current && totalAmount > 0) {
      // Standard NPCI UPI URI string format:
      // upi://pay?pa=8081144350-4@ybl&pn=ASVILLA&am=12500&cu=INR&tn=ASVILLA-Hotel-Reservation
      const upiUrl = `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(HOTEL_NAME)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('ASVILLA Hotel Room Booking')}`;

      QRCode.toCanvas(qrCanvasRef.current, upiUrl, {
        width: 180,
        margin: 2,
        color: {
          dark: '#1C130D',
          light: '#FFFFFF',
        },
      }).catch((err) => {
        console.error('QR code generation error:', err);
      });
    }
  }, [paymentMethod, totalAmount, activeRoom]);

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 3000);
    }
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!activeRoom) {
      setErrorMessage('Please select a valid room.');
      return;
    }

    if (!checkIn || !checkOut || checkIn >= checkOut) {
      setErrorMessage('Check-out date must be strictly after check-in date.');
      return;
    }

    if (!guestName.trim() || !guestEmail.trim() || !guestPhone.trim()) {
      setErrorMessage('Please provide your complete name, email, and phone number.');
      return;
    }

    if (paymentMethod === 'UPI' && !transactionRef.trim()) {
      setErrorMessage('Please enter your UPI Transaction / UTR Reference Number after paying.');
      return;
    }

    setLoading(true);

    try {
      const created = await hotelService.createBooking(
        {
          roomId: activeRoom.id,
          checkIn,
          checkOut,
          adults,
          children,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim(),
          paymentMethod,
          transactionReference: transactionRef.trim(),
        },
        profile?.id || null
      );

      setConfirmedBooking(created);
      if (onBookingSuccess) {
        onBookingSuccess(created);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to complete reservation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setConfirmedBooking(null);
    setErrorMessage(null);
    setTransactionRef('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 overflow-hidden my-8">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#2B1E16]/10 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#9E7D47]">
              ASVILLA Varanasi
            </div>
            <h2 className="font-serif text-xl sm:text-2xl font-semibold text-[#1C130D]">
              {confirmedBooking ? 'Reservation Confirmed' : 'Room Reservation'}
            </h2>
          </div>
          <button
            onClick={handleReset}
            className="p-1.5 text-[#2B1E16]/60 hover:text-[#1C130D] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          
          {confirmedBooking ? (
            /* Confirmation View */
            <div className="space-y-6">
              <div className="p-6 bg-[#9E7D47]/10 rounded-xl border border-[#9E7D47]/30 text-center">
                <CheckCircle2 className="w-12 h-12 text-[#9E7D47] mx-auto mb-3" />
                <h3 className="font-serif text-2xl font-bold text-[#1C130D] mb-1">
                  Thank You, {confirmedBooking.guest_name}!
                </h3>
                <p className="text-xs text-[#2B1E16]/75">
                  Your reservation request at ASVILLA has been registered.
                </p>

                <div className="mt-4 inline-block bg-white px-4 py-2 rounded-lg border border-[#9E7D47]/40 shadow-xs">
                  <div className="text-[10px] font-semibold uppercase tracking-widest text-[#2B1E16]/60">
                    Booking Reference ID
                  </div>
                  <div className="text-lg font-mono font-bold text-[#9E7D47] tracking-wider">
                    {confirmedBooking.booking_reference}
                  </div>
                </div>
              </div>

              {/* Receipt Summary Card */}
              <div className="bg-[#FAF8F5] rounded-xl p-5 border border-[#2B1E16]/10 text-xs sm:text-sm space-y-3">
                <div className="font-semibold text-xs uppercase tracking-wider text-[#9E7D47] border-b border-[#2B1E16]/10 pb-2">
                  Stay Summary
                </div>

                <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                  <span className="text-[#2B1E16]/70">Room Category</span>
                  <span className="font-semibold text-[#1C130D]">{confirmedBooking.room?.room_name || activeRoom?.room_name}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                  <span className="text-[#2B1E16]/70">Dates</span>
                  <span className="font-medium text-[#1C130D]">
                    {confirmedBooking.check_in} to {confirmedBooking.check_out} ({confirmedBooking.total_nights} Night{confirmedBooking.total_nights === 1 ? '' : 's'})
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                  <span className="text-[#2B1E16]/70">Guests</span>
                  <span className="text-[#1C130D]">
                    {confirmedBooking.adults} Adult{confirmedBooking.adults === 1 ? '' : 's'}{confirmedBooking.children > 0 ? `, ${confirmedBooking.children} Child` : ''}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                  <span className="text-[#2B1E16]/70">Payment Method</span>
                  <span className="font-medium text-[#1C130D]">
                    {confirmedBooking.payment_method === 'COD' ? 'Pay at Hotel (COD)' : 'UPI QR Payment'}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                  <span className="text-[#2B1E16]/70">Payment Status</span>
                  <span className="font-semibold text-amber-800">
                    {confirmedBooking.payment_status}
                  </span>
                </div>

                <div className="flex justify-between pt-2 text-base font-semibold text-[#1C130D]">
                  <span>Total Amount</span>
                  <span className="font-serif text-lg text-[#9E7D47]">
                    ₹{confirmedBooking.total_amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Informational Guidance */}
              <div className="p-4 bg-amber-50/70 rounded-lg border border-amber-200/60 text-xs text-amber-900 leading-relaxed">
                <div className="font-semibold mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-800" />
                  <span>Important Arrival Instructions</span>
                </div>
                Please present a government-issued photo ID at check-in (12:00 PM). If you selected UPI QR, our front desk verifies the transaction reference with the bank on arrival. For Pay at Hotel, cash/card/UPI is accepted at the front desk.
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 text-xs font-semibold text-[#2B1E16] bg-[#FAF8F5] hover:bg-[#EAE1D9] border border-[#2B1E16]/15 rounded-lg transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2.5 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
                >
                  Close &amp; Return
                </button>
              </div>
            </div>
          ) : (
            /* Booking Entry Form */
            <form onSubmit={handleBookingSubmit} className="space-y-6">
              
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Step 1: Select Chamber & Dates */}
              <div className="space-y-4">
                <div className="font-semibold text-xs uppercase tracking-wider text-[#9E7D47] border-b border-[#2B1E16]/10 pb-1.5 flex items-center gap-2">
                  <Building className="w-4 h-4" />
                  <span>Step 1: Chamber &amp; Reservation Dates</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Select Chamber Category *
                  </label>
                  <select
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  >
                    {rooms.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.room_name} — ₹{r.price_per_night.toLocaleString('en-IN')}/night (Max {r.max_guests} Guests)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Check-in Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        required
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
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Check-out Date *
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        required
                        value={checkOut}
                        min={checkIn}
                        onChange={(e) => setCheckOut(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Adults
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={adults}
                        onChange={(e) => setAdults(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n} Adult{n > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Children (0-12 yrs)
                    </label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(Number(e.target.value))}
                      className="w-full px-3 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                    >
                      {[0, 1, 2, 3].map((n) => (
                        <option key={n} value={n}>
                          {n} Child{n > 1 ? 'ren' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Guest Details */}
              <div className="space-y-4 pt-2">
                <div className="font-semibold text-xs uppercase tracking-wider text-[#9E7D47] border-b border-[#2B1E16]/10 pb-1.5">
                  Step 2: Guest Contact Details
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Guest Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra Maurya"
                    className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="guest@example.com"
                      className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                      Phone / Mobile *
                    </label>
                    <input
                      type="tel"
                      required
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                    />
                  </div>
                </div>
              </div>

              {/* Price Calculation Summary Strip */}
              <div className="bg-[#FAF8F5] rounded-xl p-4 border border-[#2B1E16]/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#2B1E16]/70">
                    ₹{activeRoom?.price_per_night.toLocaleString('en-IN')} × {totalNights} Night{totalNights === 1 ? '' : 's'}
                  </div>
                  <div className="text-xs text-[#2B1E16]/50">Includes all taxes &amp; morning breakfast</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-[#2B1E16]/60 font-semibold uppercase">Total Room Price</div>
                  <div className="font-serif text-xl sm:text-2xl font-bold text-[#9E7D47]">
                    ₹{totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Step 3: Payment Method Selection */}
              <div className="space-y-4 pt-2">
                <div className="font-semibold text-xs uppercase tracking-wider text-[#9E7D47] border-b border-[#2B1E16]/10 pb-1.5">
                  Step 3: Select Payment Method
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Option 1: COD / Pay at Hotel */}
                  <label
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'COD'
                        ? 'border-[#9E7D47] bg-[#9E7D47]/5 shadow-xs'
                        : 'border-[#2B1E16]/15 bg-white hover:border-[#2B1E16]/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-[#1C130D] flex items-center gap-1.5">
                          <CreditCard className="w-4 h-4 text-[#9E7D47]" />
                          <span>Pay at Hotel (COD)</span>
                        </span>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'COD'}
                          onChange={() => setPaymentMethod('COD')}
                          className="text-[#9E7D47] focus:ring-[#9E7D47]"
                        />
                      </div>
                      <p className="text-xs text-[#2B1E16]/70 leading-relaxed">
                        Reserve now without immediate online payment. Pay total upon arrival at ASVILLA via cash, card, or UPI.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-medium text-emerald-800">
                      Payment Status: Pending at Check-in
                    </div>
                  </label>

                  {/* Option 2: UPI QR Payment */}
                  <label
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === 'UPI'
                        ? 'border-[#9E7D47] bg-[#9E7D47]/5 shadow-xs'
                        : 'border-[#2B1E16]/15 bg-white hover:border-[#2B1E16]/30'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-semibold text-sm text-[#1C130D] flex items-center gap-1.5">
                          <QrCode className="w-4 h-4 text-[#9E7D47]" />
                          <span>UPI QR Payment</span>
                        </span>
                        <input
                          type="radio"
                          name="payment"
                          checked={paymentMethod === 'UPI'}
                          onChange={() => setPaymentMethod('UPI')}
                          className="text-[#9E7D47] focus:ring-[#9E7D47]"
                        />
                      </div>
                      <p className="text-xs text-[#2B1E16]/70 leading-relaxed">
                        Scan the dynamic UPI QR with PhonePe, Google Pay, Paytm, or BHIM. Verified before check-in.
                      </p>
                    </div>
                    <div className="mt-3 text-[11px] font-medium text-amber-800">
                      Payment Status: Awaiting Verification
                    </div>
                  </label>

                </div>

                {/* UPI Interactive Section if UPI selected */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 sm:p-5 bg-[#FAF8F5] rounded-xl border border-[#9E7D47]/30 space-y-4">
                    <div className="text-center sm:flex sm:items-center sm:gap-6">
                      
                      {/* Live Dynamic QR Code Canvas */}
                      <div className="inline-block p-2 bg-white rounded-lg border border-[#2B1E16]/10 shadow-xs mb-3 sm:mb-0">
                        <canvas ref={qrCanvasRef} className="w-[160px] h-[160px] mx-auto" />
                        <div className="text-[10px] text-center text-[#2B1E16]/60 mt-1 font-mono">
                          Scan to Pay ₹{totalAmount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* UPI Details & Copy Button */}
                      <div className="text-left space-y-2 flex-1">
                        <div>
                          <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Hotel Account Name</div>
                          <div className="font-serif text-lg font-bold text-[#1C130D]">{HOTEL_NAME}</div>
                        </div>

                        <div>
                          <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Official Hotel UPI ID</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-sm font-semibold bg-white px-2.5 py-1 rounded border border-[#2B1E16]/15 text-[#1C130D]">
                              {UPI_ID}
                            </span>
                            <button
                              type="button"
                              onClick={handleCopyUpi}
                              className="px-2.5 py-1 text-xs font-semibold text-[#1C130D] bg-white hover:bg-[#EAE1D9] border border-[#2B1E16]/15 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              {copiedUpi ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700">Copied!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5 text-[#9E7D47]" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="text-[11px] text-[#2B1E16]/70 leading-relaxed pt-1">
                          Exact Amount to transfer: <strong className="text-[#1C130D]">₹{totalAmount.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                    </div>

                    {/* UTR / Transaction Reference Input */}
                    <div className="pt-3 border-t border-[#2B1E16]/10">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/80 mb-1">
                        UPI Transaction / UTR Reference ID *
                      </label>
                      <input
                        type="text"
                        required={paymentMethod === 'UPI'}
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        placeholder="e.g. 429381920194 or UPI Ref ID"
                        className="w-full px-3.5 py-2 text-sm bg-white border border-[#2B1E16]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D] font-mono"
                      />
                      <p className="text-[11px] text-[#2B1E16]/60 mt-1">
                        Note: Your booking will be marked as "Awaiting Verification" until the front desk verifies the bank record.
                      </p>
                    </div>

                  </div>
                )}

              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-[#2B1E16]/10 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-semibold text-[#2B1E16] hover:bg-[#FAF8F5] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50"
                >
                  {loading
                    ? 'Confirming Reservation...'
                    : paymentMethod === 'COD'
                    ? 'Confirm Reservation (Pay at Hotel)'
                    : 'Submit UPI Payment & Confirm'}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
