import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white py-16 px-4 border-t">
      <div className="max-w-6xl mx-auto">
        {/* Top Footer */}
        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"> */}
          {/* Customer Support */}
          {/* <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span>💬</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">24/7 Customer Support</h3>
              <p className="text-gray-600 text-sm mb-2">Start live Chat how with us, we can Live Chat or Live Chat</p>
              <a href="#" className="text-red-500 text-sm">📞 Start Live Chat</a>
            </div>
          </div> */}

          {/* Contact Us */}
          {/* <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span>✉️</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Contact Us</h3>
              <p className="text-gray-600 text-sm mb-1">Email: support@daily.com</p>
              <p className="text-gray-600 text-sm mb-1">Phone: 0401 271 3365</p>
              <p className="text-gray-600 text-sm">0401 271 3365</p>
            </div>
          </div> */}

          {/* Verified Deals */}
          {/* <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span>✅</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Verified Deals</h3>
              <p className="text-gray-600 text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
              <a href="#" className="text-red-500 text-sm">Know More</a>
            </div>
          </div> */}

          {/* Premium Gift Cards */}
          {/* <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <span>🎁</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Premium Gift Cards</h3>
              <p className="text-gray-600 text-sm mb-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>
              <a href="#" className="text-red-500 text-sm">Know More</a>
            </div>
          </div>
        </div> */}

        {/* Bottom Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-8 border-t">
          {/* Our Location */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Our Location</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📍 2307 Beverley Rd Brooklyn,</p>
              <p>Brooklyn, NY 11226</p>
              <p>📧 support@daily.com</p>
              <p>📞 1300 271 3365</p>
              <p>📞 0401 271 3365</p>
            </div>
          </div>

          {/* ListZilla */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">ListZilla</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📧 Contact us</p>
              <p>📝 Feedback</p>
              <p> FAQ</p>
              <p>💼 Careers</p>
              <p>📋 Terms & Conditions</p>
              <p>🔒 Privacy Policy</p>
            </div>
          </div>

          {/* Business */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Business</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>➕ Add your business</p>
              <p>📢 Advertise with us</p>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-2 mt-6">Quick links</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>🏢 Browse Company</p>
              <p>🔍 Browse Directory</p>
              <p>🔐 Login to your account</p>
            </div>
          </div>

          {/* Follow Us & Newsletter */}
          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Follow Us</h3>
            <div className="flex gap-2 mb-6">
              <span className="w-8 h-8 bg-blue-600 rounded text-white flex items-center justify-center text-sm">f</span>
              <span className="w-8 h-8 bg-blue-400 rounded text-white flex items-center justify-center text-sm">t</span>
              <span className="w-8 h-8 bg-pink-500 rounded text-white flex items-center justify-center text-sm">i</span>
            </div>
            
            <h4 className="font-semibold text-gray-800 mb-4">Subscribe to Newsletter</h4>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter Email"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l text-sm"
              />
              <button className="bg-red-500 text-white px-4 py-2 rounded-r hover:bg-red-600 transition-colors">
                
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: We do not Spam. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam ex temporae.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 border-t mt-8">
          <p className="text-sm text-gray-500">
            Copyright © 2025, D3. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;