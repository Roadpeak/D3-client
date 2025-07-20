// src/routes/index.js - Updated with offer routes

import React from 'react'
import { Route, Routes } from 'react-router-dom'
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
import Booking from './pages/Booking'
import Profile from './pages/Profile'
import SearchResults from './pages/SearchResults'
import Footer from './components/Footer'
import Requestservice from './pages/Requestservice'
import Hotdeals from './pages/Hotdeals'
import VerifyOTP from './pages/auth/VerifyOTP'

// Import the new OffersPage component
// import OffersPage from './pages/OffersPage'

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/accounts/sign-up' element={<SignUp />} />
        <Route path='/accounts/sign-in' element={<Login />} />
        <Route path='/accounts/verify-otp' element={<VerifyOTP />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/components/Footer' element={<Footer/>} />

        <Route path='/offers' element={<Offers />} />
        <Route path='/offer' element={<ViewOffer />} />
        
        {/* NEW: Dynamic offer routes - Add these lines */}
        <Route path='/offer/:id' element={<ViewOffer />} />
        <Route path='/offers/:id' element={<ViewOffer />} />

        <Route path='/Stores' element={<Stores />} />
        <Route path='/ViewStore/:id' element={<ViewStore />} />

        <Route path="/search" element={<SearchResults />} />

        <Route path='/Checkout' element={<Checkout />} />
        <Route path='/my-vouchers' element={<MyVouchers />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/Booking' element={<Booking/>} />
        <Route path='/Requestservice' element={<Requestservice/>} />
        <Route path='/Hotdeals' element={<Hotdeals/>} />
        
        {/* Alternative route for lowercase hotdeals */}
        <Route path='/hotdeals' element={<Hotdeals/>} />
      </Routes>
    </div>
  )
}

export default AppRoutes