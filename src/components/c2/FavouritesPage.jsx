// Favourites Component
const FavouritesPage = () => {
    const favourites = [
      {
        id: 1,
        store: 'Walmart',
        offer: '20% Cashback',
        rating: 4.5,
        category: 'Shopping',
        description: 'Get 20% cashback on all purchases'
      },
      {
        id: 2,
        store: 'Pizza Studio',
        offer: 'Buy 1 Get 1 Free',
        rating: 4.8,
        category: 'Food',
        description: 'Buy one pizza and get another absolutely free'
      },
      {
        id: 3,
        store: 'Fitness Plus',
        offer: '25% Off',
        rating: 4.6,
        category: 'Fitness',
        description: 'Get 25% off on all fitness accessories'
      }
    ];
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">My Favourites</h1>
          <span className="text-sm text-gray-500">{favourites.length} items</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((item) => (
            <div key={item.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <Heart className="w-5 h-5 text-red-500 fill-current" />
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-1">{item.store}</h3>
              <p className="text-blue-600 font-medium mb-2">{item.offer}</p>
              <p className="text-gray-600 text-sm mb-3">{item.description}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 mr-1" />
                  <span className="text-sm text-gray-600">{item.rating}</span>
                </div>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {item.category}
                </span>
              </div>
              
              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Get Offer
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };