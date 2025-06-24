import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white py-16 px-4 border-t">
      <div className="max-w-6xl mx-auto">
        
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 pt-8 border-t">
          {/* Our Location */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Our Location</h3>
            <div className="space-y-2 text-xs md:text-sm text-gray-600">
              <p>📍 2307 Beverley Rd Brooklyn,</p>
              <p>Brooklyn, NY 11226</p>
              <p>📧 support@daily.com</p>
              <p>📞 1300 271 3365</p>
              <p>📞 0401 271 3365</p>
            </div>
          </div>

          {/* ListZilla */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">ListZilla</h3>
            <div className="space-y-2 text-xs md:text-sm text-gray-600">
              <p>📧 Contact us</p>
              <p>📝 Feedback</p>
              <p> FAQ</p>
              <p>💼 Careers</p>
              <p>📋 Terms & Conditions</p>
              <p>🔒 Privacy Policy</p>
            </div>
          </div>

          {/* Business */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Business</h3>
            <div className="space-y-2 text-xs md:text-sm text-gray-600">
              <p>➕ Add your business</p>
              <p>📢 Advertise with us</p>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-2 mt-4 md:mt-6 text-sm md:text-base">Quick links</h4>
            <div className="space-y-2 text-xs md:text-sm text-gray-600">
              <p>🏢 Browse Company</p>
              <p>🔍 Browse Directory</p>
              <p>🔐 Login to your account</p>
            </div>
          </div>

          {/* Follow Us & Newsletter */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-sm md:text-base">Follow Us</h3>
            <div className="flex gap-2 mb-4 md:mb-6">
              <span className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded text-white flex items-center justify-center text-xs md:text-sm">f</span>
              <span className="w-6 h-6 md:w-8 md:h-8 bg-blue-400 rounded text-white flex items-center justify-center text-xs md:text-sm">t</span>
              <span className="w-6 h-6 md:w-8 md:h-8 bg-pink-500 rounded text-white flex items-center justify-center text-xs md:text-sm">i</span>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-3 md:mb-4 text-sm md:text-base">Subscribe to Newsletter</h4>
            <div className="flex flex-col md:flex-row gap-2 md:gap-0">
              <input
                type="email"
                placeholder="Enter Email"
                className="flex-1 px-2 md:px-3 py-2 border border-gray-300 rounded md:rounded-l md:rounded-r-none text-xs md:text-sm"
              />
              <button className="bg-red-500 text-white px-3 md:px-4 py-2 rounded md:rounded-r md:rounded-l-none hover:bg-red-600 transition-colors text-xs md:text-sm">
                Subscribe
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: We do not Spam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam ex temporae.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 md:pt-8 border-t mt-6 md:mt-8">
          <p className="text-xs md:text-sm text-gray-500">
            Copyright © 2025, D3. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;