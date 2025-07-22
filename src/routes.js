// src/routes/index.js - Clean version without unused components
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import ViewOffer from './pages/ViewOffer'
import Offers from './pages/Offers'
import Stores from './pages/Stores'
import Checkout from './pages/Checkout'
import ViewStore from './pages/ViewStore'
import MyVouchers from './pages/MyVouchers'
import Chat from './pages/Chat'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import Footer from './components/Footer'
import Requestservice from './pages/Requestservice'
import Hotdeals from './pages/Hotdeals'
import VerifyOTP from './pages/auth/VerifyOTP'
import EnhancedBookingPage from './pages/Booking'

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
        
        {/* Login redirect route */}
        <Route path='/login' element={<Navigate to="/accounts/sign-in" replace />} />
        
        {/* Offer Routes */}
        <Route path='/offers' element={<Offers />} />
        <Route path='/offer' element={<ViewOffer />} />
        <Route path='/offer/:id' element={<ViewOffer />} />
        <Route path='/offers/:id' element={<ViewOffer />} />
        
        {/* Store Routes */}
        <Route path='/stores' element={<Stores />} />
        <Route path='/Stores' element={<Navigate to="/stores" replace />} />
        <Route path='/store/:id' element={<ViewStore />} />
        <Route path='/ViewStore/:id' element={<ViewStore />} />
        
        {/* Search */}
        <Route path="/search" element={<SearchResults />} />
        
        {/* Hot Deals */}
        <Route path='/hotdeals' element={<Hotdeals />} />
        <Route path='/Hotdeals' element={<Navigate to="/hotdeals" replace />} />
        
        {/* Service Request */}
        <Route path='/request-service' element={<Requestservice />} />
        <Route path='/Requestservice' element={<Navigate to="/request-service" replace />} />
        
        {/* Footer Component Route (if needed) */}
        <Route path='/components/Footer' element={<Footer />} />

        {/* ==================== BOOKING ROUTES ==================== */}
        
        {/* Main Booking Route - Component handles its own auth */}
        <Route path="/booking/:offerId" element={<EnhancedBookingPage />} />
        
        {/* Alternative booking routes for flexibility */}
        <Route path="/book/:offerId" element={<Navigate to={`/booking/${window.location.pathname.split('/')[2]}`} replace />} />
        <Route path="/offers/:offerId/book" element={<Navigate to={`/booking/${window.location.pathname.split('/')[2]}`} replace />} />
        
        {/* Booking Success Route */}
        <Route path="/booking/success" element={<BookingSuccess />} />
        <Route path="/booking/confirmed" element={<Navigate to="/booking/success" replace />} />

        {/* ==================== USER ROUTES ==================== */}
        
        {/* User Profile */}
        <Route path='/profile' element={<Profile />} />
        
        {/* My Bookings/Vouchers */}
        <Route path='/my-vouchers' element={<MyVouchers />} />
        
        {/* Alternative route names */}
        <Route path='/my-bookings' element={<Navigate to="/my-vouchers" replace />} />
        <Route path='/bookings' element={<Navigate to="/my-vouchers" replace />} />
        
        {/* Chat */}
        <Route path='/chat' element={<Chat />} />
        
        {/* Checkout */}
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/Checkout' element={<Navigate to="/checkout" replace />} />

        {/* ==================== ERROR ROUTES ==================== */}
        
        {/* 404 Not Found - This should be the last route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  )
}

export default AppRoutes