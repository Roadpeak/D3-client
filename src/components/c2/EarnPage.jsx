// Earn Component
const EarnPage = () => {
    const [activeEarnTab, setActiveEarnTab] = useState('Overview');
    
    const stats = {
      totalEarnings: '$1,234.50',
      pendingEarnings: '$89.25',
      totalReferrals: 45,
      thisMonth: '$234.80'
    };
  
    const referrals = [
      { name: 'John Doe', earnings: '$25.00', date: '2025-06-05', status: 'Completed' },
      { name: 'Jane Smith', earnings: '$15.50', date: '2025-06-04', status: 'Pending' },
      { name: 'Mike Johnson', earnings: '$30.00', date: '2025-06-03', status: 'Completed' }
    ];
  
    const earnTabs = ['Overview', 'Referrals', 'Withdraw'];
  
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Earn Money</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold">{stats.totalEarnings}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">This Month</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending</p>
                <p className="text-2xl font-bold">{stats.pendingEarnings}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Referrals</p>
                <p className="text-2xl font-bold">{stats.totalReferrals}</p>
              </div>
              <Users className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
  
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 bg-gray-100 p-1 rounded-lg">
          {earnTabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveEarnTab(tab)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                activeEarnTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
  
        {/* Tab Content */}
        {activeEarnTab === 'Overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Affiliate Program</h2>
              <p className="text-gray-600 mb-4">
                Earn money by referring friends and family to our platform. Get 15% commission on their first purchase!
              </p>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="font-medium text-blue-900 mb-2">Your Referral Link</h3>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="https://d3.com/ref/luisnatasha"
                    readOnly
                    className="flex-1 bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
  
        {activeEarnTab === 'Referrals' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Recent Referrals</h2>
            <div className="space-y-4">
              {referrals.map((referral, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900">{referral.name}</h3>
                    <p className="text-sm text-gray-600">Referred on {referral.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{referral.earnings}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      referral.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {referral.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
  
        {activeEarnTab === 'Withdraw' && (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Withdraw Earnings</h2>
            <div className="max-w-md">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Available Balance</label>
                <div className="text-3xl font-bold text-green-600">{stats.totalEarnings}</div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Withdrawal Amount</label>
                <input
                  type="number"
                  placeholder="Enter amount"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Bank Transfer</option>
                  <option>PayPal</option>
                  <option>Mobile Money</option>
                </select>
              </div>
              
              <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <Wallet className="w-5 h-5" />
                Request Withdrawal
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };