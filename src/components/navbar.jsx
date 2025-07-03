import React, { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 w-full">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/">
              <img
                src={logo}
                alt="JP ExtrusionTech"
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='32' viewBox='0 0 120 32'%3E%3Crect width='120' height='32' fill='%23ef4444'/%3E%3Ctext x='60' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='14'%3EJ P EXTRUSIONTECH%3C/text%3E%3C/svg%3E";
                }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex flex-1 justify-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-500 transition-colors">Home</Link>
            <Link to="/products" className="text-gray-700 hover:text-red-500 transition-colors">Products</Link>
            <Link to="/cart" className="text-gray-700 hover:text-red-500 transition-colors">Cart</Link>
            <Link to="/contact" className="text-gray-700 hover:text-red-500 transition-colors">Contact</Link>
          </nav>

          {/* Profile Icon (desktop only) */}
          <div className="hidden md:flex items-center flex-shrink-0">
            <Link to="/profile">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>

          {/* Hamburger menu (mobile only, always at far right) */}
          <div className="flex md:hidden flex-1 justify-end">
            <button
              className="ml-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
              <Link to="/" className="block px-3 py-2 text-gray-700 hover:text-red-500">Home</Link>
              <Link to="#" className="block px-3 py-2 text-gray-700 hover:text-red-500">Products</Link>
              <Link to="/cart" className="block px-3 py-2 text-gray-700 hover:text-red-500">Cart</Link>
              <Link to="/contact" className="block px-3 py-2 text-gray-700 hover:text-red-500">Contact</Link>
              <Link to="/profile" className="block px-3 py-2 text-gray-700 hover:text-red-500">Profile</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;