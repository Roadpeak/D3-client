import React from 'react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import HomeCategories from '../components/HomeCategories'
import HomeOffers from '../components/HomeOffers'
import HomeMerchants from '../components/HomeMerchants'
import Featured from '../components/Featured'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Hero />
      <HomeCategories />
      <HomeOffers />
      <HomeMerchants />
      <Featured />
    </div>
  )
}

export default Home