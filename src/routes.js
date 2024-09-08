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

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/accounts/sign-up' element={<SignUp />} />
        <Route path='/accounts/sign-in' element={<Login />} />

        <Route path='/offers' element={<Offers />} />
        <Route path='/offers/:slug/:id/see-details' element={<ViewOffer />} />

        <Route path='/merchants' element={<Stores />} />
        <Route path='/stores/:id/view' element={<ViewStore />} />


        <Route path='/:slug/:id/checkout' element={<Checkout />} />
    </Routes>
  )
}

export default AppRoutes