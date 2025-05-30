const Featured = () => {
  return (
      <div className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16 px-[5%]">
          <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Stay Updated with Best Deals</h2>
              <p className="text-lg mb-8 opacity-90">
                  Subscribe to get exclusive offers and updates delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                      type="email"
                      placeholder="Enter your email address"
                      className="flex-1 px-4 py-3 rounded-lg text-gray-900 outline-none"
                  />
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-lg font-semibold whitespace-nowrap transition-colors">
                      Subscribe
                  </button>
              </div>
          </div>
      </div>
  );
};

export default Featured