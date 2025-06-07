import React, { useState } from 'react';
import { ChevronDown, MapPin, Star, Grid3X3, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Add this import
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Stores = () => {
  const navigate = useNavigate(); // Add this hook
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Popular');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  const categories = [
    'All',
    'Fashion & Clothing',
    'Beauty',
    'Electronics',
    'Handbags & Wallets',
    'Kids & Babies',
    'Shoes',
    'Home',
    'Jewelry & Watches'
  ];

  const locations = [
    'All Locations',
    'Westlands',
    'Kilimani',
    'CBD',
    'Roysambu',
    'Karen',
    'Utawala'
  ];

  const sortOptions = ['Popular', 'Highest Cashback', 'Lowest Cashback', 'A-Z', 'Z-A'];

  const stores = [
    {
      name: 'Walmart',
      logo: '/images/tt.png',
      cashback: '20%',
      category: 'All',
      location: 'United States',
      rating: 4.5
    },
    {
      name: 'Adidas',
      logo: '/images/tt.png',
      cashback: '80%',
      category: 'Fashion & Clothing',
      location: 'All Locations',
      rating: 4.8
    },
    {
      name: 'Samsung UK',
      logo: '/images/tt.png',
      cashback: '24%',
      category: 'Electronics',
      location: 'United Kingdom',
      rating: 4.3
    },
    {
      name: "Macy's",
      logo: '/images/tt.png',
      cashback: '35%',
      wasRate: 'Was 1%',
      category: 'Fashion & Clothing',
      location: 'United States',
      rating: 4.2
    },
    {
      name: 'Nike',
      logo: '/images/tt.png',
      cashback: '30%',
      category: 'Shoes',
      location: 'All Locations',
      rating: 4.7
    },
    {
      name: 'Dell Technologies',
      logo: '/images/tt.png',
      cashback: 'Up to 70%',
      category: 'Electronics',
      location: 'All Locations',
      rating: 4.1
    },
    {
      name: 'Newegg',
      logo: '/images/tt.png',
      cashback: '80%',
      category: 'Electronics',
      location: 'United States',
      rating: 4.4
    },
    {
      name: 'StockX',
      logo: '/images/tt.png',
      cashback: '1.4%',
      category: 'Shoes',
      location: 'All Locations',
      rating: 4.0
    },
    {
      name: "Lowe's",
      logo: '/images/tt.png',
      cashback: '1%',
      wasRate: 'Was 0.5%',
      category: 'Home',
      location: 'United States',
      rating: 4.3
    },
    {
      name: "Joe's New Balance Outlet",
      logo: '/images/tt.png',
      cashback: '1.5%',
      category: 'Shoes',
      location: 'United States',
      rating: 4.2
    },
    {
      name: 'HP.com',
      logo: '/images/tt.png',
      cashback: '3%',
      wasRate: 'Was 1%',
      category: 'Electronics',
      location: 'All Locations',
      rating: 4.1
    },
    {
      name: 'Chewy',
      logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=100&h=100&fit=crop&crop=center',
      cashback: '3%',
      category: 'All',
      location: 'United States',
      rating: 4.6
    },
    {
      name: 'Neiman Marcus',
      logo: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=100&h=100&fit=crop&crop=center',
      cashback: '4.5%',
      category: 'Fashion & Clothing',
      location: 'United States',
      rating: 4.4
    },
    {
      name: 'Sephora',
      logo: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=100&h=100&fit=crop&crop=center',
      cashback: '2.5%',
      category: 'Beauty',
      location: 'All Locations',
      rating: 4.5
    },
    {
      name: 'Foot Locker',
      logo: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=100&h=100&fit=crop&crop=center',
      cashback: '1.5%',
      category: 'Shoes',
      location: 'All Locations',
      rating: 4.3
    },
    {
      name: 'Saks Off 5TH',
      logo: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=100&h=100&fit=crop&crop=center',
      cashback: '3.2%',
      category: 'Fashion & Clothing',
      location: 'United States',
      rating: 4.2
    },
    {
      name: 'Newegg Business',
      logo: 'https://images.unsplash.com/photo-1486312338219-ce68e2c6b7bd?w=100&h=100&fit=crop&crop=center',
      cashback: '0.8%',
      category: 'Electronics',
      location: 'United States',
      rating: 4.0
    },
    {
      name: 'Uniqlo',
      logo: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=100&h=100&fit=crop&crop=center',
      cashback: '1.2%',
      category: 'Fashion & Clothing',
      location: 'All Locations',
      rating: 4.4
    },
    {
      name: "Kohl's",
      logo: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=100&h=100&fit=crop&crop=center',
      cashback: '2.4%',
      wasRate: 'Was 1%',
      category: 'Fashion & Clothing',
      location: 'United States',
      rating: 4.1
    },
    {
      name: 'Amazon',
      logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=100&h=100&fit=crop&crop=center',
      cashback: '$0.02',
      category: 'All',
      location: 'All Locations',
      rating: 4.3
    }
  ];

  const filteredStores = stores.filter(store => {
    const categoryMatch = selectedCategory === 'All' || store.category === selectedCategory;
    const locationMatch = selectedLocation === 'All Locations' || store.location === selectedLocation || store.location === 'All Locations';
    return categoryMatch && locationMatch;
  });

  // Handle store click navigation
  const handleStoreClick = (store) => {
    navigate('/ViewStore', { state: { store } });
  };

  const StoreCard = ({ store, isListView = false }) => (
    <div 
      className={`bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group ${
        isListView ? 'p-4' : 'p-6'
      }`}
      onClick={() => handleStoreClick(store)} // Add click handler
    >
      <div className={`flex items-start ${isListView ? 'justify-between' : 'justify-between mb-4'}`}>
        <div className={`flex items-center ${isListView ? 'space-x-3' : 'space-x-4'}`}>
          <div className="relative">
            <img 
              src={store.logo} 
              alt={`${store.name} logo`}
              className={`${isListView ? 'w-10 h-10' : 'w-12 h-12'} rounded-full object-cover border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg`}
            />
          </div>
          <div>
            <h3 className={`font-semibold text-gray-900 ${isListView ? 'text-base' : 'text-lg'}`}>{store.name}</h3>
            <div className="flex items-center space-x-1 mt-1">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              <span className="text-sm text-gray-600 font-medium">{store.rating}</span>
            </div>
          </div>
        </div>
        <div className={`text-right ${isListView ? '' : ''}`}>
          <div className={`text-red-500 font-bold ${isListView ? 'text-lg' : 'text-xl'}`}>{store.cashback}</div>
          <div className="text-gray-500 text-sm font-medium">Cashback</div>
          {store.wasRate && (
            <div className="text-gray-400 text-sm mt-1">{store.wasRate}</div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All stores</h1>
          
          {/* Sort and Location Filters */}
          <div className="flex items-center space-x-4">
            {/* Mobile View Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-red-500 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Location Filter */}
            <div className="relative">
              <button
                onClick={() => setShowLocationDropdown(!showLocationDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700 hidden sm:inline">{selectedLocation}</span>
                <span className="text-gray-700 sm:hidden">Location</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showLocationDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {locations.map((location) => (
                    <button
                      key={location}
                      onClick={() => {
                        setSelectedLocation(location);
                        setShowLocationDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="text-gray-700 hidden sm:inline">Sort by {sortBy}</span>
                <span className="text-gray-700 sm:hidden">Sort</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>
              
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  {sortOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                      className="block w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg transition-colors"
                    >
                      Sort by {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-3 rounded-full whitespace-nowrap font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Stores Grid/List */}
        {viewMode === 'list' ? (
          <div className="space-y-4 md:hidden">
            {filteredStores.map((store, index) => (
              <StoreCard key={index} store={store} isListView={true} />
            ))}
          </div>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid' && window.innerWidth < 768 
              ? 'grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}>
            {filteredStores.map((store, index) => (
              <StoreCard key={index} store={store} />
            ))}
          </div>
        )}

        {/* No results message */}
        {filteredStores.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">No stores found for the selected filters.</div>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedLocation('All Locations');
              }}
              className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Stores;