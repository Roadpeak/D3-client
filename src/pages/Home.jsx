import React, { useState } from 'react';

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

const ShoppingCart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4.01" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const Heart = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="15,18 9,12 15,6" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="9,18 15,12 9,6" />
  </svg>
);

const Play = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <polygon points="5,3 19,12 5,21" />
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

export default function DiscountCouponWebsite() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const featuredOffers = [
    {
      title: "Free Pizza",
      subtitle: "Buy any pizza, get it for free - 50% Off on first 5 orders",
      brand: "PASTA",
      color: "bg-red-500",
      discount: "50%",
      validUntil: "Dec 31, 2024"
    },
    {
      title: "30-70% Off",
      subtitle: "On all trending brands",
      brand: "",
      color: "bg-green-500",
      discount: "70%",
      validUntil: "Limited Time"
    },
    {
      title: "Free Delivery",
      subtitle: "On orders above $50",
      brand: "BISTRO",
      color: "bg-blue-500",
      discount: "FREE",
      validUntil: "This Month"
    }
  ];

  const categories = [
    { name: "Photography & Videography", icon: "🍔", color: "bg-orange-100" },
    { name: "Barber & Salon", icon: "🥤", color: "bg-blue-100" },
    { name: "Hotels & Restaurants", icon: "🛍️", color: "bg-red-100" },
    { name: "Beauty & Spa", icon: "💅", color: "bg-pink-100" },
    { name: "Travel", icon: "✈️", color: "bg-purple-100" },
    { name: "Entertainment", icon: "🎬", color: "bg-green-100" }
  ];

  const popularDeals = [
    {
      id: 1,
      title: "Sushi Ice Cream 20% off with Promo Code",
      originalPrice: "$10.50",
      salePrice: "$8.50",
      discount: "20%",
      rating: 4.5,
      reviews: 126,
      timeLeft: "2 days left",
      image: "/api/placeholder/300/200",
      tag: "HOT DEAL",
      location: "Downtown"
    },
    {
      id: 2,
      title: "Best Light BBQ 3 min Delivery Anywhere",
      originalPrice: "$20.00",
      salePrice: "$15.50",
      discount: "25%",
      rating: 4.8,
      reviews: 89,
      timeLeft: "5 hours left",
      image: "/api/placeholder/300/200",
      tag: "LIMITED TIME",
      location: "Citywide"
    },
    {
      id: 3,
      title: "Healthy Food Collections Various Items",
      originalPrice: "$18.00",
      salePrice: "$12.50",
      discount: "30%",
      rating: 4.6,
      reviews: 203,
      timeLeft: "1 day left",
      image: "/api/placeholder/300/200",
      tag: "BESTSELLER",
      location: "Multiple Locations"
    },
    {
      id: 4,
      title: "Lobster Crab Roasted 3 Cheese Pizza",
      originalPrice: "$25.00",
      salePrice: "$18.50",
      discount: "26%",
      rating: 4.9,
      reviews: 157,
      timeLeft: "3 days left",
      image: "/api/placeholder/300/200",
      tag: "PREMIUM",
      location: "Uptown"
    }
  ];

  const brands = [
    { 
      name: "Subway", 
      discount: "Get 30% Off on Orders above $40",
      logo: "/api/placeholder/80/80",
      deals: "25 deals available"
    },
    { 
      name: "McDonald's", 
      discount: "Special Burger Combo Offers",
      logo: "/api/placeholder/80/80",
      deals: "18 deals available"
    },
    { 
      name: "Pizza Hut", 
      discount: "Free Garlic Bread with 2 pizzas",
      logo: "/api/placeholder/80/80",
      deals: "32 deals available"
    },
    { 
      name: "KFC", 
      discount: "Buy 2 Get 1 Free on All Buckets",
      logo: "/api/placeholder/80/80",
      deals: "15 deals available"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      <div className="bg-red-600 text-white text-center py-2 text-sm">
        🔥 Limited Time: Get up to 70% OFF on all deals! Use code: SAVE70
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          {/* Top Header */}
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center space-x-6">
              <div className="text-2xl font-bold text-red-600">D3</div>
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4" />
                <span>Westlands, Nairobi,Kenya</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
                <span>Sell on D3</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
                <span>Customer Care</span>
              </button>
              <button className="flex items-center space-x-1 text-gray-600 hover:text-red-600">
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
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
              <a href="#" className="text-gray-700 hover:text-red-600">Today's Deals</a>
              <a href="#" className="text-gray-700 hover:text-red-600">Local Deals</a>
              <a href="#" className="text-gray-700 hover:text-red-600">Stores</a>
              <a href="#" className="text-gray-700 hover:text-red-600">Service</a>
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
              <button className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700">
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

        {/* Timer Banner */}
        <div className="mt-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-2 text-gray-800">NEW MEMBERS OFFER!</h3>
          <div className="text-4xl font-bold text-gray-800 mb-2">5 Free Deals</div>
          <p className="text-gray-700 mb-6">on first time signup </p>
          <div className="flex justify-center items-center space-x-4 text-2xl font-bold">
            <div className="bg-black text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div>09</div>
                <div className="text-xs">DAYS</div>
              </div>
            </div>
            <div className="text-black">:</div>
            <div className="bg-black text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div>07</div>
                <div className="text-xs">HRS</div>
              </div>
            </div>
            <div className="text-black">:</div>
            <div className="bg-black text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div>04</div>
                <div className="text-xs">MIN</div>
              </div>
            </div>
            <div className="text-black">:</div>
            <div className="bg-black text-white px-4 py-2 rounded-lg">
              <div className="text-center">
                <div>15</div>
                <div className="text-xs">SEC</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Offers */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">FEATURED OFFERS</h2>
          <div className="flex space-x-2">
            <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredOffers.map((offer, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className={`${offer.color} h-40 relative`}>
                <div className="absolute inset-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                  <p className="text-sm opacity-90">{offer.subtitle}</p>
                  {offer.brand && (
                    <div className="absolute top-4 right-4 bg-white text-black px-3 py-1 rounded-full text-xs font-bold">
                      {offer.brand}
                    </div>
                  )}
                  <div className="absolute bottom-4 right-4 bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-bold">
                    {offer.discount} OFF
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Valid until {offer.validUntil}</span>
                  <button className="bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600">
                    Get Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">BROWSE CATEGORIES</h2>
          <a href="#" className="text-red-500 text-sm hover:underline">View All Categories →</a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="text-center cursor-pointer group">
              <div className={`${category.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl group-hover:scale-110 transition-transform`}>
                {category.icon}
              </div>
              <p className="text-sm font-medium group-hover:text-red-600">{category.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Popular Listings */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">POPULAR LISTINGS</h2>
        
        <div className="flex space-x-6 mb-6 text-sm border-b">
          <button className="text-red-500 border-b-2 border-red-500 pb-2 font-semibold">All</button>
          <button className="text-gray-600 hover:text-red-500 pb-2">Food & Drink</button>
          <button className="text-gray-600 hover:text-red-500 pb-2">Beauty & Spa</button>
          <button className="text-gray-600 hover:text-red-500 pb-2">Activities</button>
          <button className="text-gray-600 hover:text-red-500 pb-2">Travel</button>
          <button className="text-gray-600 hover:text-red-500 pb-2">Shopping</button>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {popularDeals.map((deal) => (
            <div key={deal.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={deal.image} alt={deal.title} className="w-full h-48 object-cover" />
                <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${
                  deal.tag === 'HOT DEAL' ? 'bg-red-500' : 
                  deal.tag === 'LIMITED TIME' ? 'bg-orange-500' : 
                  deal.tag === 'BESTSELLER' ? 'bg-green-500' : 'bg-purple-500'
                }`}>
                  {deal.tag}
                </div>
                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                  <Heart className="w-4 h-4 text-gray-400" />
                </button>
                <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-red-600">
                  {deal.discount} OFF
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 text-sm line-clamp-2">{deal.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{deal.location}</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{deal.rating}</span>
                    <span className="text-xs text-gray-500">({deal.reviews})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{deal.timeLeft}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-600 text-lg">{deal.salePrice}</span>
                    <span className="text-gray-400 line-through text-sm">{deal.originalPrice}</span>
                  </div>
                  <button className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600">
                    Get Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Second row of deals */}
        <div className="grid md:grid-cols-4 gap-6">
          {popularDeals.map((deal) => (
            <div key={deal.id + 100} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={deal.image} alt={deal.title} className="w-full h-48 object-cover" />
                <div className="absolute top-3 left-3 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                  FEATURED
                </div>
                <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-sm hover:bg-gray-50">
                  <Heart className="w-4 h-4 text-gray-400" />
                </button>
                <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-bold text-red-600">
                  {deal.discount} OFF
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold mb-2 text-sm line-clamp-2">{deal.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{deal.location}</p>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{deal.rating}</span>
                    <span className="text-xs text-gray-500">({deal.reviews})</span>
                  </div>
                  <div className="flex items-center space-x-1 text-orange-600 text-xs">
                    <Clock className="w-3 h-3" />
                    <span>{deal.timeLeft}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-red-600 text-lg">{deal.salePrice}</span>
                    <span className="text-gray-400 line-through text-sm">{deal.originalPrice}</span>
                  </div>
                  <button className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600">
                    Get Deal
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 space-x-2">
          <button className="w-8 h-8 rounded-full bg-red-500 text-white">1</button>
          <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">2</button>
          <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">3</button>
          <button className="px-3 py-1 text-gray-700 hover:text-red-500">Next</button>
        </div>
      </section>

  
      {/* Statistics Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">Search Anything</h2>
            <p className="text-purple-200 max-w-2xl mx-auto">
              Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when 
              an unknown printer took a galley of type and scrambled it to make a type specimen
            </p>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-lg mt-6 transition-colors">
              Search for Deals
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-gray-800 mb-2">3200</div>
              <div className="text-gray-600">Travel Offers</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-gray-800 mb-2">96631</div>
              <div className="text-gray-600">Food Discounts</div>
            </div>
            <div className="bg-white rounded-lg p-6 text-center shadow-lg">
              <div className="text-3xl font-bold text-gray-800 mb-2">33221</div>
              <div className="text-gray-600">Electronic Deals</div>
            </div>
          </div>
        </div>
      </div>

      {/* Brands Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-500 mb-2">Select your Brand</p>
            <h2 className="text-3xl font-bold text-gray-800">BRANDS OF WORLD</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Categories */}
            <div className="lg:w-1/4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-red-200">
                  <span className="text-gray-700">Food</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">NEW</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Travel</span>
                  <span className="text-gray-400 text-sm">(32)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Flight Tickets</span>
                  <span className="text-gray-400 text-sm">(14)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Real Estate</span>
                  <span className="text-gray-400 text-sm">(40)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Fashion</span>
                  <span className="text-gray-400 text-sm">(15)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Electronics</span>
                  <span className="text-gray-400 text-sm">(26)</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700">All Brands</span>
                  <span className="text-red-500">↗</span>
                </div>
              </div>
            </div>

            {/* Brand Cards */}
            <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Salad Bay */}
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">SB</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded mb-2 inline-block">Cash Back</span>
                    <h3 className="font-semibold text-gray-800 mb-1">Upto 25% off on Online Purchase Salad Bar</h3>
                  </div>
                </div>

                {/* Coffee Cafe */}
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">CC</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded mb-2 inline-block">Promo Code</span>
                    <h3 className="font-semibold text-gray-800 mb-1">15% off on Promo Code Coffee Cafe</h3>
                  </div>
                </div>

                {/* Kare */}
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">K</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded mb-2 inline-block">Cash Back</span>
                    <h3 className="font-semibold text-gray-800 mb-1">Kare Cashback offer 53 off on First Purchase</h3>
                  </div>
                </div>

                {/* Burger Express */}
                <div className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded mb-2 inline-block">Cash Back</span>
                    <h3 className="font-semibold text-gray-800 mb-1">5$ Cashback on Purchase over $25 in Burger</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Download Section */}
      <div className="bg-gradient-to-r from-blue-200 to-purple-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-2">Download App from</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">GET MORE ON YOUR APP</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and 
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <span>▶</span>
                Get it on Google Play
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <span>🍎</span>
                Get it on Windows
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <span>🍎</span>
                Get it on Apple Store
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Features */}
            <div className="lg:w-1/3 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Largest Listing</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🛒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Maximum Savings</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">⭐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Premium Offers</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
            </div>

            {/* Center Phone */}
            <div className="lg:w-1/3 flex justify-center">
              <div className="relative">
                <div className="w-64 h-96 bg-black rounded-3xl p-4">
                  <div className="w-full h-full bg-gradient-to-b from-purple-600 to-pink-600 rounded-2xl flex flex-col items-center justify-center text-white p-6">
                    <div className="mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Daily</h3>
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold mb-4">
                      SAVE BIG
                    </div>
                    <div className="text-center text-sm">
                      <p>TRAVEL</p>
                      <p>FOOD</p>
                      <p>REAL ESTATE</p>
                      <p>FLIGHT BOOKING</p>
                      <p>HOTEL BOOKING</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Features */}
            <div className="lg:w-1/3 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">👍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Verified Products</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white">🛍️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Value Products</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">💎</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Sale Listings</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Banner */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <span className="text-4xl">🛒</span>
            <span className="text-4xl">📱</span>
            <span className="text-4xl">💳</span>
            <span className="text-4xl">🎁</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Over <span className="text-red-500">1,51,000</span> Lists Worldwide. Get <span className="text-red-500">$95,00,000</span> worth Coupons Savings
          </h2>
          
          <p className="text-gray-600 mb-8">The Greatest Library of Verified Lists</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Add a Listing ⚪
            </button>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold transition-colors">
              Search For a Coupon ⚪
            </button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-4xl opacity-20">🛒</div>
        <div className="absolute top-20 right-10 text-4xl opacity-20">📱</div>
        <div className="absolute bottom-10 left-20 text-4xl opacity-20">💳</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20">🎁</div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-16 px-4 border-t">
        <div className="max-w-6xl mx-auto">
          {/* Top Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {/* Customer Support */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span>💬</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">24/7 Customer Support</h3>
                <p className="text-gray-600 text-sm mb-2">Start live Chat how with us, we can Live Chat or Live Chat</p>
                <a href="#" className="text-red-500 text-sm">📞 Start Live Chat</a>
              </div>
            </div>

            {/* Contact Us */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span>✉️</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Contact Us</h3>
                <p className="text-gray-600 text-sm mb-1">Email: support@daily.com</p>
                <p className="text-gray-600 text-sm mb-1">Phone: 0401 271 3365</p>
                <p className="text-gray-600 text-sm">0401 271 3365</p>
              </div>
            </div>

            {/* Verified Deals */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span>✅</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Verified Deals</h3>
                <p className="text-gray-600 text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                <a href="#" className="text-red-500 text-sm">Know More</a>
              </div>
            </div>

            {/* Premium Gift Cards */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <span>🎁</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Premium Gift Cards</h3>
                <p className="text-gray-600 text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                <a href="#" className="text-red-500 text-sm">Know More</a>
              </div>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t">
            {/* Our Location */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Our Location</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📍 2307 Beverley Rd Brooklyn,</p>
                <p>Brooklyn, NY 11226</p>
                <p>📧 support@daily.com</p>
                <p>📞 1300 271 3365</p>
                <p>📞 0401 271 3365</p>
              </div>
            </div>

            {/* ListZilla */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">ListZilla</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 Contact us</p>
                <p>📝 Feedback</p>
                <p> FAQ</p>
                <p>💼 Careers</p>
                <p>📋 Terms & Conditions</p>
                <p>🔒 Privacy Policy</p>
              </div>
            </div>

            {/* Business */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Business</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>➕ Add your business</p>
                <p>📢 Advertise with us</p>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-2 mt-6">Quick links</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p>🏢 Browse Company</p>
                <p>🔍 Browse Directory</p>
                <p>🔐 Login to your account</p>
              </div>
            </div>

            {/* Follow Us & Newsletter */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
              <div className="flex gap-2 mb-6">
                <span className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-sm">f</span>
                <span className="w-8 h-8 bg-blue-400 rounded text-white flex items-center justify-center text-sm">t</span>
                <span className="w-8 h-8 bg-pink-500 rounded text-white flex items-center justify-center text-sm">i</span>
              </div>
              
              <h4 className="font-semibold text-gray-800 mb-4">Subscribe to Newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm"
                />
                <button className="bg-red-500 text-white px-4 py-2 rounded-r hover:bg-red-600 transition-colors">
                  
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Note: We do not Spam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam ex temporae.
              </p>
            </div>
          </div>

          {/* Copyright */}
          <div className="text-center pt-8 border-t mt-8">
            <p className="text-sm text-gray-500">
              Copyright © 2025, Daily. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

