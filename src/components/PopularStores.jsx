import React from 'react';
import { Star } from 'lucide-react';

const PopularStores = () => {
  return (
    <>
      {/* Statistics Section */}
      <div className="bg-white py-16 px-4">
  <div className="max-w-6xl mx-auto">
    <div className="text-center mb-12">
      <h2 className="text-4xl font-bold text-gray-800 mb-2">Travel with D3</h2>
      <p className="text-gray-500 text-lg">Here Comes Summer</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {/* Hotels.com */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-32 bg-gradient-to-br from-orange-100 to-orange-200 relative">
          <img 
            src="/images/ori.jpg" 
            alt="Hotels.com" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-white rounded-full p-1">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">OE</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">ORIBI Expeditions</h3>
          <p className="text-red-500 text-sm font-medium">Up to 30% Off</p>
        </div>
      </div>

      {/* Flight Centre AU */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-32 bg-gradient-to-br from-blue-100 to-blue-200 relative">
          <img 
            src="/images/bn.gif" 
            alt="Flight Centre AU" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-white rounded-full p-1">
            <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">BA</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Bonfire adventure</h3>
          <p className="text-red-500 text-sm font-medium">10% Cashback</p>
        </div>
      </div>

      {/* HopeGoo */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-32 bg-gradient-to-br from-green-100 to-green-200 relative">
          <img 
            src="/images/safr.jpg" 
            alt="HopeGoo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-white rounded-full p-1">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">kts</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Kts Safari</h3>
          <p className="text-red-500 text-sm font-medium">25% Discounts</p>
        </div>
      </div>

      {/* IHG Hotels & Resorts */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-32 bg-gradient-to-br from-amber-100 to-amber-200 relative">
          <img 
            src="/images/sna.jpg" 
            alt="IHG Hotels & Resorts" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-white rounded-full p-1">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">tns</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Twende na snap</h3>
          <p className="text-red-500 text-sm font-medium">30% Off</p>
        </div>
      </div>

      {/* Expedia */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="h-32 bg-gradient-to-br from-blue-100 to-cyan-200 relative">
          <img 
            src="/images/safr.jpg" 
            alt="Expedia" 
            className="w-full h-full object-cover"
          />
          <div className="absolute top-2 left-2 bg-white rounded-full p-1">
            <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">E</span>
            </div>
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">Expedia</h3>
          <p className="text-red-500 text-sm font-medium">Up to 50% Off</p>
        </div>
      </div>
    </div>

    {/* Navigation Arrow */}
    <div className="flex justify-end mt-6">
      <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors">
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</div>

      {/* Brands Section */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-500 mb-2">Find your favorite store</p>
            <h2 className="text-3xl font-bold text-gray-800">POPULAR STORES</h2>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Categories */}
            <div className="lg:w-1/4">
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-red-200">
                  <span className="text-gray-700">Food</span>
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">NEW</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Travel</span>
                  <span className="text-gray-400 text-sm">(32)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Flight Tickets</span>
                  <span className="text-gray-400 text-sm">(14)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Real Estate</span>
                  <span className="text-gray-400 text-sm">(40)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Fashion</span>
                  <span className="text-gray-400 text-sm">(15)</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-gray-700">Electronics</span>
                  <span className="text-gray-400 text-sm">(26)</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-700">All Brands</span>
                  <span className="text-red-500">↗</span>
                </div>
              </div>
            </div>

           {/* Store Cards */}
           <div className="lg:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salad Bay */}
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-sm">SB</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">Salad Bay</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">4.2</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-bold text-lg">25%</div>
                      <div className="text-gray-500 text-xs font-medium">Cashback</div>
                    </div>
                  </div>
                </div>

                {/* Coffee Cafe */}
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-sm">CC</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">Coffee Cafe</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">4.5</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-bold text-lg">15%</div>
                      <div className="text-gray-500 text-xs font-medium">Cashback</div>
                    </div>
                  </div>
                </div>

                {/* Kare */}
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-sm">K</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">Kare</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">4.8</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-bold text-lg">53%</div>
                      <div className="text-gray-500 text-xs font-medium">Cashback</div>
                      <div className="text-gray-400 text-xs mt-1">Was 1%</div>
                    </div>
                  </div>
                </div>

                {/* Burger Express */}
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-sm">B</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">Burger Express</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">4.3</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-bold text-lg">$5</div>
                      <div className="text-gray-500 text-xs font-medium">Cashback</div>
                    </div>
                  </div>
                </div>

                {/* Pizza Palace */}
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-sm">PP</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">Pizza Palace</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">4.6</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-bold text-lg">20%</div>
                      <div className="text-gray-500 text-xs font-medium">Cashback</div>
                    </div>
                  </div>
                </div>

                {/* Thai Delight */}
                <div className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer group p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center border-2 border-gray-200 group-hover:border-red-400 transition-colors duration-300 shadow-lg flex-shrink-0">
                        <span className="text-white font-bold text-sm">TD</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base">Thai Delight</h3>
                        <div className="flex items-center space-x-1 mt-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm text-gray-600 font-medium">4.7</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-red-500 font-bold text-lg">35%</div>
                      <div className="text-gray-500 text-xs font-medium">Cashback</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* View All Stores Button */}
              <div className="flex justify-center mt-8">
                <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors duration-300 flex items-center gap-2">
                  View All Stores
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* App Download Section */}
      <div className="bg-gradient-to-r from-blue-200 to-purple-200 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-gray-600 mb-2">Download App from</p>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">GET MORE ON YOUR APP</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Lorem ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and 
              scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, 
              remaining essentially unchanged.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <span>▶</span>
                Get it on Google Play
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <span>🍎</span>
                Get it on Windows
              </button>
              <button className="bg-black text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-gray-800 transition-colors">
                <span>🍎</span>
                Get it on Apple Store
              </button>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row items-center gap-12">
            {/* Left Features */}
            <div className="lg:w-1/3 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">📋</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Largest Listing</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">🛒</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Maximum Savings</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">⭐</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Premium Offers</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
            </div>

            {/* Center Phone */}
            <div className="lg:w-1/3 flex justify-center">
              <div className="relative">
                <div className="w-64 h-96 bg-black rounded-3xl p-4">
                  <div className="w-full h-full bg-gradient-to-b from-purple-600 to-pink-600 rounded-2xl flex flex-col items-center justify-center text-white p-6">
                    <div className="mb-4">
                      <span className="text-2xl">📱</span>
                    </div>
                    <h3 className="text-lg font-bold mb-2">Daily</h3>
                    <div className="bg-yellow-400 text-black px-4 py-2 rounded-full font-bold mb-4">
                      SAVE BIG
                    </div>
                    <div className="text-center text-sm">
                      <p>TRAVEL</p>
                      <p>FOOD</p>
                      <p>REAL ESTATE</p>
                      <p>FLIGHT BOOKING</p>
                      <p>HOTEL BOOKING</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Features */}
            <div className="lg:w-1/3 space-y-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">👍</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Verified Products</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-400 rounded-lg flex items-center justify-center">
                  <span className="text-white">🛍️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Value Products</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white">💎</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Sale Listings</h3>
                  <p className="text-gray-600 text-sm">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Banner */}
      <div className="bg-gradient-to-r from-blue-100 to-purple-100 py-16 px-4 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="flex flex-wrap justify-center items-center gap-4 mb-8">
            <span className="text-4xl">🛒</span>
            <span className="text-4xl">📱</span>
            <span className="text-4xl">💳</span>
            <span className="text-4xl">🎁</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Over <span className="text-red-500">1,51,000</span> Lists Worldwide. Get <span className="text-red-500">$95,00,000</span> worth Coupons Savings
          </h2>
          
          <p className="text-gray-600 mb-8">The Greatest Library of Verified Lists</p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full font-semibold transition-colors">
              Add a Listing ⚪
            </button>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold transition-colors">
              Search For a Coupon ⚪
            </button>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 text-4xl opacity-20">🛒</div>
        <div className="absolute top-20 right-10 text-4xl opacity-20">📱</div>
        <div className="absolute bottom-10 left-20 text-4xl opacity-20">💳</div>
        <div className="absolute bottom-20 right-20 text-4xl opacity-20">🎁</div>
      </div>
    </>
  );
};

export default PopularStores;