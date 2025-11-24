import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, MapPin, Tag, Star, Clock, ChevronDown, Grid, List, X, ArrowLeft } from 'lucide-react';
import { offerAPI, storeAPI } from '../services/api';
import RealTimeSearch from './RealTimeSearch';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VerificationBadge from '../components/VerificationBadge';

// Animation Variants
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      staggerChildren: 0.1
    }
  },
  exit: { opacity: 0, y: -20 }
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    y: -8,
    scale: 1.03,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
};

const buttonVariants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.05,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  tap: { scale: 0.95 }
};

const filterPanelVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    y: -20
  },
  visible: {
    opacity: 1,
    height: "auto",
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    y: -20,
    transition: {
      duration: 0.2
    }
  }
};

const tabVariants = {
  inactive: {
    scale: 1,
    opacity: 0.7
  },
  active: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  hover: {
    scale: 1.05,
    opacity: 1
  }
};

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const query = searchParams.get('q') || '';
  const locationParam = searchParams.get('location') || 'All Locations';

  const [results, setResults] = useState({ stores: [], offers: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('relevance');
  const [filters, setFilters] = useState({
    category: '',
    priceRange: '',
    location: locationParam
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  };

  const renderInitials = (name, className, isOffer = false) => {
    const initials = getInitials(name);
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
        className={`${className} bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold`}
      >
        <span className={`${isOffer ? 'text-lg' : 'text-sm'}`}>
          {initials}
        </span>
      </motion.div>
    );
  };

  const ImageWithFallback = ({ src, name, className, isOffer = false }) => {
    const [imageError, setImageError] = useState(false);

    if (imageError || !src) {
      return renderInitials(name, className, isOffer);
    }

    return (
      <motion.img
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        src={src}
        alt={name}
        className={className}
        onError={() => setImageError(true)}
      />
    );
  };

  const isOfferExpired = useCallback((expirationDate) => {
    if (!expirationDate) return false;
    return new Date(expirationDate) < new Date();
  }, []);

  useEffect(() => {
    if (query.trim()) {
      loadSearchResults();
    } else {
      setResults({ stores: [], offers: [] });
      setIsLoading(false);
    }
  }, [query, locationParam, sortBy]);

  const loadSearchResults = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const searchParams = {
        search: query,
        location: locationParam !== 'All Locations' ? locationParam : undefined,
        sortBy: sortBy,
        limit: 50
      };

      const [storesResponse, offersResponse] = await Promise.all([
        storeAPI.getStores(searchParams),
        offerAPI.getOffers(searchParams)
      ]);

      const transformedOffers = (offersResponse.offers || []).map(offer => ({
        id: offer.id,
        title: offer.title || offer.service?.name || 'Special Offer',
        description: offer.description || offer.service?.description || 'Great deal available',
        discount: offer.discount ? `${offer.discount}% OFF` : 'Special Price',
        store: {
          name: offer.store?.name || offer.service?.store?.name || 'Store',
          location: offer.store?.location || offer.service?.store?.location || 'Location'
        },
        location: offer.store?.location || offer.service?.store?.location || 'Location',
        category: offer.category || offer.service?.category || 'General',
        image: offer.image || offer.service?.image_url || '/images/default-offer.png',
        isHot: offer.featured || false,
        expiration_date: offer.expiration_date,
        service: offer.service,
        store_info: offer.store
      }));

      const activeOffers = transformedOffers.filter(offer => !isOfferExpired(offer.expiration_date));

      setResults({
        stores: storesResponse.stores || [],
        offers: activeOffers
      });

    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to load search results. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchNavigate = (path) => {
    navigate(path);
  };

  const handleStoreClick = (storeId) => {
    navigate(`/Store/${storeId}`);
  };

  const handleOfferClick = (offerId) => {
    navigate(`/offer/${offerId}`);
  };

  const getFilteredResults = () => {
    let stores = [...results.stores];
    let offers = [...results.offers];

    if (filters.category) {
      stores = stores.filter(store => store.category === filters.category);
      offers = offers.filter(offer => offer.category === filters.category);
    }

    const sortFunctions = {
      relevance: (a, b) => 0,
      rating: (a, b) => (b.rating || 0) - (a.rating || 0),
      discount: (a, b) => {
        const getDiscountValue = (item) => {
          if (item.discount || item.cashback) {
            const text = item.discount || item.cashback;
            const match = text.match(/(\d+)/);
            return match ? parseInt(match[1]) : 0;
          }
          return 0;
        };
        return getDiscountValue(b) - getDiscountValue(a);
      },
      newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    };

    if (sortFunctions[sortBy]) {
      stores.sort(sortFunctions[sortBy]);
      offers.sort(sortFunctions[sortBy]);
    }

    return { stores, offers };
  };

  const filteredResults = getFilteredResults();
  const totalResults = filteredResults.stores.length + filteredResults.offers.length;

  const categories = [...new Set([
    ...results.stores.map(store => store.category),
    ...results.offers.map(offer => offer.category)
  ])].filter(Boolean);

  const renderStoreCard = (store, index) => (
    <motion.div
      key={store.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
      className={`group cursor-pointer transition-all duration-300 ${viewMode === 'grid'
          ? 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/50 dark:border-gray-700'
          : 'bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-slate-200/50 dark:border-gray-700 flex items-center'
        }`}
      onClick={() => handleStoreClick(store.id)}
    >
      {viewMode === 'grid' ? (
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="relative">
              <ImageWithFallback
                src={store.logo || store.logo_url}
                name={store.name}
                className="w-16 h-16 rounded-xl object-cover border border-slate-200"
              />
              {(store.is_verified || store.verified) && (
                <div className="absolute -bottom-0.5 -right-0.5">
                  <VerificationBadge size="sm" />
                </div>
              )}
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium"
            >
              {store.cashback || store.discount || 'Available'}
            </motion.div>
          </div>

          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {store.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-2 line-clamp-2">{store.description || `${store.category} store`}</p>

          <div className="flex items-center justify-between text-sm mb-3">
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="font-medium dark:text-white">{store.rating || '4.0'}</span>
              <span className="text-slate-500 dark:text-gray-400">({store.reviews || '0'})</span>
            </div>
            <div className="flex items-center text-slate-500 dark:text-gray-400">
              <MapPin className="w-4 h-4 mr-1" />
              <span className="text-xs">{store.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-700">
            <span className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-full">
              {store.category}
            </span>
            <motion.button
              whileHover={{ x: 5 }}
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              View Store →
            </motion.button>
          </div>
        </div>
      ) : (
        <div className="flex items-center space-x-4 p-4 w-full">
          <div className="relative">
            <ImageWithFallback
              src={store.logo || store.logo_url}
              name={store.name}
              className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-gray-700 flex-shrink-0"
            />
            {(store.is_verified || store.verified) && (
              <div className="absolute -bottom-1 -right-1">
                <VerificationBadge size="sm" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {store.name}
              </h3>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring" }}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium ml-4"
              >
                {store.cashback || store.discount || 'Available'}
              </motion.div>
            </div>

            <p className="text-sm text-slate-600 dark:text-gray-400 mb-2 line-clamp-1">{store.description || `${store.category} store`}</p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="font-medium text-sm dark:text-white">{store.rating || '4.0'}</span>
                  <span className="text-slate-500 dark:text-gray-400 text-sm">({store.reviews || '0'})</span>
                </div>
                <div className="flex items-center text-slate-500 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{store.location}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {store.category}
                </span>
                <motion.button
                  whileHover={{ x: 5 }}
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                >
                  View Store →
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );

  const renderOfferCard = (offer, index) => (
    <motion.div
      key={offer.id}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      layout
      className={`group cursor-pointer transition-all duration-300 ${viewMode === 'grid'
          ? 'bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl border border-slate-200/50 dark:border-gray-700 overflow-hidden'
          : 'bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg border border-slate-200/50 dark:border-gray-700 flex overflow-hidden'
        }`}
      onClick={() => handleOfferClick(offer.id)}
    >
      {viewMode === 'grid' ? (
        <>
          <div className="relative">
            <ImageWithFallback
              src={offer.image || offer.service?.image_url}
              name={offer.title || offer.service?.name}
              className="w-full h-48 object-cover"
              isOffer={true}
            />
            <motion.div
              initial={{ scale: 0, x: -20 }}
              animate={{ scale: 1, x: 0 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="absolute top-3 left-3"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-3 py-1 rounded-full font-bold shadow-lg">
                {offer.discount ? `${offer.discount}% OFF` : 'Special Price'}
              </div>
            </motion.div>
            {offer.isHot && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute top-3 right-3"
              >
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold shadow-lg">
                  🔥 HOT
                </div>
              </motion.div>
            )}
          </div>

          <div className="p-5">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
              {offer.title || offer.service?.name || 'Special Offer'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-gray-400 mb-3 line-clamp-2">
              {offer.description || offer.service?.description || 'Great deal available'}
            </p>

            <div className="flex items-center justify-between text-sm mb-3">
              <div className="flex items-center text-slate-600 dark:text-gray-300">
                <span className="font-medium">{offer.store?.name || offer.service?.store?.name || 'Store'}</span>
              </div>
              <div className="flex items-center text-slate-500 dark:text-gray-400">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{offer.store?.location || offer.service?.store?.location || 'Location'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-gray-700">
              <span className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-full">
                {offer.category || offer.service?.category || 'General'}
              </span>
              <motion.button
                whileHover={{ x: 5 }}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View Offer →
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="w-32 h-32 flex-shrink-0 relative">
            <ImageWithFallback
              src={offer.image || offer.service?.image_url}
              name={offer.title || offer.service?.name}
              className="w-full h-full object-cover"
              isOffer={true}
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring" }}
              className="absolute top-2 left-2"
            >
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                {offer.discount ? `${offer.discount}% OFF` : 'Special'}
              </div>
            </motion.div>
          </div>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-lg text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex-1">
                {offer.title || offer.service?.name || 'Special Offer'}
              </h3>
              {offer.isHot && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring" }}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-2 py-1 rounded-full font-bold ml-2"
                >
                  🔥 HOT
                </motion.div>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-gray-400 mb-2 line-clamp-2">
              {offer.description || offer.service?.description || 'Great deal available'}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                  {offer.store?.name || offer.service?.store?.name || 'Store'}
                </span>
                <span className="text-xs bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 px-2 py-1 rounded-full">
                  {offer.category || offer.service?.category || 'General'}
                </span>
              </div>
              <motion.button
                whileHover={{ x: 5 }}
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
              >
                View Offer →
              </motion.button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  const getDisplayResults = () => {
    switch (activeTab) {
      case 'stores':
        return { stores: filteredResults.stores, offers: [] };
      case 'offers':
        return { stores: [], offers: filteredResults.offers };
      default:
        return filteredResults;
    }
  };

  const displayResults = getDisplayResults();

  if (!query.trim()) {
    return (
      <>
        <Navbar />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800"
        >
          <div className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Search className="w-24 h-24 text-slate-300 dark:text-gray-600 mx-auto mb-6" />
              </motion.div>
              <h1 className="text-2xl font-bold text-slate-700 dark:text-white mb-2">D3 Search</h1>
              <p className="text-slate-500 dark:text-gray-400 mb-6">Find Discounted services and stores!</p>

              <div className="max-w-2xl mx-auto">
                <RealTimeSearch
                  placeholder="Search for deals, coupons & stores..."
                  onNavigate={handleSearchNavigate}
                  onStoreClick={handleStoreClick}
                  onOfferClick={handleOfferClick}
                  currentLocation={locationParam}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <motion.div
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageVariants}
        className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-gray-900 dark:to-gray-800 pb-24"
      >
        <div className="container mx-auto px-4 py-6">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-slate-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back</span>
              </motion.button>

              <div className="text-sm text-slate-500 dark:text-gray-400">
                {locationParam !== 'All Locations' && (
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    Searching in {locationParam}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mb-4">
              <RealTimeSearch
                placeholder={`Search for deals, coupons & stores...${locationParam !== 'All Locations' ? ` in ${locationParam}` : ''}`}
                onNavigate={handleSearchNavigate}
                onStoreClick={handleStoreClick}
                onOfferClick={handleOfferClick}
                currentLocation={locationParam}
                className="w-full"
              />
            </div>

            {/* Search Results Info */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                  Search Results for "{query}"
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-slate-600 dark:text-gray-400"
                >
                  {isLoading ? 'Searching...' : `${totalResults} results found`}
                  {locationParam !== 'All Locations' && ` in ${locationParam}`}
                </motion.p>
              </div>
            </div>
          </motion.div>

          {/* Tabs and Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-between mb-6 flex-wrap gap-4"
          >
            {/* Tab Navigation */}
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-gray-700 rounded-xl p-1">
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'all' ? 'active' : 'inactive'}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'all'
                    ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                All ({totalResults})
              </motion.button>
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'stores' ? 'active' : 'inactive'}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveTab('stores')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'stores'
                    ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                Stores ({filteredResults.stores.length})
              </motion.button>
              <motion.button
                variants={tabVariants}
                animate={activeTab === 'offers' ? 'active' : 'inactive'}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setActiveTab('offers')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${activeTab === 'offers'
                    ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-sm'
                    : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                  }`}
              >
                Offers ({filteredResults.offers.length})
              </motion.button>
            </div>

            {/* Controls */}
            <div className="flex items-center space-x-3">
              {/* Sort Dropdown */}
              <div className="relative">
                <motion.select
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="relevance">Sort by Relevance</option>
                  <option value="rating">Sort by Rating</option>
                  <option value="discount">Sort by Discount</option>
                  <option value="newest">Sort by Newest</option>
                </motion.select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-gray-400 pointer-events-none" />
              </div>

              {/* Filter Button */}
              <motion.button
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-600 text-slate-800 dark:text-white rounded-xl px-4 py-2 text-sm hover:border-slate-400 dark:hover:border-gray-500 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </motion.button>

              {/* View Mode Toggle */}
              <div className="flex items-center space-x-1 bg-slate-100 dark:bg-gray-700 rounded-xl p-1">
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                  <Grid className="w-4 h-4" />
                </motion.button>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list'
                      ? 'bg-white dark:bg-gray-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white'
                    }`}
                >
                  <List className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Filters Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                variants={filterPanelVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-2xl p-6 mb-6 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">Filters</h3>
                  <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsFilterOpen(false)}
                    className="text-slate-500 dark:text-gray-400 hover:text-slate-700 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">All Categories</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Price Range
                    </label>
                    <select
                      value={filters.priceRange}
                      onChange={(e) => setFilters(prev => ({ ...prev, priceRange: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-white rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Any Price</option>
                      <option value="under-1000">Under KSh 1,000</option>
                      <option value="1000-5000">KSh 1,000 - 5,000</option>
                      <option value="5000-10000">KSh 5,000 - 10,000</option>
                      <option value="over-10000">Over KSh 10,000</option>
                    </select>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      placeholder="Enter location..."
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full border border-slate-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center justify-end space-x-3 mt-6"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFilters({ category: '', priceRange: '', location: locationParam })}
                    className="px-4 py-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                  >
                    Clear All
                  </motion.button>
                  <motion.button
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setIsFilterOpen(false)}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-colors"
                  >
                    Apply Filters
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="inline-block rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"
              />
              <p className="text-slate-600 dark:text-gray-400">Searching for the best deals...</p>
            </motion.div>
          )}

          {/* Error State */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="text-center py-12"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5 }}
                  className="text-red-500 text-6xl mb-4"
                >
                  ⚠️
                </motion.div>
                <p className="text-slate-600 dark:text-gray-400 mb-4">{error}</p>
                <motion.button
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                  onClick={loadSearchResults}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-colors"
                >
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* No Results */}
          {!isLoading && !error && totalResults === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1
                }}
                className="text-6xl mb-4"
              >
                🔍
              </motion.div>
              <h3 className="text-xl font-semibold text-slate-700 dark:text-white mb-2">No results found</h3>
              <p className="text-slate-500 dark:text-gray-400 mb-6">
                We couldn't find any results for "{query}"
                {locationParam !== 'All Locations' && ` in ${locationParam}`}
              </p>
              <div className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                <p>Try:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Checking your spelling</li>
                  <li>Using more general terms</li>
                  <li>Searching in a different location</li>
                  <li>Browsing our categories</li>
                </ul>
              </div>
            </motion.div>
          )}

          {/* Results Display */}
          {!isLoading && !error && totalResults > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Stores Section */}
              {displayResults.stores.length > 0 && (
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center"
                  >
                    <MapPin className="w-5 h-5 mr-2 text-indigo-600 dark:text-indigo-400" />
                    Stores ({displayResults.stores.length})
                  </motion.h2>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={viewMode}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className={`${viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                          : 'space-y-4'
                        }`}
                    >
                      {displayResults.stores.map((store, index) => renderStoreCard(store, index))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Offers Section */}
              {displayResults.offers.length > 0 && (
                <div>
                  <motion.h2
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center"
                  >
                    <Tag className="w-5 h-5 mr-2 text-red-600 dark:text-red-400" />
                    Offers ({displayResults.offers.length})
                  </motion.h2>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={viewMode}
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      className={`${viewMode === 'grid'
                          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                          : 'space-y-4'
                        }`}
                    >
                      {displayResults.offers.map((offer, index) => renderOfferCard(offer, index))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
      <Footer />
    </>
  );
};

export default SearchResultsPage;