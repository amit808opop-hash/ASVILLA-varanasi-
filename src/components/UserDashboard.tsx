import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hotelService } from '../services/hotelService';
import { Booking } from '../types/hotel';
import {
  CalendarCheck,
  User,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  ChevronRight,
  Printer,
  ShieldCheck,
  CreditCard,
  QrCode
} from 'lucide-react';

interface UserDashboardProps {
  onBackToHome: () => void;
  onBookNew: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onBackToHome, onBookNew }) => {
  const { profile, signOut, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'bookings' | 'profile'>('bookings');

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Profile edit states
  const [name, setName] = useState(profile?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Cancel booking modal
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    loadUserBookings();
  }, [profile]);

  const loadUserBookings = async () => {
    setLoading(true);
    try {
      const userBookings = await hotelService.getBookings(profile?.id, profile?.email);
      setBookings(userBookings);
    } catch (e) {
      console.warn('Error loading bookings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg(null);
    const res = await updateProfile(name, phone);
    setProfileSaving(false);
    if (res.success) {
      setProfileMsg('Profile updated successfully.');
      setTimeout(() => setProfileMsg(null), 3000);
    } else {
      setProfileMsg(res.error || 'Failed to update profile.');
    }
  };

  const handleCancelBooking = async () => {
    if (!cancellingBookingId) return;
    setCancelLoading(true);
    try {
      await hotelService.cancelBooking(cancellingBookingId);
      await loadUserBookings();
      if (selectedBooking?.id === cancellingBookingId) {
        setSelectedBooking((prev) => (prev ? { ...prev, booking_status: 'Cancelled' } : null));
      }
      setCancellingBookingId(null);
    } catch (e) {
      console.warn('Cancellation failed:', e);
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="py-10 bg-[#FAF8F5] min-h-[85vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2B1E16]/10 mb-8">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#9E7D47]">
              Guest Sanctuary
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1C130D]">
              Welcome, {profile?.full_name || 'Valued Guest'}
            </h1>
            <p className="text-xs sm:text-sm text-[#2B1E16]/70 mt-1">
              Manage your ASVILLA room reservations, stay records, and personal account details.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBookNew}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
            >
              Book Another Room
            </button>
            <button
              onClick={signOut}
              className="px-3.5 py-2 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#2B1E16]/10 mb-8">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-2 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition-colors inline-flex items-center gap-2 ${
              activeTab === 'bookings'
                ? 'border-[#9E7D47] text-[#9E7D47]'
                : 'border-transparent text-[#2B1E16]/65 hover:text-[#1C130D]'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Bookings ({bookings.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-2 text-sm font-semibold tracking-wide border-b-2 cursor-pointer transition-colors inline-flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#9E7D47] text-[#9E7D47]'
                : 'border-transparent text-[#2B1E16]/65 hover:text-[#1C130D]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Guest Profile</span>
          </button>
        </div>

        {/* Tab 1: Bookings */}
        {activeTab === 'bookings' && (
          <div>
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin w-8 h-8 border-3 border-[#9E7D47] border-t-transparent rounded-full mb-3" />
                <p className="text-xs text-[#2B1E16]/70">Retrieving your room bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-[#2B1E16]/10 p-8 max-w-md mx-auto shadow-sm">
                <CalendarCheck className="w-12 h-12 text-[#9E7D47]/40 mx-auto mb-3" />
                <h3 className="font-serif text-xl font-medium text-[#1C130D] mb-1">
                  No Reservations Found
                </h3>
                <p className="text-xs text-[#2B1E16]/70 mb-6">
                  You haven't reserved any rooms at ASVILLA yet. Browse our heritage suites to plan your stay.
                </p>
                <button
                  onClick={onBookNew}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
                >
                  Explore Available Rooms
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="bg-white rounded-xl border border-[#2B1E16]/10 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    
                    {/* Left details */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[#9E7D47] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#2B1E16]/10">
                          {booking.booking_reference}
                        </span>
                        
                        {/* Status Label (Clean text label without candy pills) */}
                        <span className="font-medium text-[#2B1E16]/70">·</span>
                        <span
                          className={`font-semibold inline-flex items-center gap-1 ${
                            booking.booking_status === 'Confirmed'
                              ? 'text-emerald-700'
                              : booking.booking_status === 'Cancelled'
                              ? 'text-red-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {booking.booking_status === 'Confirmed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {booking.booking_status === 'Cancelled' && <XCircle className="w-3.5 h-3.5" />}
                          {booking.booking_status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                          <span>Booking: {booking.booking_status}</span>
                        </span>

                        <span className="font-medium text-[#2B1E16]/70">·</span>
                        <span className="font-medium text-[#2B1E16]/70 inline-flex items-center gap-1">
                          {booking.payment_method === 'COD' ? (
                            <CreditCard className="w-3.5 h-3.5 text-[#9E7D47]" />
                          ) : (
                            <QrCode className="w-3.5 h-3.5 text-[#9E7D47]" />
                          )}
                          <span>Payment: {booking.payment_status}</span>
                        </span>
                      </div>

                      <h3 className="font-serif text-xl font-bold text-[#1C130D]">
                        {booking.room?.room_name || 'ASVILLA Heritage Chamber'}
                      </h3>

                      <div className="text-xs text-[#2B1E16]/75 flex flex-wrap items-center gap-3">
                        <span>Check-In: <strong>{booking.check_in}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>Check-Out: <strong>{booking.check_out}</strong></span>
                        <span aria-hidden="true">·</span>
                        <span>{booking.total_nights} Night{booking.total_nights === 1 ? '' : 's'}</span>
                        <span aria-hidden="true">·</span>
                        <span>{booking.adults} Adult{booking.adults > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Right Price & Actions */}
                    <div className="flex sm:items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#2B1E16]/10">
                      <div className="text-left md:text-right">
                        <div className="text-[11px] text-[#2B1E16]/60 uppercase font-semibold">Total Price</div>
                        <div className="font-serif text-xl font-bold text-[#9E7D47]">
                          ₹{booking.total_amount.toLocaleString('en-IN')}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="px-3.5 py-2 text-xs font-semibold text-[#2B1E16] bg-[#FAF8F5] hover:bg-[#EAE1D9] border border-[#2B1E16]/15 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1"
                        >
                          <span>Details</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        {booking.booking_status !== 'Cancelled' && (
                          <button
                            onClick={() => setCancellingBookingId(booking.id)}
                            className="px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            Cancel Stay
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Profile */}
        {activeTab === 'profile' && (
          <div className="max-w-xl bg-white rounded-xl border border-[#2B1E16]/10 p-6 sm:p-8 shadow-sm">
            <h3 className="font-serif text-xl font-semibold text-[#1C130D] mb-4">
              Personal Information
            </h3>

            {profileMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                {profileMsg}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Email Address (Read-only)
                </label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ''}
                  className="w-full px-3.5 py-2 text-sm bg-gray-100 border border-[#2B1E16]/15 rounded-lg text-[#2B1E16]/60 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Mobile / Contact Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={profileSaving}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  {profileSaving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 overflow-hidden my-8 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#2B1E16]/10 pb-3">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#9E7D47]">
                  Booking Reference
                </span>
                <h3 className="font-mono text-lg font-bold text-[#1C130D]">
                  {selectedBooking.booking_reference}
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-1 text-[#2B1E16]/60 hover:text-[#1C130D]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Chamber Category</span>
                <span className="font-semibold text-[#1C130D]">{selectedBooking.room?.room_name || 'ASVILLA Room'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Check-in Date</span>
                <span className="font-medium text-[#1C130D]">{selectedBooking.check_in} (from 12:00 PM)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Check-out Date</span>
                <span className="font-medium text-[#1C130D]">{selectedBooking.check_out} (until 11:00 AM)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Nights Booked</span>
                <span className="text-[#1C130D]">{selectedBooking.total_nights} Night{selectedBooking.total_nights === 1 ? '' : 's'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Guests</span>
                <span className="text-[#1C130D]">{selectedBooking.adults} Adults, {selectedBooking.children} Children</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Payment Method</span>
                <span className="font-medium text-[#1C130D]">
                  {selectedBooking.payment_method === 'COD' ? 'Pay at Hotel (COD)' : 'UPI QR Payment'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                <span className="text-[#2B1E16]/65">Payment Status</span>
                <span className="font-semibold text-amber-800">{selectedBooking.payment_status}</span>
              </div>
              {selectedBooking.transaction_reference && (
                <div className="flex justify-between py-1 border-b border-[#2B1E16]/5">
                  <span className="text-[#2B1E16]/65">UPI Transaction UTR</span>
                  <span className="font-mono font-medium text-[#1C130D]">{selectedBooking.transaction_reference}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 text-base font-semibold text-[#1C130D]">
                <span>Total Amount</span>
                <span className="font-serif text-lg text-[#9E7D47]">
                  ₹{selectedBooking.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t border-[#2B1E16]/10">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold text-[#2B1E16] bg-[#FAF8F5] hover:bg-[#EAE1D9] border border-[#2B1E16]/15 rounded-lg inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex-1 py-2 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Cancellation Confirmation Dialog */}
      {cancellingBookingId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 p-6 space-y-4">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h3 className="font-serif text-xl font-bold text-[#1C130D] mb-1">
                Cancel This Reservation?
              </h3>
              <p className="text-xs text-[#2B1E16]/75">
                According to ASVILLA's cancellation policy, cancellations made prior to arrival incur zero penalty. This room will be released back to the general inventory.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancellingBookingId(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-[#2B1E16] bg-[#FAF8F5] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
              >
                Keep Reservation
              </button>
              <button
                type="button"
                disabled={cancelLoading}
                onClick={handleCancelBooking}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-red-700 hover:bg-red-800 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                {cancelLoading ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
