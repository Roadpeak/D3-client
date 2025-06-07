import React from 'react';
import { Link } from 'react-router-dom';

// Custom SVG Icons
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const NotificationIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);
const MenuIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const Navbar = () => {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        {/* Top Header */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center space-x-6">
            <div className="text-2xl font-bold text-red-500">D3</div>
            <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>Westlands, Nairobi,Kenya</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
              <span>List on D3</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
              <span>Customer Care</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <div className="relative">
              <NotificationIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex items-center justify-between py-4">
          <nav className="hidden lg:flex items-center space-x-8">
            <button className="flex items-center space-x-1 text-gray-700 hover:text-red-600">
              <MenuIcon className="w-4 h-4" />
              <span>All Categories</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <Link to="../" className="text-gray-700 hover:text-red-600">Home</Link>
           <Link to="../Hotdeals" className="text-gray-700 hover:text-red-600">Hot Deals</Link>
           <Link to="../Stores" className="text-gray-700 hover:text-red-600">Stores</Link>
           <Link to="../Requestservice" className="text-gray-700 hover:text-red-600">Request Service</Link>
           <Link to="../chat" className="text-gray-700 hover:text-red-600">chat</Link>
          </nav>
          
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search for deals, restaurants, spas, activities..."
                className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-red-600 text-white px-4 py-2 rounded-md">
                <Search className="w-4 h-4" />
              </button>
            </div>
          </div>

          <button className="lg:hidden">
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;