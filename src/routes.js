import React, { useEffect } from 'react'
import { Route, Routes, Navigate, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'

// Updated Offer Components
import OffersPage from './pages/ViewOffer' // Our new enhanced offers page
import ViewOffer from './pages/ViewOffer' // Keep existing for backward compatibility

// Store Components
import Stores from './pages/Stores'
import Store from './pages/Store'

// Reels Feature
import Reels from './pages/Reels'

// Updated Service Components
import ServiceDetailPage from './pages/ServiceDetailPage' // Our new enhanced service page
import ViewService from './pages/ViewService' // Keep existing for backward compatibility

// Booking System
import EnhancedBookingPage from './pages/Booking'
import BookingDetails from './components/c2/BookingDetails'

// Other Pages
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import Footer from './components/Footer'
import Requestservice from './pages/Requestservice'
import Hotdeals from './pages/Hotdeals'
import VerifyOTP from './pages/auth/VerifyOTP'

// Profile Page Components - Standalone Versions (these have their own Navbar/Footer)
import MyBookingsStandalone from './components/c2/MyBookings'
import FavouritesStandalone from './components/c2/Favourites'
import FollowedStoresStandalone from './components/c2/FollowedStores'
import EarnStandalone from './components/c2/Earn'
import ProfileSettingsStandalone from './components/c2/ProfileSettings'
import ServiceRequestsStandalone from './components/c2/ServiceRequests'

// Footer Pages
import ContactUs from './components/ContactUs'
import FAQ from './components/FAQ '
import Careers from './components/Careers'
import TermsConditions from './components/TermsConditions'
import PrivacyPolicy from './components/PrivacyPolicy'
import AboutUs from './components/AboutUs'
import SearchResultsPage from './components/SearchResultsPage'
import Layout from './components/Layout';
import ChatLayout from './components/ChatLayout';

// Route Change Handler Component - OPTIMIZED to prevent navbar flash
const RouteChangeHandler = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Use instant scroll to prevent any flash
    window.scrollTo({ top: 0, behavior: 'instant' });

    // Removed routeChanged event dispatch as it was causing re-renders

  }, [location.pathname]);

  return children;
};

// 404 Not Found Component
const NotFound = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="text-xl text-gray-600 mt-4">Page not found</p>
      <a href="/" className="mt-6 inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
        Go Home
      </a>
    </div>
  </div>
);

