import React from 'react';

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

const PopularListings = () => {
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

  const renderDealCard = (deal, keyPrefix = '') => (
    <div key={keyPrefix + deal.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img src={deal.image} alt={deal.title} className="w-full h-48 object-cover" />
        <div className={`absolute top-3 left-3 px-2 py-1 rounded text-xs font-bold text-white ${
          deal.tag === 'HOT DEAL' ? 'bg-red-500' : 
          deal.tag === 'LIMITED TIME' ? 'bg-orange-500' : 
          deal.tag === 'BESTSELLER' ? 'bg-green-500' : 
          deal.tag === 'FEATURED' ? 'bg-blue-500' : 'bg-purple-500'
        }`}>
          {keyPrefix ? 'FEATURED' : deal.tag}
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
  );

  return (
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
        {popularDeals.map((deal) => renderDealCard(deal))}
      </div>

      {/* Second row of deals */}
      <div className="grid md:grid-cols-4 gap-6">
        {popularDeals.map((deal) => renderDealCard(deal, 'featured-'))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-8 space-x-2">
        <button className="w-8 h-8 rounded-full bg-red-500 text-white">1</button>
        <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">2</button>
        <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300">3</button>
        <button className="px-3 py-1 text-gray-700 hover:text-red-500">Next</button>
      </div>
    </section>
  );
};

export default PopularListings;