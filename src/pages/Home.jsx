import React, { useState } from 'react';
import Hero from '../components/Hero';
import FeaturedOffers from '../components/FeaturedOffers';
import BrowseCategories from '../components/BrowseCategories';
import PopularListings from '../components/PopularListings';
import PopularStores from '../components/PopularStores';

export default function DiscountCouponWebsite() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Hero />
      <FeaturedOffers />
      {/* <BrowseCategories /> */}
      <PopularListings />
      <PopularStores />
    </div>
  );
}