// Booking Success Component
const BookingSuccess = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
      <p className="text-gray-600 mb-6">Your booking has been successfully created.</p>
      <div className="space-x-4">
        <a href="/my-vouchers" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
          View My Bookings
        </a>
        <a href="/offers" className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300">
          Browse More Offers
        </a>
      </div>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <div>
      <RouteChangeHandler>
        <Routes>
          {/* Routes WITHOUT Navbar/Footer - Authentication Pages */}
          <Route path='/accounts/sign-up' element={<SignUp />} />
          <Route path='/accounts/sign-in' element={<Login />} />
          <Route path='/accounts/verify-otp' element={<VerifyOTP />} />
          <Route path='/login' element={<Navigate to="/accounts/sign-in" replace />} />
          <Route path='/signup' element={<Navigate to="/accounts/sign-up" replace />} />

          {/* Reels - Fullscreen without Navbar/Footer */}
          <Route path='/reels' element={<Reels />} />
          <Route path='/Reels' element={<Navigate to="/reels" replace />} />
          <Route path='/reels/:id' element={<Reels />} />
          <Route path='/videos' element={<Navigate to="/reels" replace />} />
          <Route path='/shorts' element={<Navigate to="/reels" replace />} />

          {/* Chat Routes - WITH Navbar but WITHOUT Footer */}
          <Route element={<ChatLayout />}>
            <Route path='/chat' element={<Chat />} />
            <Route path='/chat/Store/:id' element={<Chat />} />
            <Route path='/messages' element={<Navigate to="/chat" replace />} />
          </Route>

          {/* Routes WITH persistent Navbar/Footer */}
          <Route element={<Layout />}>
            {/* ==================== PUBLIC ROUTES ==================== */}
            <Route path='/' element={<Home />} />

            {/* ==================== STORE ROUTES ==================== */}
            <Route path='/stores' element={<Stores />} />
            <Route path='/Stores' element={<Navigate to="/stores" replace />} />
            <Route path='/store/:id' element={<Store />} />
            <Route path='/Store/:id' element={<Store />} />

            {/* ==================== SERVICE ROUTES ==================== */}
            <Route path='/service/:id' element={<ServiceDetailPage />} />
            <Route path='/services/:id' element={<ServiceDetailPage />} />
            <Route path="/store/:storeId/service/:serviceId" element={<ServiceDetailPage />} />
            <Route path="/store/:storeId/services/:serviceId" element={<ServiceDetailPage />} />
            <Route path='/ViewService/:id' element={<Navigate to="/service/$2" replace />} />
            <Route path='/view-service/:id' element={<ViewService />} />

            {/* ==================== OFFER ROUTES ==================== */}
            <Route path="/store/:storeId/offer/:offerId" element={<ViewOffer />} />
            <Route path='/offer/:id' element={<ViewOffer />} />
            <Route path='/offers/:id' element={<ViewOffer />} />
            <Route path='/offer' element={<Navigate to="/hotdeals" replace />} />
            <Route path='/offers' element={<Navigate to="/hotdeals" replace />} />
            <Route path='/view-offer/:id' element={<ViewOffer />} />

            {/* ==================== BOOKING ROUTES ==================== */}
            <Route path="/booking/offer/:offerId" element={<EnhancedBookingPage />} />
            <Route path="/booking/service/:serviceId" element={<EnhancedBookingPage />} />
            <Route path="/booking/:id" element={<EnhancedBookingPage />} />
            <Route path="/book/:offerId" element={<Navigate to="/booking/offer/$2" replace />} />
            <Route path="/offers/:offerId/book" element={<Navigate to="/booking/offer/$2" replace />} />
            <Route path='/service/:id/book' element={<Navigate to="/booking/service/$2" replace />} />
            <Route path='/services/:id/book' element={<Navigate to="/booking/service/$2" replace />} />
            <Route path="/store/:storeId/service/:serviceId/book" element={<EnhancedBookingPage />} />
            <Route path="/store/:storeId/offer/:offerId/book" element={<EnhancedBookingPage />} />
            <Route path="/booking/success" element={<BookingSuccess />} />
            <Route path="/booking/confirmed" element={<Navigate to="/booking/success" replace />} />
            <Route path="/booking/complete" element={<Navigate to="/booking/success" replace />} />

            {/* ==================== SEARCH AND DISCOVERY ==================== */}
            <Route path="/search" element={<SearchResultsPage />} />
            <Route path='/hotdeals' element={<Hotdeals />} />
            <Route path='/Hotdeals' element={<Navigate to="/hotdeals" replace />} />
            <Route path='/hot-deals' element={<Navigate to="/hotdeals" replace />} />
            <Route path='/request-service' element={<Requestservice />} />
            <Route path='/Requestservice' element={<Navigate to="/request-service" replace />} />

            {/* ==================== USER DASHBOARD ROUTES ==================== */}
            <Route path='/profile' element={<Profile />} />
            <Route path='/account' element={<Navigate to="/profile" replace />} />
            <Route path='/profile/bookings' element={<MyBookingsStandalone />} />
            <Route path='/profile/my-bookings' element={<Navigate to="/profile/bookings" replace />} />
            <Route path='/profile/favourites' element={<FavouritesStandalone />} />
            <Route path='/profile/favorites' element={<Navigate to="/profile/favourites" replace />} />
            <Route path='/profile/followed-stores' element={<FollowedStoresStandalone />} />
            <Route path='/profile/stores' element={<Navigate to="/profile/followed-stores" replace />} />
            <Route path='/profile/earn' element={<EarnStandalone />} />
            <Route path='/profile/earnings' element={<Navigate to="/profile/earn" replace />} />
            <Route path='/profile/rewards' element={<Navigate to="/profile/earn" replace />} />
            <Route path='/profile/settings' element={<ProfileSettingsStandalone />} />
            <Route path='/profile/edit' element={<Navigate to="/profile/settings" replace />} />
            <Route path='/settings' element={<Navigate to="/profile/settings" replace />} />
            <Route path='/profile/service-requests' element={<ServiceRequestsStandalone />} />
            <Route path='/profile/requests' element={<Navigate to="/profile/service-requests" replace />} />
            <Route path='/service-requests' element={<Navigate to="/profile/service-requests" replace />} />
            <Route path='/my-bookings' element={<Navigate to="/profile/bookings" replace />} />
            <Route path="/booking-details/:bookingId" element={<BookingDetails />} />
            <Route path='/my-favourites' element={<Navigate to="/profile/favourites" replace />} />
            <Route path='/my-stores' element={<Navigate to="/profile/followed-stores" replace />} />
            <Route path='/my-earnings' element={<Navigate to="/profile/earn" replace />} />
            <Route path='/my-service-requests' element={<Navigate to="/profile/service-requests" replace />} />
            <Route path='/bookings' element={<Navigate to="/my-vouchers" replace />} />
            <Route path='/vouchers' element={<Navigate to="/my-vouchers" replace />} />

            {/* ==================== FOOTER PAGES ==================== */}
            <Route path='/contact-us' element={<ContactUs />} />
            <Route path='/contact' element={<Navigate to="/contact-us" replace />} />
            <Route path='/faq' element={<FAQ />} />
            <Route path='/FAQ' element={<Navigate to="/faq" replace />} />
            <Route path='/help' element={<Navigate to="/faq" replace />} />
            <Route path='/careers' element={<Careers />} />
            <Route path='/Careers' element={<Navigate to="/careers" replace />} />
            <Route path='/jobs' element={<Navigate to="/careers" replace />} />
            <Route path='/terms-conditions' element={<TermsConditions />} />
            <Route path='/terms' element={<Navigate to="/terms-conditions" replace />} />
            <Route path='/terms-and-conditions' element={<Navigate to="/terms-conditions" replace />} />
            <Route path='/privacy-policy' element={<PrivacyPolicy />} />
            <Route path='/privacy' element={<Navigate to="/privacy-policy" replace />} />
            <Route path='/about-us' element={<AboutUs />} />
            <Route path='/about' element={<Navigate to="/about-us" replace />} />
            <Route path='/About' element={<Navigate to="/about-us" replace />} />
            <Route path='/about-d3' element={<Navigate to="/about-us" replace />} />

            {/* ==================== ERROR ROUTES ==================== */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </RouteChangeHandler>
    </div>
  );
};

export default AppRoutes