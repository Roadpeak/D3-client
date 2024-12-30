import React from 'react';
import { FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { Link } from 'react-router-dom';
import image from '../assets/d32.png';

const Footer = () => {
  const handleMapClick = () => {
    window.open(
      'https://www.google.com/maps/search/?api=1&query=Britam+Towers+Upperhill+Nairobi',
      '_blank'
    );
  };

  const handleEmailClick = () => {
    window.open('mailto:info@dthree.com', '_blank');
  };

  return (
    <footer className="bg-white border-t text-black">
      
      <div className="px-[5%] py-8">
        <div className="flex flex-wrap justify-between items-center gap-8">
          
          <div>
            <img src={image} className="h-[50px]" alt="D3 Logo" />
          </div>
          
          <div className="flex flex-wrap gap-8 text-gray-600 text-[16px]">
            <Link to="/" className="hover:text-black">
              Home
            </Link>
            <Link to="/about" className="hover:text-black">
              About
            </Link>
            <Link to="/contact" className="hover:text-black">
              Contact
            </Link>
            <Link to="/company/careers" className="hover:text-black">
              Careers
            </Link>
            <Link to="/deals" className="hover:text-black capitalize">
              Start Getting Discounts
            </Link>
          </div>
          
          <div className="flex gap-4">
            <a href="#" className="text-gray-500 hover:text-black">
              <FaFacebookF />
            </a>
            <a href="#" className="text-gray-500 hover:text-black">
              <FaXTwitter />
            </a>
            <a href="#" className="text-gray-500 hover:text-black">
              <FaInstagram />
            </a>
            <a href="#" className="text-gray-500 hover:text-black">
              <FaLinkedin />
            </a>
          </div>
        </div>
      </div>
      
      <div className="border-t mt-8 pt-4 px-[5%] flex justify-between items-center text-gray-600 text-[14px]">
        <p>&copy; 2025 D3. All rights reserved.</p>
        <div className="flex gap-4">
          <span className="hover:text-black cursor-pointer">Support</span>
          <span className="hover:text-black cursor-pointer">Security</span>
          <span className="hover:text-black cursor-pointer">Cookies</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
