import { useState, useEffect } from 'react';
import { Heart, Grid, List, ChevronLeft, ChevronRight, X, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { offerAPI } from '../services/offerService';

export default function Hotdeals() {
  const [viewMode, setViewMode] = useState('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Data states
  const [offers, setOffers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [topDeals, setTopDeals] = useState([]);
  const [brands, setBrands] = useState([]);
  const [pagination, setPagination] = useState({});
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('latest');
  const [limit, setLimit] = useState(12);

  const navigate = useNavigate();

  // Fetch data on component mount and when filters change
  useEffect(() => {
    fetchData();
  }, [currentPage, selectedCategory, sortBy, limit]);

  // Fetch categories and top deals on mount and when filters change
  useEffect(() => {
    fetchCategoriesAndDeals();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        limit: limit,
        sortBy: sortBy,
        status: 'active',
        ...(selectedCategory && { category: selectedCategory })
      };

      const response = await offerAPI.getOffers(params);
      
      // Transform offers to match frontend expectations
      const transformedOffers = response.offers?.map(offer => ({
        id: offer.id,
        title: offer.title || offer.service?.name || "Special Offer",
        description: offer.description || offer.service?.description || "Get exclusive offers with these amazing deals",
        discount: `${offer.discount}% OFF`,
        image: offer.service?.image_url || '/api/placeholder/300/200',
        category: offer.service?.category || 'General',
        featured: offer.featured || false,
        store: {
          name: offer.store?.name || 'Store',
          googleLogo: offer.store?.logo_url || '/api/placeholder/20/20'
        },
        originalPrice: offer.service?.price || 0,
        discountedPrice: offer.service?.price ? (offer.service.price * (1 - offer.discount / 100)).toFixed(2) : 0,
        status: offer.status
      })) || [];

      setOffers(transformedOffers);
      setPagination(response.pagination || {});

      // Refresh categories after fetching offers to ensure they're in sync
      await fetchCategories();
    } catch (err) {
      setError('Failed to fetch offers. Please try again.');
      console.error('Error fetching offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoriesResponse = await offerAPI.getCategories();
      setCategories(categoriesResponse.categories || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Set fallback categories if API fails
      setCategories([
        { name: 'Food & Dining', count: 0 },
        { name: 'Health & Beauty', count: 0 },
        { name: 'Fitness & Sports', count: 0 },
        { name: 'Automotive', count: 0 }
      ]);
    }
  };

  const fetchCategoriesAndDeals = async () => {
    try {
      // Fetch categories from active offers
      await fetchCategories();

      // Fetch top deals
      const dealsResponse = await offerAPI.getTopDeals(3);
      const transformedDeals = dealsResponse.topDeals?.map(deal => ({
        title: deal.title || deal.service?.name || "Special Deal",
        category: deal.service?.category || 'General',
        price: deal.service?.price && deal.discount 
          ? `${(deal.service.price * (1 - deal.discount / 100)).toFixed(2)}`
          : '$50.00',
        originalPrice: deal.service?.price ? `${deal.service.price}` : '$100.00',
        discount: `${deal.discount}% OFF`
      })) || [];
      
      setTopDeals(transformedDeals);

      // Keep static brands for demo
      setBrands([
        'https://via.placeholder.com/60x40/FF6B35/FFFFFF?text=KFC',
        'https://via.placeholder.com/60x40/00A651/FFFFFF?text=SB',
        'https://via.placeholder.com/60x40/FDB913/000000?text=MW',
        'https://via.placeholder.com/60x40/E31837/FFFFFF?text=Pizza',
        'https://via.placeholder.com/60x40/0066CC/FFFFFF?text=Star',
        'https://via.placeholder.com/60x40/FF0000/FFFFFF?text=KFC',
        'https://via.placeholder.com/60x40/8B4513/FFFFFF?text=Cafe',
        'https://via.placeholder.com/60x40/228B22/FFFFFF?text=MT',
        'https://via.placeholder.com/60x40/FF69B4/FFFFFF?text=Ice'
      ]);
    } catch (err) {
      console.error('Error fetching categories and deals:', err);
    }
  };

  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(selectedCategory === category ? '' : category);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
      setCurrentPage(page);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  const handleRetry = () => {
    fetchData();
    fetchCategoriesAndDeals();
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSortBy('latest');
    setCurrentPage(1);
  };

  if (loading && offers.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin" size={24} />
            <span>Loading offers...</span>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center space-x-8">
              <a href='/Home' className="text-gray-600 hover:text-red-500">Home</a>
              <a href='/Home' className="text-red-500 font-medium">Nairobi</a>
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

      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span>{error}</span>
            </div>
            <button 
              onClick={handleRetry} 
              className="ml-4 underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-800 border-b border-yellow-400 pb-2">
                    CATEGORIES
                  </h3>
                  <button
                    onClick={fetchCategories}
                    className="text-xs text-blue-600 hover:text-blue-800"
                    title="Refresh categories"
                  >
                    🔄
                  </button>
                </div>
                <ul className="space-y-2">
                  <li className="flex items-center justify-between">
                    <button
                      onClick={() => handleCategoryChange('')}
                      className={`text-sm ${!selectedCategory ? 'text-red-500 font-medium' : 'text-gray-600 hover:text-red-500'}`}
                    >
                      All Categories
                    </button>
                    <span className="text-xs text-gray-400">
                      ({offers.length})
                    </span>
                  </li>
                  {categories.length > 0 ? (
                    categories.map((category, index) => (
                      <li key={index} className="flex items-center justify-between">
                        <button
                          onClick={() => handleCategoryChange(category.name)}
                          className={`text-sm ${selectedCategory === category.name ? 'text-red-500 font-medium' : 'text-gray-600 hover:text-red-500'}`}
                        >
                          {category.name}
                        </button>
                        <span className="text-xs text-gray-400">({category.count})</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500 italic">
                      {loading ? 'Loading categories...' : 'No categories available'}
                    </li>
                  )}
                </ul>
                {(selectedCategory || sortBy !== 'latest') && (
                  <button 
                    onClick={clearFilters}
                    className="mt-4 text-xs text-blue-600 hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>

              {/* Top Deals */}
              {topDeals.length > 0 && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-semibold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                    TOP DEALS
                  </h3>
                  <div className="space-y-4">
                    {topDeals.map((deal, index) => (
                      <div key={index} className="border-b border-gray-100 pb-3 last:border-b-0">
                        <h4 className="text-sm font-medium text-gray-800 mb-1">{deal.title}</h4>
                        <p className="text-sm text-gray-500 mb-2">{deal.category}</p>
                        <div className="flex items-center space-x-2">
                          <p className="text-lg font-bold text-red-500">{deal.price}</p>
                          {deal.originalPrice && (
                            <p className="text-sm text-gray-400 line-through">{deal.originalPrice}</p>
                          )}
                        </div>
                        <p className="text-xs text-green-600 font-medium">{deal.discount}</p>
                      </div>
                    ))}
                    <button className="text-red-500 text-sm font-medium flex items-center hover:underline">
                      View All <ChevronRight size={14} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}

              {/* Popular Brands */}
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 border-b border-yellow-400 pb-2">
                  POPULAR STORES
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {brands.map((brand, index) => (
                    <div key={index} className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
                      <img 
                        src={brand} 
                        alt={`Brand ${index + 1}`} 
                        className="w-full h-full object-contain rounded"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/60/40';
                        }}
                      />
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
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  <List size={16} />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}
                >
                  <Grid size={16} />
                </button>
                {pagination.totalItems > 0 && (
                  <span className="text-sm text-gray-600 hidden sm:inline">
                    Showing {Math.min((currentPage - 1) * pagination.itemsPerPage + 1, pagination.totalItems)} - {Math.min(currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 hidden sm:inline">Sort By:</span>
                <select 
                  className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="price_low_high">Price: Low to High</option>
                  <option value="price_high_low">Price: High to Low</option>
                  <option value="discount">Discount</option>
                </select>
              </div>
            </div>

            {/* Loading indicator for pagination */}
            {loading && offers.length > 0 && (
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            )}

            {/* Deals Grid */}
            <div className={`grid gap-4 sm:gap-6 mb-8 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {offers.map((offer) => (
                <div 
                  key={offer.id} 
                  className={`bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                    viewMode === 'list' ? 'flex flex-col sm:flex-row' : ''
                  }`}
                  onClick={() => handleOfferClick(offer.id)}
                >
                  <div className={`relative ${viewMode === 'list' ? 'sm:w-1/3' : ''}`}>
                    <img 
                      src={offer.image} 
                      alt={offer.title}
                      className={`w-full object-cover ${
                        viewMode === 'list' ? 'h-48 sm:h-full' : 'h-48'
                      }`}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                    <button 
                      className="absolute top-3 right-3 bg-white/80 p-2 rounded-full hover:bg-white transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle favorite logic here
                      }}
                    >
                      <Heart size={16} className="text-gray-600" />
                    </button>
                    <div className="absolute bottom-3 left-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium text-white ${
                        offer.featured ? 'bg-red-500' : 'bg-blue-500'
                      }`}>
                        {offer.category}
                      </span>
                    </div>
                    {offer.featured && (
                      <div className="absolute top-3 left-3">
                        <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-medium">
                          FEATURED
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={`p-4 ${viewMode === 'list' ? 'sm:flex-1' : ''}`}>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-200">
                        <img 
                          src={offer.store?.googleLogo || '/api/placeholder/20/20'} 
                          alt="logo"
                          className="w-5 h-5"
                          onError={(e) => {
                            e.target.src = '/api/placeholder/20/20';
                          }}
                        />
                      </div>
                      
                      {/* Store Pill */}
                      <div className="flex items-center bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg border border-blue-400">
                        <span>{offer.store?.name || 'Store name'}</span>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-gray-800 mb-2 line-clamp-2">{offer.title}</h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{offer.description}</p>
                    
                    {/* Price display */}
                    {offer.originalPrice > 0 && (
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-lg font-bold text-green-600">
                          ${offer.discountedPrice}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          ${offer.originalPrice}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="px-3 py-1 rounded text-sm font-medium bg-red-100 text-red-700">
                        {offer.discount}
                      </span>
                      
                      <button 
                        className={`px-8 py-4 rounded text-sm font-medium transition-colors ${
                          offer.featured ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOfferClick(offer.id);
                        }}
                      >
                        Get Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* No offers message */}
            {!loading && offers.length === 0 && (
              <div className="text-center py-12">
                <div className="max-w-md mx-auto">
                  <div className="text-gray-400 mb-4">
                    <Grid size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No offers found</h3>
                  <p className="text-gray-500 mb-4">
                    {selectedCategory 
                      ? `No offers found in "${selectedCategory}" category.`
                      : 'No offers are currently available.'
                    }
                  </p>
                  {(selectedCategory || sortBy !== 'latest') && (
                    <button 
                      onClick={clearFilters}
                      className="text-red-500 hover:underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex flex-col items-center space-y-4">
                <div className="flex items-center justify-center space-x-2 flex-wrap gap-2">
                  <button 
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrevPage}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="flex space-x-2">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                      let page;
                      if (pagination.totalPages <= 5) {
                        page = i + 1;
                      } else if (currentPage <= 3) {
                        page = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        page = pagination.totalPages - 4 + i;
                      } else {
                        page = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 rounded transition-colors ${
                            currentPage === page 
                              ? 'bg-red-500 text-white' 
                              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    {pagination.totalPages > 5 && currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="px-3 py-2 hidden sm:inline">...</span>
                        <button 
                          className="px-3 py-2 rounded bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 hidden sm:inline-block"
                          onClick={() => handlePageChange(pagination.totalPages)}
                        >
                          {pagination.totalPages}
                        </button>
                      </>
                    )}
                  </div>
                  <button 
                    className="p-2 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNextPage}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                {/* Pagination Info */}
                {pagination.totalItems > 0 && (
                  <p className="text-center text-sm text-gray-500">
                    Page {currentPage} of {pagination.totalPages} • {pagination.totalItems} total results
                  </p>
                )}
              </div>
            )}
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
            <button className="bg-red-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-600 w-full sm:w-auto transition-colors">
              Add a Listing ⭕
            </button>
            <button className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-yellow-500 w-full sm:w-auto transition-colors">
              Search for a Coupon 🔍
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}