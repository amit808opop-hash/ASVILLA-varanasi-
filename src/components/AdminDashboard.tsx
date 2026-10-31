import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { hotelService } from '../services/hotelService';
import { Room, Booking, PaymentRecord, UserProfile, BookingStatus, PaymentStatus } from '../types/hotel';
import {
  ShieldCheck,
  Building,
  CalendarCheck,
  CreditCard,
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Copy,
  Check,
  Database,
  RefreshCw,
  QrCode,
  LogOut
} from 'lucide-react';

interface AdminDashboardProps {
  onBackToHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToHome }) => {
  const { profile, isAdmin, signOut } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'rooms' | 'payments' | 'users' | 'supabase'>('overview');

  // Data states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & search
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState<string>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'COD' | 'UPI' | 'awaiting'>('all');

  // Room modal
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomFormData, setRoomFormData] = useState({
    room_name: '',
    slug: '',
    description: '',
    price_per_night: 8000,
    max_guests: 2,
    bed_type: 'Heritage King Bed',
    room_size: '450 sq.ft',
    image_url: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    facilities: 'Complimentary Breakfast, High-Speed Wi-Fi, Rain Shower, Climate Control AC',
    is_active: true,
  });

  // Action status feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [r, b, p, u] = await Promise.all([
        hotelService.getRooms(true),
        hotelService.getBookings(),
        hotelService.getPayments(),
        hotelService.getProfiles(),
      ]);
      setRooms(r);
      setBookings(b);
      setPayments(p);
      setUsers(u);
    } catch (err) {
      console.warn('Admin load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 3500);
  };

  // Stats calculation
  const totalBookings = bookings.length;
  const totalRooms = rooms.length;
  const activeRoomsCount = rooms.filter(r => r.is_active).length;
  const pendingBookings = bookings.filter(b => b.booking_status === 'Pending').length;
  const confirmedBookings = bookings.filter(b => b.booking_status === 'Confirmed').length;
  const awaitingUpiPayments = bookings.filter(b => b.payment_status === 'Awaiting Verification').length;
  const totalRevenue = bookings
    .filter(b => b.payment_status === 'Paid')
    .reduce((acc, curr) => acc + curr.total_amount, 0);

  // Room Management Actions
  const handleOpenAddRoom = () => {
    setEditingRoom(null);
    setRoomFormData({
      room_name: '',
      slug: '',
      description: '',
      price_per_night: 8500,
      max_guests: 2,
      bed_type: 'Heritage King Bed',
      room_size: '450 sq.ft',
      image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      facilities: 'Complimentary Breakfast, High-Speed Wi-Fi, Climate Control AC, Room Service',
      is_active: true,
    });
    setIsRoomModalOpen(true);
  };

  const handleOpenEditRoom = (room: Room) => {
    setEditingRoom(room);
    setRoomFormData({
      room_name: room.room_name,
      slug: room.slug,
      description: room.description,
      price_per_night: room.price_per_night,
      max_guests: room.max_guests,
      bed_type: room.bed_type,
      room_size: room.room_size,
      image_url: room.image_url,
      facilities: room.facilities.join(', '),
      is_active: room.is_active,
    });
    setIsRoomModalOpen(true);
  };

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const facilitiesArray = roomFormData.facilities
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const generatedSlug =
      roomFormData.slug ||
      roomFormData.room_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    try {
      if (editingRoom) {
        await hotelService.updateRoom(editingRoom.id, {
          room_name: roomFormData.room_name,
          slug: generatedSlug,
          description: roomFormData.description,
          price_per_night: Number(roomFormData.price_per_night),
          max_guests: Number(roomFormData.max_guests),
          bed_type: roomFormData.bed_type,
          room_size: roomFormData.room_size,
          image_url: roomFormData.image_url,
          facilities: facilitiesArray,
          is_active: roomFormData.is_active,
        });
        showNotification('Room updated successfully.');
      } else {
        await hotelService.addRoom({
          room_name: roomFormData.room_name,
          slug: generatedSlug,
          description: roomFormData.description,
          price_per_night: Number(roomFormData.price_per_night),
          max_guests: Number(roomFormData.max_guests),
          bed_type: roomFormData.bed_type,
          room_size: roomFormData.room_size,
          image_url: roomFormData.image_url,
          facilities: facilitiesArray,
          is_active: roomFormData.is_active,
        });
        showNotification('New room created successfully.');
      }
      setIsRoomModalOpen(false);
      await loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to save room.');
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (confirm('Are you sure you want to delete this room?')) {
      await hotelService.deleteRoom(id);
      showNotification('Room removed from inventory.');
      await loadAllData();
    }
  };

  const handleToggleRoomActive = async (room: Room) => {
    await hotelService.updateRoom(room.id, { is_active: !room.is_active });
    showNotification(`Room ${!room.is_active ? 'activated' : 'deactivated'}.`);
    await loadAllData();
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (bookingId: string, status: BookingStatus) => {
    await hotelService.updateBookingStatus(bookingId, status);
    showNotification(`Booking status updated to ${status}.`);
    await loadAllData();
  };

  const handleUpdatePaymentStatus = async (bookingId: string, status: PaymentStatus) => {
    await hotelService.updatePaymentStatus(bookingId, status);
    showNotification(`Payment status updated to ${status}.`);
    await loadAllData();
  };

  const filteredBookings = bookings.filter(b => {
    const matchesSearch =
      b.booking_reference.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.guest_name.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.guest_email.toLowerCase().includes(bookingSearch.toLowerCase()) ||
      b.guest_phone.includes(bookingSearch);

    if (!matchesSearch) return false;
    if (bookingStatusFilter !== 'all' && b.booking_status !== bookingStatusFilter) return false;
    return true;
  });

  const filteredPayments = bookings.filter(b => {
    if (paymentFilter === 'all') return true;
    if (paymentFilter === 'COD') return b.payment_method === 'COD';
    if (paymentFilter === 'UPI') return b.payment_method === 'UPI';
    if (paymentFilter === 'awaiting') return b.payment_status === 'Awaiting Verification';
    return true;
  });

  const handleCopySqlScript = () => {
    const sqlContent = `-- Run this in Supabase SQL Editor for ASVILLA
-- Direct project: https://kidfjovrvpscsatjahlf.supabase.co
-- Tables: profiles, rooms, bookings, payments + RLS policies
-- See /supabase-schema.sql for the complete script.`;
    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };

  if (!isAdmin && profile?.role !== 'admin') {
    return (
      <div className="py-20 text-center bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border border-[#2B1E16]/10 max-w-md shadow-sm">
          <ShieldCheck className="w-12 h-12 text-amber-800 mx-auto mb-3" />
          <h2 className="font-serif text-2xl font-bold text-[#1C130D] mb-2">
            Administrator Access Required
          </h2>
          <p className="text-xs text-[#2B1E16]/70 mb-6">
            You must be logged in as an authorized ASVILLA administrator to view this portal.
          </p>
          <button
            onClick={onBackToHome}
            className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 bg-[#FAF8F5] min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2B1E16]/10 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E7D47]">
              <ShieldCheck className="w-4 h-4" />
              <span>ASVILLA Executive Admin Control</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C130D]">
              Hotel Administration &amp; Operations
            </h1>
            <p className="text-xs text-[#2B1E16]/70 mt-1">
              Logged in as: <strong className="text-[#1C130D]">{profile?.email || 'Administrator'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadAllData}
              className="p-2 text-xs font-medium text-[#2B1E16] bg-white border border-[#2B1E16]/15 hover:bg-[#FAF8F5] rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={onBackToHome}
              className="px-4 py-2 text-xs font-semibold text-[#2B1E16] bg-white hover:bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg transition-colors cursor-pointer"
            >
              View Public Website
            </button>
            <button
              onClick={async () => {
                await signOut();
                onBackToHome();
              }}
              className="px-3.5 py-2 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>

        {/* Global Action Success Toast */}
        {actionSuccess && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs font-medium text-emerald-800 flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-[#2B1E16]/10 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#2B1E16] text-white'
                : 'text-[#2B1E16]/70 hover:bg-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'bookings'
                ? 'bg-[#2B1E16] text-white'
                : 'text-[#2B1E16]/70 hover:bg-white'
            }`}
          >
            Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setActiveTab('rooms')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'rooms'
                ? 'bg-[#2B1E16] text-white'
                : 'text-[#2B1E16]/70 hover:bg-white'
            }`}
          >
            Room Management ({rooms.length})
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'payments'
                ? 'bg-[#2B1E16] text-white'
                : 'text-[#2B1E16]/70 hover:bg-white'
            }`}
          >
            <span>Payments</span>
            {awaitingUpiPayments > 0 && (
              <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {awaitingUpiPayments}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'users'
                ? 'bg-[#2B1E16] text-white'
                : 'text-[#2B1E16]/70 hover:bg-white'
            }`}
          >
            Guest Profiles
          </button>
          <button
            onClick={() => setActiveTab('supabase')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              activeTab === 'supabase'
                ? 'bg-[#2B1E16] text-white'
                : 'text-[#2B1E16]/70 hover:bg-white'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Config</span>
          </button>
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            
            {/* 6 KPI Cards (Quantitative precision, tabular numbers) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              
              <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 shadow-xs">
                <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Total Bookings</div>
                <div className="font-serif text-2xl font-bold text-[#1C130D] mt-1 tabular-nums">
                  {totalBookings}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 shadow-xs">
                <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Confirmed</div>
                <div className="font-serif text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
                  {confirmedBookings}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 shadow-xs">
                <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Pending Review</div>
                <div className="font-serif text-2xl font-bold text-amber-800 mt-1 tabular-nums">
                  {pendingBookings}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 shadow-xs">
                <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Total Chambers</div>
                <div className="font-serif text-2xl font-bold text-[#1C130D] mt-1 tabular-nums">
                  {totalRooms}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 shadow-xs">
                <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Active Inventory</div>
                <div className="font-serif text-2xl font-bold text-[#9E7D47] mt-1 tabular-nums">
                  {activeRoomsCount}
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 shadow-xs">
                <div className="text-[11px] font-semibold text-[#2B1E16]/60 uppercase">Collected Revenue</div>
                <div className="font-serif text-2xl font-bold text-[#9E7D47] mt-1 tabular-nums">
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </div>
              </div>

            </div>

            {/* Urgent Attention: Awaiting UPI Verifications */}
            {awaitingUpiPayments > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-800" />
                    <h3 className="font-serif text-lg font-bold text-amber-950">
                      {awaitingUpiPayments} UPI Payment{awaitingUpiPayments > 1 ? 's' : ''} Awaiting Admin Verification
                    </h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className="text-xs font-semibold text-amber-900 underline cursor-pointer"
                  >
                    Review Now →
                  </button>
                </div>
                <p className="text-xs text-amber-900/80">
                  Guests have submitted transaction UTR reference codes. Verify the incoming credits in your YBL account (8081144350-4@ybl) and confirm their payment status below.
                </p>
              </div>
            )}

            {/* Recent Bookings Table Preview */}
            <div className="bg-white rounded-xl border border-[#2B1E16]/10 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-serif text-xl font-semibold text-[#1C130D]">
                  Recent Guest Reservations
                </h3>
                <button
                  onClick={() => setActiveTab('bookings')}
                  className="text-xs font-semibold text-[#9E7D47] hover:underline cursor-pointer"
                >
                  View All Bookings ({bookings.length}) →
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#2B1E16]/70 uppercase tracking-wider font-semibold border-b border-[#2B1E16]/10">
                    <tr>
                      <th className="py-3 px-3">Reference</th>
                      <th className="py-3 px-3">Guest</th>
                      <th className="py-3 px-3">Dates</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B1E16]/10">
                    {bookings.slice(0, 5).map(b => (
                      <tr key={b.id} className="hover:bg-[#FAF8F5]">
                        <td className="py-3 px-3 font-mono font-bold text-[#9E7D47]">{b.booking_reference}</td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-[#1C130D]">{b.guest_name}</div>
                          <div className="text-[11px] text-[#2B1E16]/60">{b.guest_phone}</div>
                        </td>
                        <td className="py-3 px-3 text-[#2B1E16]/75">
                          {b.check_in} to {b.check_out} ({b.total_nights}n)
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-[#2B1E16]">{b.payment_method}</span>
                          <span className="text-[10px] block text-[#2B1E16]/60">{b.payment_status}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`font-semibold ${
                              b.booking_status === 'Confirmed'
                                ? 'text-emerald-700'
                                : b.booking_status === 'Cancelled'
                                ? 'text-red-700'
                                : 'text-amber-700'
                            }`}
                          >
                            {b.booking_status}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-serif font-bold text-[#1C130D] tabular-nums">
                          ₹{b.total_amount.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: BOOKINGS MANAGEMENT */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            
            {/* Search and Filters */}
            <div className="bg-white p-4 rounded-xl border border-[#2B1E16]/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-[#9E7D47] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search by ID, guest name, email, phone..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47]"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-xs font-semibold text-[#2B1E16]/70">Status:</span>
                <select
                  value={bookingStatusFilter}
                  onChange={(e) => setBookingStatusFilter(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none"
                >
                  <option value="all">All Bookings</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Full Bookings Table */}
            <div className="bg-white rounded-xl border border-[#2B1E16]/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#2B1E16]/70 uppercase tracking-wider font-semibold border-b border-[#2B1E16]/10">
                    <tr>
                      <th className="py-3.5 px-4">Booking Ref</th>
                      <th className="py-3.5 px-4">Guest Details</th>
                      <th className="py-3.5 px-4">Dates &amp; Chamber</th>
                      <th className="py-3.5 px-4">Payment Info</th>
                      <th className="py-3.5 px-4">Booking Status</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B1E16]/10">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-xs text-[#2B1E16]/60">
                          No matching reservations found.
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-4 font-mono font-bold text-[#9E7D47]">
                            {b.booking_reference}
                            <span className="block text-[10px] text-[#2B1E16]/50 font-sans font-normal mt-0.5">
                              {new Date(b.created_at).toLocaleDateString()}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#1C130D]">{b.guest_name}</div>
                            <div className="text-[11px] text-[#2B1E16]/70">{b.guest_email}</div>
                            <div className="text-[11px] text-[#2B1E16]/70">{b.guest_phone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-medium text-[#1C130D]">
                              {b.room?.room_name || 'ASVILLA Room'}
                            </div>
                            <div className="text-[#2B1E16]/75">
                              {b.check_in} → {b.check_out} ({b.total_nights} Nights)
                            </div>
                            <div className="text-[11px] text-[#2B1E16]/60">
                              {b.adults} Adults, {b.children} Children
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-serif font-bold text-sm text-[#1C130D] tabular-nums">
                              ₹{b.total_amount.toLocaleString('en-IN')}
                            </div>
                            <div className="text-[11px] font-medium text-[#2B1E16]/70">
                              Method: {b.payment_method}
                            </div>
                            <div className="text-[11px]">
                              Status: <strong className="text-amber-800">{b.payment_status}</strong>
                            </div>
                            {b.transaction_reference && (
                              <div className="text-[10px] font-mono text-[#2B1E16]/70 mt-0.5 truncate max-w-[140px]" title={b.transaction_reference}>
                                Ref: {b.transaction_reference}
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <select
                              value={b.booking_status}
                              onChange={(e) => handleUpdateBookingStatus(b.id, e.target.value as BookingStatus)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-md border border-[#2B1E16]/20 bg-white ${
                                b.booking_status === 'Confirmed'
                                  ? 'text-emerald-800'
                                  : b.booking_status === 'Cancelled'
                                  ? 'text-red-700'
                                  : 'text-amber-800'
                              }`}
                            >
                              <option value="Confirmed">Confirmed</option>
                              <option value="Pending">Pending</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td className="py-4 px-4 text-right space-y-1">
                            {b.payment_status !== 'Paid' && (
                              <button
                                onClick={() => handleUpdatePaymentStatus(b.id, 'Paid')}
                                className="block w-full text-right text-[11px] font-semibold text-emerald-700 hover:underline cursor-pointer"
                              >
                                Mark as Paid
                              </button>
                            )}
                            {b.booking_status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'Cancelled')}
                                className="block w-full text-right text-[11px] font-medium text-red-700 hover:underline cursor-pointer"
                              >
                                Reject / Cancel
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: ROOM MANAGEMENT */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1C130D]">
                  Chamber Inventory ({rooms.length})
                </h3>
                <p className="text-xs text-[#2B1E16]/70">
                  Add, update rates, adjust amenities, or toggle active status.
                </p>
              </div>

              <button
                onClick={handleOpenAddRoom}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Chamber</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`bg-white rounded-xl border overflow-hidden shadow-xs flex flex-col justify-between ${
                    room.is_active ? 'border-[#2B1E16]/10' : 'border-red-200 opacity-75'
                  }`}
                >
                  <div>
                    <div className="relative aspect-[16/9] w-full bg-[#FAF8F5]">
                      <img
                        src={room.image_url}
                        alt={room.room_name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[11px] font-bold">
                        {room.is_active ? (
                          <span className="text-emerald-700">Active</span>
                        ) : (
                          <span className="text-red-700">Disabled</span>
                        )}
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-lg font-bold text-[#1C130D]">
                          {room.room_name}
                        </h4>
                        <div className="font-serif font-bold text-base text-[#9E7D47]">
                          ₹{room.price_per_night.toLocaleString('en-IN')}<span className="text-xs text-[#2B1E16]/60">/n</span>
                        </div>
                      </div>

                      <div className="text-xs text-[#2B1E16]/70 flex items-center gap-2">
                        <span>{room.room_size}</span>
                        <span>·</span>
                        <span>{room.bed_type}</span>
                        <span>·</span>
                        <span>Max {room.max_guests} Guests</span>
                      </div>

                      <p className="text-xs text-[#2B1E16]/80 line-clamp-2">
                        {room.description}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-[#FAF8F5] border-t border-[#2B1E16]/10 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleRoomActive(room)}
                      className={`text-xs font-semibold cursor-pointer ${
                        room.is_active ? 'text-amber-800' : 'text-emerald-700'
                      }`}
                    >
                      {room.is_active ? 'Disable' : 'Enable'}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenEditRoom(room)}
                        className="p-1.5 text-[#2B1E16]/70 hover:text-[#1C130D] hover:bg-white rounded cursor-pointer"
                        title="Edit Chamber"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                        title="Delete Chamber"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 4: PAYMENTS MANAGEMENT */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-serif text-xl font-semibold text-[#1C130D]">
                  Payment Ledger &amp; Manual UPI Verification
                </h3>
                <p className="text-xs text-[#2B1E16]/70">
                  Verify manual UPI QR transactions or update COD payments received at the ASVILLA front desk.
                </p>
              </div>

              {/* Segmented Filter */}
              <div className="flex items-center gap-1 p-1 bg-[#F0EAE1] rounded-lg">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    paymentFilter === 'all' ? 'bg-white text-[#1C130D] shadow-xs' : 'text-[#2B1E16]/70'
                  }`}
                >
                  All ({bookings.length})
                </button>
                <button
                  onClick={() => setPaymentFilter('awaiting')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    paymentFilter === 'awaiting' ? 'bg-white text-[#1C130D] shadow-xs' : 'text-[#2B1E16]/70'
                  }`}
                >
                  Awaiting UPI ({awaitingUpiPayments})
                </button>
                <button
                  onClick={() => setPaymentFilter('COD')}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                    paymentFilter === 'COD' ? 'bg-white text-[#1C130D] shadow-xs' : 'text-[#2B1E16]/70'
                  }`}
                >
                  COD / Hotel
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#2B1E16]/10 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FAF8F5] text-[#2B1E16]/70 uppercase tracking-wider font-semibold border-b border-[#2B1E16]/10">
                    <tr>
                      <th className="py-3 px-4">Booking Ref</th>
                      <th className="py-3 px-4">Guest</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Transaction / UTR</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Payment Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B1E16]/10">
                    {filteredPayments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-xs text-[#2B1E16]/60">
                          No matching payments found.
                        </td>
                      </tr>
                    ) : (
                      filteredPayments.map((b) => (
                        <tr key={b.id} className="hover:bg-[#FAF8F5]">
                          <td className="py-4 px-4 font-mono font-bold text-[#9E7D47]">
                            {b.booking_reference}
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#1C130D]">{b.guest_name}</div>
                            <div className="text-[11px] text-[#2B1E16]/70">{b.guest_phone}</div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-medium">{b.payment_method === 'COD' ? 'Pay at Hotel (COD)' : 'UPI QR Transfer'}</span>
                          </td>
                          <td className="py-4 px-4">
                            {b.transaction_reference ? (
                              <span className="font-mono text-xs font-semibold bg-[#FAF8F5] px-2 py-1 rounded border border-[#2B1E16]/10">
                                {b.transaction_reference}
                              </span>
                            ) : (
                              <span className="text-[#2B1E16]/50 italic">None (COD)</span>
                            )}
                          </td>
                          <td className="py-4 px-4 font-serif font-bold text-sm text-[#1C130D] tabular-nums">
                            ₹{b.total_amount.toLocaleString('en-IN')}
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={`font-semibold ${
                                b.payment_status === 'Paid'
                                  ? 'text-emerald-700'
                                  : b.payment_status === 'Awaiting Verification'
                                  ? 'text-amber-800'
                                  : 'text-[#2B1E16]/70'
                              }`}
                            >
                              {b.payment_status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            {b.payment_status !== 'Paid' ? (
                              <button
                                onClick={() => handleUpdatePaymentStatus(b.id, 'Paid')}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                              >
                                Verify &amp; Mark Paid
                              </button>
                            ) : (
                              <span className="text-xs text-emerald-800 font-medium inline-flex items-center gap-1">
                                <Check className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: USERS & PROFILES */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <h3 className="font-serif text-xl font-semibold text-[#1C130D]">
              Registered Guest Accounts ({users.length > 0 ? users.length : '1 Initial Profile'})
            </h3>

            <div className="bg-white rounded-xl border border-[#2B1E16]/10 overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF8F5] text-[#2B1E16]/70 uppercase tracking-wider font-semibold border-b border-[#2B1E16]/10">
                  <tr>
                    <th className="py-3 px-4">Full Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Joined Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B1E16]/10">
                  {users.length === 0 ? (
                    <tr>
                      <td className="py-4 px-4 font-semibold text-[#1C130D]">ASVILLA Administrator</td>
                      <td className="py-4 px-4 text-[#2B1E16]/70">{profile?.email || 'admin@asvilla.com'}</td>
                      <td className="py-4 px-4 text-[#2B1E16]/70">+91 80811 44350</td>
                      <td className="py-4 px-4 font-semibold text-amber-800">admin</td>
                      <td className="py-4 px-4 text-[#2B1E16]/60">Hotel Launch Date</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-4 px-4 font-semibold text-[#1C130D]">{u.full_name}</td>
                        <td className="py-4 px-4 text-[#2B1E16]/70">{u.email}</td>
                        <td className="py-4 px-4 text-[#2B1E16]/70">{u.phone || '—'}</td>
                        <td className="py-4 px-4 font-semibold text-amber-800">{u.role}</td>
                        <td className="py-4 px-4 text-[#2B1E16]/60">{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: SUPABASE CONFIG & SQL SCRIPT */}
        {activeTab === 'supabase' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-[#2B1E16]/10 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#2B1E16]/10 pb-4">
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#1C130D]">
                    Supabase Project Integration
                  </h3>
                  <p className="text-xs text-[#2B1E16]/70 mt-1">
                    ASVILLA is configured to connect to your live Supabase project.
                  </p>
                </div>

                <a
                  href="https://supabase.com/dashboard/project/kidfjovrvpscsatjahlf/sql"
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
                >
                  Open Supabase SQL Editor ↗
                </a>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#2B1E16]/10">
                  <div className="text-[10px] uppercase font-bold text-[#2B1E16]/60">Supabase Project URL</div>
                  <div className="font-mono text-[#1C130D] mt-0.5 truncate">https://kidfjovrvpscsatjahlf.supabase.co</div>
                </div>
                <div className="p-3 bg-[#FAF8F5] rounded-lg border border-[#2B1E16]/10">
                  <div className="text-[10px] uppercase font-bold text-[#2B1E16]/60">Supabase Project ID</div>
                  <div className="font-mono text-[#1C130D] mt-0.5">kidfjovrvpscsatjahlf</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-xs text-amber-950 space-y-1">
                <div className="font-semibold text-amber-900">Important Tip for Instant Guest Registration:</div>
                <p>
                  To allow guests to register and log in immediately without requiring an SMTP email verification server, go to <strong>Supabase Dashboard → Authentication → Providers → Email</strong> and toggle <strong>OFF "Confirm email"</strong>.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#1C130D]">
                    Database Schema Script (`/supabase-schema.sql`)
                  </span>
                  <button
                    onClick={handleCopySqlScript}
                    className="px-3 py-1 text-xs font-semibold text-[#1C130D] bg-[#FAF8F5] hover:bg-[#EAE1D9] border border-[#2B1E16]/15 rounded transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-[#9E7D47]" />
                        <span>Copy SQL Script</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-[#1C130D] text-amber-200 rounded-xl text-[11px] font-mono overflow-x-auto max-h-72">
{`-- Run this script in the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/kidfjovrvpscsatjahlf/sql
-- Creates: profiles, rooms, bookings, payments tables, RLS policies,
-- overlap prevention function (check_room_available), and initial rooms!
-- See the complete file in the project at: /supabase-schema.sql`}
                </pre>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Add / Edit Room Modal */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#2B1E16]/10 overflow-hidden my-8 p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#2B1E16]/10 pb-3">
              <h3 className="font-serif text-xl font-bold text-[#1C130D]">
                {editingRoom ? 'Edit Chamber Details' : 'Add New Heritage Chamber'}
              </h3>
              <button
                onClick={() => setIsRoomModalOpen(false)}
                className="p-1 text-[#2B1E16]/60 hover:text-[#1C130D]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Chamber Name *
                </label>
                <input
                  type="text"
                  required
                  value={roomFormData.room_name}
                  onChange={(e) => setRoomFormData({ ...roomFormData, room_name: e.target.value })}
                  placeholder="e.g. Ganga View Royal Suite"
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Price Per Night (₹ INR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={roomFormData.price_per_night}
                    onChange={(e) => setRoomFormData({ ...roomFormData, price_per_night: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Max Occupancy *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={roomFormData.max_guests}
                    onChange={(e) => setRoomFormData({ ...roomFormData, max_guests: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Bed Type *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomFormData.bed_type}
                    onChange={(e) => setRoomFormData({ ...roomFormData, bed_type: e.target.value })}
                    placeholder="e.g. King Bed"
                    className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                    Room Size *
                  </label>
                  <input
                    type="text"
                    required
                    value={roomFormData.room_size}
                    onChange={(e) => setRoomFormData({ ...roomFormData, room_size: e.target.value })}
                    placeholder="e.g. 520 sq.ft"
                    className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Photograph URL *
                </label>
                <input
                  type="url"
                  required
                  value={roomFormData.image_url}
                  onChange={(e) => setRoomFormData({ ...roomFormData, image_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Facilities (comma separated) *
                </label>
                <input
                  type="text"
                  required
                  value={roomFormData.facilities}
                  onChange={(e) => setRoomFormData({ ...roomFormData, facilities: e.target.value })}
                  placeholder="Balcony, Rain Shower, Wi-Fi, Breakfast"
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#2B1E16]/75 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={roomFormData.description}
                  onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })}
                  placeholder="Handcrafted heritage details, serene ambiance..."
                  className="w-full px-3.5 py-2 text-sm bg-[#FAF8F5] border border-[#2B1E16]/15 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9E7D47] text-[#1C130D]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={roomFormData.is_active}
                  onChange={(e) => setRoomFormData({ ...roomFormData, is_active: e.target.checked })}
                  className="rounded text-[#9E7D47] focus:ring-[#9E7D47]"
                />
                <label htmlFor="isActiveToggle" className="text-xs font-medium text-[#1C130D]">
                  Chamber is Available for Online Reservation
                </label>
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#2B1E16]/10">
                <button
                  type="button"
                  onClick={() => setIsRoomModalOpen(false)}
                  className="flex-1 py-2 text-xs font-semibold text-[#2B1E16] bg-[#FAF8F5] hover:bg-[#EAE1D9] rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-semibold text-white bg-[#2B1E16] hover:bg-[#422F22] rounded-lg transition-colors cursor-pointer"
                >
                  Save Chamber
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
