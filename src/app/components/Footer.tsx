import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div className="flex justify-between flex-col md:flex-row gap-12 mb-16">
          {/* Left Side - Subscribe Section */}
          <div>
            {/* Logo */}
            <div className="mb-8">
              <img src="/logo/logo-hitam.svg" alt="Morphlyca Logo" />
            </div>
            
            {/* Subscribe Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Subscribe</h3>
              <p className="text-gray-600 text-sm mb-6">
                Join our newsletter to stay up to date on feature and releases.
              </p>
              
              {/* Email Input */}
              <div className="flex gap-4 mb-4">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                  />
                </div>
                <button className="bg-lime-400 hover:bg-lime-500 text-black font-medium px-6 py-3 rounded-lg transition-colors">
                  Subscribe
                </button>
              </div>
              
              <p className="text-sm text-gray-500">
                By subscribing you agree with our{' '}
                <a href="#" className="text-gray-700 hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
          
          {/* Right Side - Navigation Menus */}
          <div className="grid grid-cols-2 gap-8">
            {/* Menu Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Menu</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Testimonial
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Company Column */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Terms & Condition
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-gray-900 transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200">
          {/* Copyright */}
          <p className="text-gray-600 text-sm mb-4 md:mb-0">
            ©2025 Morphlyca. All right reserved.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex space-x-4">
            <a
              href="#"
              className="bg-lime-400 p-3 rounded-lg hover:bg-lime-500 transition-colors"
            >
              <Twitter className="w-5 h-5 text-black" />
            </a>
            <a
              href="#"
              className="bg-lime-400 p-3 rounded-lg hover:bg-lime-500 transition-colors"
            >
              <Facebook className="w-5 h-5 text-black" />
            </a>
            <a
              href="#"
              className="bg-lime-400 p-3 rounded-lg hover:bg-lime-500 transition-colors"
            >
              <Instagram className="w-5 h-5 text-black" />
            </a>
            <a
              href="#"
              className="bg-lime-400 p-3 rounded-lg hover:bg-lime-500 transition-colors"
            >
              <Linkedin className="w-5 h-5 text-black" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;