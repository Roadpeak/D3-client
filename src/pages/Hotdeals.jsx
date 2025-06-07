import { useState } from 'react';
import { Search, ShoppingCart, User, Star, Heart, Grid, List, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

export default function Hotdeals() {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { name: 'Real Estate', count: 2290 },
    { name: 'Groceries', count: 1563 },
    { name: 'Coupons', count: 1290, active: true },
    { name: 'Baby Products', count: 1169 },
    { name: 'Travel', count: 1152 },
    { name: 'Food', count: 945 },
    { name: 'Flight Tickets', count: 1252 },
    { name: 'Electronics', count: 943 }
  ];

  const topDeals = [
    {
      title: 'Martin & Freeman April Wine Exclusive Deal',
      price: '$350',
      category: 'Wine'
    },
    {
      title: 'Morice Mary - Sweet Beverages 15% Off',
      price: '$79',
      category: 'Beverages'
    },
    {
      title: 'Mario\'s Pizza Valerie Mark Burgers @ 10% Off',
      price: '$45',
      category: 'Food'
    }
  ];

  const brands = [
    'https://via.placeholder.com/60x40/FF6B35/FFFFFF?text=KFC',
    'https://via.placeholder.com/60x40/00A651/FFFFFF?text=SB',
    'https://via.placeholder.com/60x40/FDB913/000000?text=MW',
    'https://via.placeholder.com/60x40/E31837/FFFFFF?text=Pizza',
    'https://via.placeholder.com/60x40/0066CC/FFFFFF?text=Star',
    'https://via.placeholder.com/60x40/FF0000/FFFFFF?text=KFC',
    'https://via.placeholder.com/60x40/8B4513/FFFFFF?text=Cafe',
    'https://via.placeholder.com/60x40/228B22/FFFFFF?text=MT',
    'https://via.placeholder.com/60x40/FF69B4/FFFFFF?text=Ice'
  ];

  const deals = [
    {
      id: 1,
      title: 'WellFit Fitness Accessories Year End Sale',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '25% Off',
      category: 'Fitness',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop'
    },
    {
      id: 2,
      title: 'Tasty Buds - Cake Factory Promo Code Offer',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '30% Off',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=200&fit=crop',
      featured: true
    },
    {
      id: 3,
      title: 'Lafuns Diamond Jewellery Cash Back 25%',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '25% CB',
      category: 'Jewelry',
      image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=300&h=200&fit=crop'
    },
    {
      id: 4,
      title: '30-40min Spa Massage | Hurry Now',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '30% Off',
      category: 'Spa',
      image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=300&h=200&fit=crop'
    },
    {
      id: 5,
      title: 'Sofie Ice Cream 25% off on Desserts',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '30% Off',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=300&h=200&fit=crop'
    },
    {
      id: 6,
      title: 'Kushi Indian food - 30% off - Hurry Now',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '30% Off',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&h=200&fit=crop'
    },
    {
      id: 7,
      title: 'Spicy Tacos 3 Pc | Britanay Herbal Tea',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '25% Off',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=300&h=200&fit=crop'
    },
    {
      id: 8,
      title: 'Cream Cafe Villa Straw Coffee Table Price',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '30% Off',
      category: 'Coffee',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=200&fit=crop'
    },
    {
      id: 9,
      title: 'Punk Man Shoes | Cashback Over Orders $199',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '25% CB',
      category: 'Fashion',
      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=200&fit=crop'
    },
    {
      id: 10,
      title: 'Elton Lights Offer at min 20% - Hurry Now',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '25% Off',
      category: 'Home',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=300&h=200&fit=crop'
    },
    {
      id: 11,
      title: 'New Year Party Celebration 15% Off',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '30% Off',
      category: 'Party',
      image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&h=200&fit=crop'
    },
    {
      id: 12,
      title: 'Lorenzo Face Blushes at attractive price',
      description: 'Get exclusive offers at your favourite Pizza Plaza Shop with these coupons',
      discount: '25% CB',
      category: 'Beauty',
      image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&h=200&fit=crop'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Import and use your Navbar component */}
      <Navbar />

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-red-500">Home</a>
              <a href="#" className="text-red-500 font-medium">Nairobi</a>
            </div>
            
            {/* Mobile Filter Button */}
            <button 
              className="md:hidden bg-red-500 text-white px-3 py-1 rounded text-sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              Filters
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6 relative">
          {/* Sidebar */}
          <div className={`${
            isSidebarOpen ? 'block' : 'hidden'
          } md:block w-full md:w-80 flex-shrink-0 ${
            isSidebarOpen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : ''
          }`}>
            {/* Mobile Close Button */}
            {isSidebarOpen && (
              <div className="md:hidden flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <button onClick={() => setIsSidebarOpen(false)}>
                  <X size={24} />
                </button>
              </div>
            )}

            <div className="p-4 md:p-0 space-y-6">
              {/* Categories */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                  CATEGORIES
                </h3>
                <ul className="space-y-2">
                  {categories.map((category, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <span className={`text-sm ${category.active ? 'text-red-500 font-medium' : 'text-gray-600'}`}>
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-400">({category.count})</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Deals */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                  TOP DEALS
                </h3>
                <div className="space-y-4">
                  {topDeals.map((deal, index) => (
                    <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                      <h4 className="text-sm font-medium text-gray-800 mb-1">{deal.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{deal.category}</p>
                      <p className="text-lg font-bold text-red-500">{deal.price}</p>
                    </div>
                  ))}
                  <button className="text-red-500 text-sm font-medium flex items-center">
                    View All <ChevronRight size={14} className="ml-1" />
                  </button>
                </div>
              </div>

              {/* Popular Brands */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                  POPULAR STORES
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {brands.map((brand, index) => (
                    <div key={index} className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <img src={brand} alt={`Brand ${index + 1}`} className="w-full h-full object-contain rounded" />
                    </div>
                  ))}
                </div>
              </div>

              {/* ListZilla Ad */}
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white text-center">
                <h3 className="text-xl font-bold mb-2">ListZilla</h3>
                <div className="bg-yellow-400 text-purple-800 px-4 py-2 rounded-lg font-bold text-lg mb-3">
                  SALE
                  <div className="text-sm">Get 20% Off</div>
                </div>
                <p className="text-sm mb-2">Hurry! 200+ Listings Available</p>
                <p className="text-lg font-bold">Over $2000 worth Coupons</p>
              </div>
            </div>
          </div>

          {/* Sidebar Overlay */}
          {isSidebarOpen && (
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* View Controls */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'}`}
                >
                  <Grid size={16} />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort By:</span>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>Latest</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Discount</option>
                  <option>Location</option>
                </select>
              </div>
            </div>

          {/* Deals Grid */}
<div className={`grid gap-4 sm:gap-6 mb-8 ${
  viewMode === 'grid' 
    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
    : 'grid-cols-1'
}`}>
  {deals.map((deal) => (
    <div key={deal.id} className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ${
      viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
    }`}>
      <div className={`relative ${viewMode === 'list' ? 'sm:w-1/3' : ''}`}>
        <img 
          src={deal.image} 
          alt={deal.title}
          className={`w-full object-cover ${
            viewMode === 'list' ? 'h-48 sm:h-full' : 'h-48'
          }`}
        />
        <button className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:bg-white">
          <Heart size={16} className="text-gray-600" />
        </button>
        <div className="absolute bottom-3 left-3">
          <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
            deal.featured ? 'bg-red-500' : 'bg-blue-500'
          }`}>
            {deal.category}
          </span>
        </div>
      </div>
      <div className={`p-4 ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
        
        <div className="flex items-center gap-2 mb-3">
          
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
            <img 
              src={deal.store?.googleLogo || '/api/placeholder/20/20'} 
              alt="logo"
              className="w-5 h-5"
            />
          </div>
          
          {/* Store Pill */}
          <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400">
            <span>{deal.store?.name || 'Store name'}</span>
          </div>
        </div>
        
        <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{deal.title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{deal.description}</p>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            deal.discount.includes('CB') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
          }`}>
            {deal.discount}
          </span>
          
          
          <button 
        className={`px-8 py-4 rounded text-sm font-medium ${
         deal.featured ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'
         }`}
         onClick={() => navigate('/offer')}
         >
        Get Offer
        </button>
        </div>
      </div>
    </div>
  ))}
</div>

            {/* Pagination */}
            <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
              <button className="p-2 rounded hover:bg-gray-100">
                <ChevronLeft size={16} />
              </button>
              <div className="flex space-x-2">
                {[1, 2, 3, 4].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded ${
                      currentPage === page 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="px-3 py-2 hidden sm:inline">...</span>
                <button className="px-3 py-2 rounded bg-white text-gray-700 hover:bg-gray-50 hidden sm:inline-block">
                  15
                </button>
              </div>
              <button className="p-2 rounded hover:bg-gray-100">
                <ChevronRight size={16} />
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">1 - 48 of 432 results</p>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div className="bg-gradient-to-r from-blue-400 to-blue-600 py-8 sm:py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 mb-4 space-y-4 sm:space-y-0">
            <div className="bg-white p-3 rounded-lg">
              🛒
            </div>
            <div className="text-white">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">
                Over <span className="text-yellow-300">1,51,000</span> Lists Worldwide
              </h2>
              <p className="text-lg sm:text-xl font-bold mb-2">
                Get <span className="text-yellow-300">$95,00,000</span> worth Coupons Savings
              </p>
              <p className="text-blue-100 text-sm sm:text-base">The Coolest Library of Verified Lists</p>
            </div>
            <div className="bg-white p-3 rounded-lg">
              🎁
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center sm:space-x-4 space-y-4 sm:space-y-0">
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 w-full sm:w-auto">
              Add a Listing ⭕
            </button>
            <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 w-full sm:w-auto">
              Search for a Coupon 🔍
            </button>
          </div>
        </div>
      </div>

      
      <Footer />
    </div>
  );
}