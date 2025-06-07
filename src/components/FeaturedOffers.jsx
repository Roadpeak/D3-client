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

  return (
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
  );
};

export default FeaturedOffers;