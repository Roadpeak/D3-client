import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const AboutUs = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          {/* Header Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us – D3 (Discoun3)</h1>
            <h2 className="text-2xl font-semibold text-blue-600 mb-6">Welcome to D3 – A Tree of Discounts 🌳</h2>
          </div>

          {/* Introduction */}
          <section className="mb-10">
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              At <strong className="text-blue-600">D3 (Discoun3)</strong>, we're redefining how people discover, book, and enjoy services. 
              As a <strong>services marketplace for deals and offers</strong>, D3 connects <strong>service providers</strong> with <strong>service seekers</strong>—helping 
              customers save money while giving providers the visibility they need to grow.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              From restaurants and salons to fitness centers, entertainment spots, travel services, and beyond, D3 is your go-to platform 
              for finding the <strong>best discounts and seamless bookings</strong> all in one place.
            </p>
          </section>

          {/* Who We Are */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Who We Are</h2>
            <p className="text-gray-700 mb-4 text-lg">
              D3 is more than just a discount hub. We're a <strong>full-service deals and booking platform</strong> designed to make services:
            </p>
            <div className="bg-blue-50 p-6 rounded-lg mb-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Affordable</strong> – Exclusive offers and discounts from verified providers.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Accessible</strong> – Easy booking with branch and staff selection options.</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                  <span><strong>Convenient</strong> – Direct chat, reviews, and multiple provider offers for every request.</span>
                </li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-6 rounded-lg">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Our mission is simple:</h3>
              <div className="space-y-2 text-gray-700">
                <p>• Help <strong>customers</strong> save money and book services with confidence.</p>
                <p>• Empower <strong>service providers</strong> to reach new clients, fill more bookings, and build their brand presence.</p>
              </div>
            </div>
          </section>

          {/* What We Offer */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">What We Offer</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* For Customers */}
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">C</span>
                  For Customers
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Discover Deals & Offers</strong> – Browse discounts from restaurants, salons, gyms, travel, events, and professional services.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Book with Ease</strong> – Secure your spot by booking directly on D3, with options to select staff and branches.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Service Requests</strong> – Post what you need and receive multiple offers from providers competing for your budget.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Direct Chat & Reviews</strong> – Message providers instantly, read verified reviews, and make smarter choices.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Pay In-Store</strong> – No hidden charges. Confirm your booking on D3, then complete your payment directly with the provider.
                    </div>
                  </div>
                </div>
              </div>

              {/* For Service Providers */}
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center mr-3 text-sm">P</span>
                  For Service Providers
                </h3>
                <div className="space-y-4 text-gray-700">
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Create a Digital Storefront</strong> – Showcase your offers to thousands of potential customers.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Increase Bookings</strong> – D3 helps fill your calendar by making your services easy to discover and book.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Respond to Requests</strong> – Send tailored offers directly to customers who post service needs.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Branch & Staff Management</strong> – List multiple branches, assign staff, and let customers book who they want.
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-purple-500 mr-2 mt-1">✔</span>
                    <div>
                      <strong>Grow Your Business</strong> – Gain visibility, collect reviews, and improve with real customer feedback.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Why D3 is Different */}
          <section className="mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Why D3 is Different</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                <div className="flex items-start mb-3">
                  <span className="text-2xl mr-3">🌍</span>
                  <div>
                    <strong className="text-gray-900">More Than Discounts</strong>
                    <p className="text-gray-700 mt-1">We're a full booking platform for services.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                <div className="flex items-start mb-3">
                  <span className="text-2xl mr-3">🗓️</span>
                  <div>
                    <strong className="text-gray-900">Smart Booking System</strong>
                    <p className="text-gray-700 mt-1">Staff selection, branch selection, and real-time availability.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg">
                <div className="flex items-start mb-3">
                  <span className="text-2xl mr-3">💬</span>
                  <div>
                    <strong className="text-gray-900">Two-Way Connection</strong>
                    <p className="text-gray-700 mt-1">Direct chat between customers and providers.</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg">
                <div className="flex items-start mb-3">
                  <span className="text-2xl mr-3">🛡️</span>
                  <div>
                    <strong className="text-gray-900">Trust & Flexibility</strong>
                    <p className="text-gray-700 mt-1">Customers book on D3, but payments stay between them and providers.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-100 p-6 rounded-lg mt-6">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📈</span>
                <div>
                  <strong className="text-gray-900">Business Growth Tools</strong>
                  <p className="text-gray-700 mt-1">Marketing support, exposure, and insights for providers.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Our Vision */}
          <section className="mb-10">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8 rounded-lg text-center">
              <h2 className="text-3xl font-bold mb-4">Our Vision</h2>
              <p className="text-lg leading-relaxed">
                To become the <strong>leading services marketplace for deals and bookings</strong>, where every customer enjoys savings and every provider enjoys growth.
              </p>
            </div>
          </section>

          {/* Join the D3 Community */}
          <section className="text-center">
            <div className="bg-gradient-to-r from-green-100 to-blue-100 p-8 rounded-lg">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Join the D3 Community</h2>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                At D3, we're growing a <strong>tree of discounts</strong> where every branch connects people to value. Whether you're here to <strong>save money</strong> or to <strong>expand your business</strong>, D3 gives you the tools, the platform, and the community to thrive.
              </p>
              <div className="bg-white p-6 rounded-lg inline-block shadow-sm">
                <p className="text-2xl font-bold text-blue-600 mb-2">
                  👉 <strong>Discover. Book. Save.</strong>
                </p>
                <p className="text-xl text-gray-900">
                  Welcome to <strong className="text-green-600">D3 – your tree of discounts.</strong>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;