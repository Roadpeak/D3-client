import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import FeaturedOffers from '../components/FeaturedOffers';
import BrowseCategories from '../components/BrowseCategories';
import PopularListings from '../components/PopularListings';
import PopularStores from '../components/PopularStores';
import Footer from '../components/Footer';

// Custom SVG Icons for the homepage sections
const Play = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <polygon points="5,3 19,12 5,21" />
  </svg>
);

export default function DiscountCouponWebsite() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar Component */}
      <Navbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Hero Banner */}
          <div className="lg:col-span-2 relative bg-gradient-to-r from-gray-800 to-gray-600 rounded-lg overflow-hidden h-80">
            <img src="/images/Home1.png" alt="Hero Deal" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-16 h-16 text-white opacity-80 cursor-pointer hover:opacity-100" />
            </div>
            <div className="absolute bottom-6 left-6 text-white">
              <h2 className="text-3xl font-bold mb-2">Get 50% off</h2>
              <p className="text-lg mb-4">On your first deal purchase</p>
              <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
                Grab Offer
              </button>
            </div>
          </div>

          {/* Side Deals */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/images/spa.png" alt="Side Deal 1" className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold mb-1">Spa & Wellness Package</h3>
                <p className="text-red-600 font-bold text-lg">$29.99 <span className="text-gray-400 line-through text-sm">$79.99</span></p>
                <p className="text-xs text-gray-600 mb-2">62% OFF • 2 days left</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold">
                  Get Deal
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <img src="/images/safr.jpg" alt="Side Deal 2" className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="font-semibold mb-1">Adventure Activities</h3>
                <p className="text-red-600 font-bold text-lg">$45.00 <span className="text-gray-400 line-through text-sm">$89.00</span></p>
                <p className="text-xs text-gray-600 mb-2">49% OFF • Limited spots</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded text-sm font-semibold">
                  Get Deal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <FeaturedOffers />

     
      <BrowseCategories />

      
      <PopularListings />

      
      <PopularStores />

      
      <Footer />
    </div>
  );
};