// src/routes/index.js - Updated version with enhanced booking system
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'

// Updated Offer Components
import OffersPage from './pages/ViewOffer' // Our new enhanced offers page
import ViewOffer from './pages/ViewOffer' // Keep existing for backward compatibility
import Offers from './pages/Offers'

// Store Components
import Stores from './pages/Stores'
import Store from './pages/Store'

// Updated Service Components
import ServiceDetailPage from './pages/ServiceDetailPage' // Our new enhanced service page
import ViewService from './pages/ViewService' // Keep existing for backward compatibility

// Booking System
import EnhancedBookingPage from './pages/Booking'

// Other Pages
import Checkout from './pages/Checkout'
import MyVouchers from './pages/MyVouchers'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import Footer from './components/Footer'
import Requestservice from './pages/Requestservice'
import Hotdeals from './pages/Hotdeals'
import VerifyOTP from './pages/auth/VerifyOTP'

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
      <Routes>
        {/* ==================== PUBLIC ROUTES ==================== */}
        
        {/* Home */}
        <Route path='/' element={<Home />} />
        
        {/* Authentication Routes */}
        <Route path='/accounts/sign-up' element={<SignUp />} />
        <Route path='/accounts/sign-in' element={<Login />} />
        <Route path='/accounts/verify-otp' element={<VerifyOTP />} />
        
        {/* Login redirect routes */}
        <Route path='/login' element={<Navigate to="/accounts/sign-in" replace />} />
        <Route path='/signup' element={<Navigate to="/accounts/sign-up" replace />} />
        
        {/* ==================== OFFER ROUTES ==================== */}
        
        {/* Offers listing */}
        <Route path='/offers' element={<Offers />} />
        
        {/* Individual Offer Routes - Use new enhanced OffersPage */}
        <Route path='/offer/:id' element={<OffersPage />} />
        <Route path='/offers/:id' element={<OffersPage />} />
        
        {/* Legacy offer routes - redirect to new format */}
        <Route path='/offer' element={<Navigate to="/offers" replace />} />
        <Route path='store/offers/:id' element={<Navigate to="/offer/$2" replace />} />
        <Route path="/store/:storeId/offers/:offerId" element={<Navigate to="/offer/$3" replace />} />
        
        {/* Backward compatibility - keep ViewOffer for any internal usage */}
        <Route path='/view-offer/:id' element={<ViewOffer />} />
        
        {/* ==================== STORE ROUTES ==================== */}
        
        <Route path='/stores' element={<Stores />} />
        <Route path='/Stores' element={<Navigate to="/stores" replace />} />
        <Route path='/store/:id' element={<Store />} />
        <Route path='/Store/:id' element={<Store />} />
        
        {/* ==================== SERVICE ROUTES ==================== */}
        
        {/* Individual Service Routes - Use new enhanced ServiceDetailPage */}
        <Route path='/service/:id' element={<ServiceDetailPage />} />
        <Route path='/services/:id' element={<ServiceDetailPage />} />
        
        {/* Store-specific service routes */}
        <Route path="/store/:storeId/service/:serviceId" element={<ServiceDetailPage />} />
        <Route path="/store/:storeId/services/:serviceId" element={<ServiceDetailPage />} />
        
        {/* Legacy service routes */}
        <Route path='/ViewService/:id' element={<Navigate to="/service/$2" replace />} />
        <Route path='/view-service/:id' element={<ViewService />} /> {/* Keep for backward compatibility */}
        
        {/* ==================== ENHANCED BOOKING ROUTES ==================== */}
        
        {/* Main Enhanced Booking Routes */}
        <Route path="/booking/offer/:offerId" element={<EnhancedBookingPage />} />
        <Route path="/booking/service/:serviceId" element={<EnhancedBookingPage />} />
        
        {/* Unified booking route - auto-detects type from ID */}
        <Route path="/booking/:id" element={<EnhancedBookingPage />} />
        
        {/* Legacy booking redirects */}
        <Route path="/book/:offerId" element={<Navigate to="/booking/offer/$2" replace />} />
        <Route path="/offers/:offerId/book" element={<Navigate to="/booking/offer/$2" replace />} />
        <Route path='/service/:id/book' element={<Navigate to="/booking/service/$2" replace />} />
        <Route path='/services/:id/book' element={<Navigate to="/booking/service/$2" replace />} />
        
        {/* Store-specific booking routes */}
        <Route path="/store/:storeId/service/:serviceId/book" element={<Navigate to="/booking/service/$3" replace />} />
        <Route path="/store/:storeId/offer/:offerId/book" element={<Navigate to="/booking/offer/$3" replace />} />
        
        {/* Booking Success Routes */}
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/booking/confirmed" element={<Navigate to="/booking/success" replace />} />
        <Route path="/booking/complete" element={<Navigate to="/booking/success" replace />} />
        
        {/* ==================== SEARCH AND DISCOVERY ==================== */}
        
        {/* Search */}
        <Route path="/search" element={<SearchResults />} />
        
        {/* Hot Deals */}
        <Route path='/hotdeals' element={<Hotdeals />} />
        <Route path='/Hotdeals' element={<Navigate to="/hotdeals" replace />} />
        <Route path='/hot-deals' element={<Navigate to="/hotdeals" replace />} />
        
        {/* Service Request */}
        <Route path='/request-service' element={<Requestservice />} />
        <Route path='/Requestservice' element={<Navigate to="/request-service" replace />} />
        
        {/* ==================== USER DASHBOARD ROUTES ==================== */}
        
        {/* User Profile */}
        <Route path='/profile' element={<Profile />} />
        <Route path='/account' element={<Navigate to="/profile" replace />} />
        
        {/* My Bookings/Vouchers */}
        <Route path='/my-vouchers' element={<MyVouchers />} />
        <Route path='/my-bookings' element={<Navigate to="/my-vouchers" replace />} />
        <Route path='/bookings' element={<Navigate to="/my-vouchers" replace />} />
        <Route path='/vouchers' element={<Navigate to="/my-vouchers" replace />} />
        
        {/* Chat */}
        <Route path='/chat' element={<Chat />} />
        <Route path='/chat/Store/:id' element={<Chat />} />
        <Route path='/messages' element={<Navigate to="/chat" replace />} />
        
        {/* ==================== PAYMENT AND CHECKOUT ==================== */}
        
        {/* Checkout */}
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/Checkout' element={<Navigate to="/checkout" replace />} />
        <Route path='/payment' element={<Navigate to="/checkout" replace />} />
        
        {/* ==================== UTILITY ROUTES ==================== */}
        
        {/* Footer Component Route (if needed) */}
        <Route path='/components/Footer' element={<Footer />} />
        
        {/* ==================== ADDITIONAL ROUTES FOR COMPATIBILITY ==================== */}
        
        {/* Case-sensitive redirects */}
        <Route path='/OFFERS' element={<Navigate to="/offers" replace />} />
        <Route path='/STORES' element={<Navigate to="/stores" replace />} />
        <Route path='/PROFILE' element={<Navigate to="/profile" replace />} />
        <Route path='/CHAT' element={<Navigate to="/chat" replace />} />
        
        {/* Common alternative paths */}
        <Route path='/deals' element={<Navigate to="/offers" replace />} />
        <Route path='/services' element={<Navigate to="/stores" replace />} />
        <Route path='/merchants' element={<Navigate to="/stores" replace />} />
        <Route path='/providers' element={<Navigate to="/stores" replace />} />
        
        {/* ==================== ERROR ROUTES ==================== */}
        
        {/* 404 Not Found - This should be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default AppRoutes