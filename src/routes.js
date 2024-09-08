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
import BottomNav from './components/BottomNav'
import MyVouchers from './pages/MyVouchers'
import MyBookings from './pages/MyBookings'
import Chat from './pages/Chat'
import Booking from './pages/Booking'

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/accounts/sign-up' element={<SignUp />} />
        <Route path='/accounts/sign-in' element={<Login />} />52

        <Route path='/offers' element={<Offers />} />
        <Route path='/offers/:slug/:id/see-details' element={<ViewOffer />} />

        <Route path='/merchants' element={<Stores />} />
        <Route path='/stores/:id/view' element={<ViewStore />} />


        <Route path='/:slug/:id/checkout' element={<Checkout />} />
        <Route path='/my-vouchers' element={<MyVouchers />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/chat' element={<Chat />} />
        <Route path='/discount/:id/booking' element={<Booking/>} />
    </Routes>
    <BottomNav />
    </div>
  )
}

export default AppRoutes