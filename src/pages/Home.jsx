import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import FeaturedOffers from '../components/FeaturedOffers';
import BrowseCategories from '../components/BrowseCategories';
import PopularListings from '../components/PopularListings';
import PopularStores from '../components/PopularStores';
import Footer from '../components/Footer';

export default function DiscountCouponWebsite() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Hero />
      <FeaturedOffers />
      {/* <BrowseCategories /> */}
      <PopularListings />
      <PopularStores />
      <Footer />
    </div>
  );
};