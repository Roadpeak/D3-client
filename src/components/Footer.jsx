import React from 'react';
import { Link } from 'react-router-dom';

// Modern SVG icons for footer
const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 22C16 18 20 14.4183 20 10C20 5.58172 16.4183 2 12 2C7.58172 2 4 5.58172 4 10C4 14.4183 8 18 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const EmailIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 5.25L12 13.5L3 5.25M3.75 5.25H20.25C21.0784 5.25 21.75 5.92157 21.75 6.75V18C21.75 18.8284 21.0784 19.5 20.25 19.5H3.75C2.92157 19.5 2.25 18.8284 2.25 18V6.75C2.25 5.92157 2.92157 5.25 3.75 5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.5 6.5C15.2372 6.64382 15.9689 6.96892 16.5 7.5C17.0311 8.03108 17.3562 8.76284 17.5 9.5M15 3C16.5315 3.17014 17.9097 3.91107 19 5C20.0903 6.08893 20.8279 7.46869 21 9M20.9994 16.4767V19.1864C21.0036 20.2223 20.0722 21.0873 19.0214 20.9929C10.0091 21.0011 2.99042 13.9924 3.00856 4.97955C2.91356 3.92941 3.77858 2.99791 4.8144 3.00214H7.52406C7.96149 2.99727 8.37542 3.16718 8.68054 3.46807C9.64288 4.56438 10.3015 8.02274 9.9635 9.14091C9.6961 10.0695 8.62886 10.6366 7.80128 10.9346C9.23709 13.7372 11.2628 15.7629 14.0654 17.1988C14.3634 16.3712 14.9305 15.3039 15.8591 15.0365C16.9773 14.6985 20.4356 15.3571 21.5319 16.3195C21.7957 16.5981 21.9681 16.9752 20.9994 16.4767Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ContactIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H5C3.89543 19 3 18.1046 3 17V7C3 5.89543 3.89543 5 5 5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FeedbackIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 8H17M7 12H11M12 20L8 16H5C3.89543 16 3 15.1046 3 14V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V14C21 15.1046 20.1046 16 19 16H16L12 20Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const FAQIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13M12 17H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CareerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TermsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PrivacyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AddBusinessIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 9V15M9 12H15M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AdvertiseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 9H8M11 13H8M11 17H8M15 9H15.01M15 13H15.01M15 17H15.01M7 21V3H17V21L12 18L7 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CompanyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 21H21M5 21V7L13 3V21M19 21V11L13 7M9 8V8.01M9 12V12.01M9 16V16.01M17 12V12.01M17 16V16.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DirectoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H8C5.79086 21 4 19.2091 4 17V7C4 4.79086 5.79086 3 8 3H16C18.2091 3 20 4.79086 20 7V17C20 19.2091 18.2091 21 16 21H15M9 21V17C9 15.8954 9.89543 15 11 15H13C14.1046 15 15 15.8954 15 17V21M9 21H15M12 3V7M8 7H16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LoginIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H15M10 17L15 12M15 12L10 7M15 12H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Footer = () => {
  return (
    <footer className="bg-white py-12 px-4 border-t border-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Our Location */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Our Location</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p className="flex items-start">
                <LocationIcon />
                <span className="ml-2">NAIROBI (K)</span>
              </p>
              <p className="flex items-start">
                <EmailIcon />
                <span className="ml-2">support@discoun3.com</span>
              </p>
              <p className="flex items-start">
                <PhoneIcon />
                <span className="ml-2">1300 271 3365</span>
              </p>
              <p className="flex items-start">
                <PhoneIcon />
                <span className="ml-2">0401 271 3365</span>
              </p>
            </div>
          </div>

          {/* D3 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">D3 (Discoun3)</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <Link to="/about-us" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 16V12M12 8H12.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="ml-2">About Us</span>
              </Link>
              <Link to="/contact-us" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <ContactIcon />
                <span className="ml-2">Contact us</span>
              </Link>
              <Link to="/contact-us" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <FeedbackIcon />
                <span className="ml-2">Feedback</span>
              </Link>
              <Link to="/faq" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <FAQIcon />
                <span className="ml-2">FAQ</span>
              </Link>
              <Link to="/careers" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <CareerIcon />
                <span className="ml-2">Careers</span>
              </Link>
              <Link to="/terms-conditions" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <TermsIcon />
                <span className="ml-2">Terms & Conditions</span>
              </Link>
              <Link to="/privacy-policy" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <PrivacyIcon />
                <span className="ml-2">Privacy Policy</span>
              </Link>
            </div>
          </div>

          {/* Business */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Business</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <Link to="/contact-us" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <AddBusinessIcon />
                <span className="ml-2">Add your business</span>
              </Link>
              <Link to="/contact-us" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <AdvertiseIcon />
                <span className="ml-2">Advertise with us</span>
              </Link>
            </div>

            <h4 className="text-sm font-medium text-gray-900 mt-6 mb-4">Quick links</h4>
            <div className="space-y-3 text-sm text-gray-600">
              <Link to="/stores" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <CompanyIcon />
                <span className="ml-2">Browse Company</span>
              </Link>
              <Link to="/stores" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <DirectoryIcon />
                <span className="ml-2">Browse Directory</span>
              </Link>
              <Link to="/profile" className="flex items-center hover:text-blue-600 transition-colors cursor-pointer">
                <LoginIcon />
                <span className="ml-2">Login to your account</span>
              </Link>
            </div>
          </div>

          {/* Follow Us & Newsletter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-4">Follow Us</h3>
            <div className="flex gap-3 mb-6">
              {/* Facebook */}
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center transition-transform hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 2H15C13.6739 2 12.4021 2.52678 11.4645 3.46447C10.5268 4.40215 10 5.67392 10 7V10H7V14H10V22H14V14H17L18 10H14V7C14 6.73478 14.1054 6.48043 14.2929 6.29289C14.4804 6.10536 14.7348 6 15 6H18V2Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Twitter */}
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 text-white flex items-center justify-center transition-transform hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 4.01C21 4.5 20.02 4.69 19 5C17.879 3.735 16.217 3.665 14.62 4.263C13.023 4.861 11.977 6.323 12 8.01V9.01C8.755 9.083 5.865 7.605 4 5.01C4 5.01 0 13.01 8 17.01C6.214 18.169 4.122 18.85 2 19.01C10 24.01 20 19.01 20 8.01C19.9991 7.71851 19.9723 7.42784 19.92 7.14C20.94 6.14 21.62 4.86 22 4.01Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              {/* Instagram */}
              <a href="#" className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white flex items-center justify-center transition-transform hover:scale-110">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M17.5 6.5H17.51M7 22H17C19.2091 22 21 20.2091 21 18V6C21 3.79086 19.2091 2 17 2H7C4.79086 2 3 3.79086 3 6V18C3 20.2091 4.79086 22 7 22Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>

            <h4 className="text-sm font-medium text-gray-900 mb-4">Subscribe to Newsletter</h4>
            <div className="mb-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-r-none text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg sm:rounded-l-none transition-colors text-sm font-medium whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Note: We do not spam. Your email is secure with us.
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-8 mt-8 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Copyright © 2025, D3 (Discoun3). All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;