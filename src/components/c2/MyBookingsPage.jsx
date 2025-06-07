// My Bookings Component
const MyBookingsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    
    const bookings = [
      {
        id: 1,
        brand: 'Chicken Saloon',
        logo: '🍗',
        title: '50% OFF',
        description: 'Get 50% OFF On all services',
        expiry: 'Ends 09.15.2020',
        status: 'Active'
      },
      {
        id: 2,
        brand: 'Pizza Massage',
        logo: '🍕',
        title: 'But massage',
        description: 'Get 50% OFF On all services',
        expiry: 'Ends 09.15.2020',
        status: 'Completed'
      },
      {
        id: 3,
        brand: 'Burger Studio',
        logo: '🍔',
        title: 'Free photoshoot',
        description: 'Get 50% OFF On all services',
        expiry: 'Ends 09.15.2020',
        status: 'Cancelled'
      }
    ];
  
    const tabs = ['All', 'Completed', 'Cancelled'];
    
    const filteredBookings = activeTab === 'All' 
      ? bookings 
      : bookings.filter(booking => booking.status === activeTab);
  
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
        
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
  
        {/* Bookings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-xl">
                  {booking.logo}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {booking.brand}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {booking.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                {booking.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center text-blue-500 text-sm font-medium">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                  {booking.expiry}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  booking.status === 'Active' ? 'bg-green-100 text-green-700' :
                  booking.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  