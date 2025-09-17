"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent backdrop-blur-sm">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto px-4 py-3 lg:px-6">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image 
            src="/logo/logo.svg" 
            alt="My Website Logo" 
            width={120} 
            height={40} 
            className="md:w-[150px] md:h-[50px]"
          />
        </div>

        {/* Desktop Menu */}
        <ul className="hidden lg:flex gap-8 xl:gap-14 text-white">
          <li><a href="#" className="hover:text-green-400 transition-colors">Home</a></li>
          <li><a href="#about" className="hover:text-green-400 transition-colors">About</a></li>
          <li><a href="#pricing" className="hover:text-green-400 transition-colors">Pricing</a></li>
          <li><a href="#testimonials" className="hover:text-green-400 transition-colors">Testimonial</a></li>
        </ul>

        {/* Desktop CTA Button */}
        <Link href="/login" className="hidden lg:block px-4 xl:px-6 py-4 text-xs xl:text-[13px] font-medium text-dark bg-gradient-to-r from-green-primary via-green-foreground to-green-secondary rounded-lg hover:opacity-90 transition-opacity duration-200 shadow-[-20px_4px_40px_0px_#DBFFAA40]">
          Get Started
        </Link>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden text-white p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-t border-gray-700">
          <ul className="flex flex-col space-y-4 px-4 py-6 text-white">
            <li><a href="#" className="block hover:text-green-400 transition-colors">Home</a></li>
            <li><a href="#about" className="block hover:text-green-400 transition-colors">About</a></li>
            <li><a href="#pricing" className="block hover:text-green-400 transition-colors">Pricing</a></li>
            <li><a href="#testimonials" className="block hover:text-green-400 transition-colors">Testimonial</a></li>
            <li className="pt-4">
              <button className="w-full px-6 py-3 text-sm font-medium text-black bg-gradient-to-r from-green-primary via-green-foreground to-green-secondary shadow-[-20px_4px_40px_0px_#DBFFAA40] rounded-lg hover:opacity-90 transition-opacity duration-200">
                Get Started
              </button>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}
