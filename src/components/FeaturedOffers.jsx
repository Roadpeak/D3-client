import React from 'react';

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

const FeaturedOffers = () => {
  const featuredOffers = [
    {
      storeName: "Serenity Spa",
      offerName: "Spa Treatment",
      discount: "30% Off",
      backgroundImage: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=250&fit=crop",
      logoColor: "bg-purple-600",
      logoText: "S"
    },
    {
      storeName: "FitLife Gym", 
      offerName: "Personal Training",
      discount: "25% Off",
      backgroundImage: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=250&fit=crop",
      logoColor: "bg-blue-500",
      logoText: "FL"
    },
    {
      storeName: "Bella Salon",
      offerName: "Hair & Beauty Services",
      discount: "40% Off", 
      backgroundImage: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&h=250&fit=crop",
      logoColor: "bg-pink-600",
      logoText: "BS"
    },
    {
      storeName: "Taste Bistro",
      offerName: "Dining Experience",
      discount: "20% Off",
      backgroundImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=250&fit=crop", 
      logoColor: "bg-orange-600",
      logoText: "TB"
    }
  ];

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">FEATURED OFFERS</h2>
        <div className="flex space-x-2">
          <button className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-2 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {featuredOffers.map((offer, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Background Image */}
              <div 
                className="h-40 bg-cover bg-center relative"
                style={{
                  backgroundImage: `url(${offer.backgroundImage})`
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                
                {/* Store Logo */}
                <div className="absolute bottom-3 left-3">
                  <div className={`${offer.logoColor} w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {offer.logoText}
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-4 bg-white">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">
                  {offer.storeName}
                </h3>
                <p className="text-gray-600 text-xs mb-1">
                  {offer.offerName}
                </p>
                <p className="text-red-500 font-bold text-sm">
                  {offer.discount}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedOffers;