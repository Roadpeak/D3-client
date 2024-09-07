import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import SignUp from './pages/auth/SignUp'
import Login from './pages/auth/Login'
import ViewOffer from './pages/ViewOffer'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<Home />} />

        <Route path='/accounts/sign-up' element={<SignUp />} />
        <Route path='/accounts/sign-in' element={<Login />} />

         <Route path='/offers/:slug/:id/see-details' element={<ViewOffer />} />
    </Routes>
  )
}

export default AppRoutes