import React from 'react'
import Navbar from '../components/Navbar'

import HomeCategories from '../components/HomeCategories'
import HomeOffers from '../components/HomeOffers'
import HomeMerchants from '../components/HomeMerchants'
import Featured from '../components/Featured'
import Footer from '../components/Footer'
const Home = () => {
  return (
    <div>
      <Navbar />
      
      <HomeCategories />
      <HomeOffers />
      <HomeMerchants />
      <Featured />
      <Footer/>
    </div>
  )
}

export default Home