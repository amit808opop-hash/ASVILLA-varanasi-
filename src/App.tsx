import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { RoomsSection } from './components/RoomsSection';
import { AboutSection } from './components/AboutSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { BookingModal } from './components/BookingModal';
import { RoomDetailModal } from './components/RoomDetailModal';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { PoliciesModal } from './components/PoliciesModal';
import { hotelService, INITIAL_ROOMS } from './services/hotelService';
import { Room, Booking } from './types/hotel';

function MainApp() {
  const { profile, isAdmin } = useAuth();

  // Navigation View
  const [activeView, setActiveView] = useState<'home' | 'rooms' | 'about' | 'contact' | 'dashboard' | 'admin'>('home');

  // Rooms data
  const [rooms, setRooms] = useState<Room[]>(INITIAL_ROOMS);
  const [loadingRooms, setLoadingRooms] = useState(true);

  // Search parameters from Hero
  const [searchCheckIn, setSearchCheckIn] = useState('');
  const [searchCheckOut, setSearchCheckOut] = useState('');
  const [searchGuests, setSearchGuests] = useState(2);

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);

  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedRoomForDetail, setSelectedRoomForDetail] = useState<Room | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register'>('login');

  const [policyType, setPolicyType] = useState<'privacy' | 'terms' | null>(null);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoadingRooms(true);
    try {
      const data = await hotelService.getRooms();
      setRooms(data);
    } catch (e) {
      console.warn('Failed to fetch rooms:', e);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleHeroSearch = (checkIn: string, checkOut: string, guests: number) => {
    setSearchCheckIn(checkIn);
    setSearchCheckOut(checkOut);
    setSearchGuests(guests);
    setActiveView('rooms');

    const roomsEl = document.getElementById('rooms');
    if (roomsEl) {
      roomsEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenBooking = (room?: Room) => {
    setSelectedRoomForBooking(room || rooms[0] || null);
    setIsBookingModalOpen(true);
  };

  const handleViewDetails = (room: Room) => {
    setSelectedRoomForDetail(room);
    setIsDetailModalOpen(true);
  };

  const handleOpenAuth = (initialTab: 'login' | 'register' = 'login') => {
    setAuthInitialTab(initialTab);
    setIsAuthModalOpen(true);
  };

  const handleBookingSuccess = (booking: Booking) => {
    // If guest was logged in, notify or keep dashboard updated
    if (profile) {
      // automatically reflected in dashboard
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#2B1E16]">
      
      {/* Top Bar Navigation */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={handleOpenAuth}
        onOpenAdmin={() => setActiveView('admin')}
        onOpenDashboard={() => setActiveView('dashboard')}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* Main Body Routing */}
      <main className="flex-1">
        {activeView === 'admin' ? (
          <AdminDashboard onBackToHome={() => setActiveView('home')} />
        ) : activeView === 'dashboard' ? (
          <UserDashboard
            onBackToHome={() => setActiveView('home')}
            onBookNew={() => handleOpenBooking()}
          />
        ) : (
          <>
            {/* Section A: Home & Hero */}
            <Hero
              onSearch={handleHeroSearch}
              onExploreRooms={() => {
                const el = document.getElementById('rooms');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Section B: Rooms & Suites */}
            <RoomsSection
              rooms={rooms}
              loading={loadingRooms}
              onViewDetails={handleViewDetails}
              onBookNow={(room) => handleOpenBooking(room)}
              guestFilter={searchGuests}
            />

            {/* Section C: About ASVILLA */}
            <AboutSection />

            {/* Section D: Contact */}
            <ContactSection />
          </>
        )}
      </main>

      {/* Section E: Footer */}
      <Footer
        onNavigate={(view) => {
          setActiveView(view);
          const el = document.getElementById(view);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
          else window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPolicy={(type) => setPolicyType(type)}
      />

      {/* Modals */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        selectedRoom={selectedRoomForBooking}
        rooms={rooms.filter((r) => r.is_active)}
        initialCheckIn={searchCheckIn}
        initialCheckOut={searchCheckOut}
        initialGuests={searchGuests}
        onBookingSuccess={handleBookingSuccess}
      />

      <RoomDetailModal
        room={selectedRoomForDetail}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onBookNow={(room) => handleOpenBooking(room)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccess={(isAdminLogin?: boolean) => {
          if (isAdminLogin) {
            setActiveView('admin');
          } else if (activeView === 'home') {
            setActiveView('dashboard');
          }
        }}
      />

      <PoliciesModal
        type={policyType}
        onClose={() => setPolicyType(null)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
