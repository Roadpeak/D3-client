// Followed Stores Component
const FollowedStoresPage = () => {
    const stores = [
      {
        id: 1,
        name: 'WellFit Fitness Accessories',
        category: 'Fitness',
        rating: 4.8,
        followers: '12.3K',
        offers: 5,
        image: '🏋️'
      },
      {
        id: 2,
        name: 'Beauty Studio Pro',
        category: 'Beauty & Wellness',
        rating: 4.9,
        followers: '8.7K',
        offers: 3,
        image: '💄'
      },
      {
        id: 3,
        name: 'Pizza Plaza',
        category: 'Food & Dining',
        rating: 4.6,
        followers: '15.2K',
        offers: 7,
        image: '🍕'
      }
    ];
  
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Followed Stores</h1>
          <span className="text-sm text-gray-500">{stores.length} stores</span>
        </div>
        
        <div className="grid gap-4">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center text-2xl">
                    {store.image}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">{store.name}</h3>
                    <p className="text-gray-600 text-sm mb-1">{store.category}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-400 mr-1" />
                        {store.rating}
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {store.followers}
                      </div>
                      <span>{store.offers} active offers</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    View Store
                  </button>
                  <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                    Unfollow
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  