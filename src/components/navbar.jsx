import React, { useState, useEffect, useRef } from 'react';
import { Menu, X, LogOut, Settings, User, ShoppingCart, Package, Phone, Home } from 'lucide-react';
import logo from '../assets/logo.png';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  
  const { user, isAuthenticated, logout, cart } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  const cartItemCount = cart?.items?.length || 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img
                  src={logo}
                  alt="J P ExtrusionTech"
                  className="h-10 w-40 mr-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow"
                  onError={(e) => {
                    e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='8' fill='%23dc2626'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-family='Arial' font-size='14' font-weight='bold'%3EJP%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            <Link 
              to="/" 
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <Home className="w-4 h-4 mr-2" />
              Home
            </Link>
            <Link 
              to="/products" 
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/products') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <Package className="w-4 h-4 mr-2" />
              Products
            </Link>
            <Link 
              to="/cart" 
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                isActive('/cart') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
            <Link 
              to="/contact" 
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive('/contact') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
              }`}
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact
            </Link>
            {(user?.role === 'admin' || user?.isAdmin) && (
              <Link 
                to="/admin" 
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname.startsWith('/admin') 
                    ? 'bg-red-100 text-red-800 border border-red-300' 
                    : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                }`}
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden lg:flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(user?.role === 'admin' || user?.isAdmin) ? 'Administrator' : 'Customer'}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name || user?.email}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-3" />
                      Profile
                    </Link>
                    {(user?.role === 'admin' || user?.isAdmin) && (
                      <Link
                        to="/admin"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin Dashboard
                      </Link>
                    )}
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link 
                  to="/login" 
                  className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-3">
            {user && (
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 hover:text-red-500 hover:bg-gray-50 focus:outline-none transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="px-4 py-4 space-y-2">
              {/* User Info Section */}
              {user && (
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">
                      {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {user?.name || user?.email?.split('@')[0] || 'User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {(user?.role === 'admin' || user?.isAdmin) ? 'Administrator' : 'Customer'}
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              <Link 
                to="/" 
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="w-5 h-5 mr-3" />
                Home
              </Link>
              <Link 
                to="/products" 
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/products') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="w-5 h-5 mr-3" />
                Products
              </Link>
              <Link 
                to="/cart" 
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors relative ${
                  isActive('/cart') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-3" />
                Cart
                {cartItemCount > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </Link>
              <Link 
                to="/contact" 
                className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/contact') 
                    ? 'bg-red-50 text-red-700 border border-red-200' 
                    : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Phone className="w-5 h-5 mr-3" />
                Contact
              </Link>
              
              {(user?.role === 'admin' || user?.isAdmin) && (
                <Link 
                  to="/admin" 
                  className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname.startsWith('/admin') 
                      ? 'bg-red-100 text-red-800 border border-red-300' 
                      : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  Admin Panel
                </Link>
              )}
              
              {/* Mobile Authentication Section */}
              {user ? (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center w-full px-3 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-200 space-y-2">
                  <Link 
                    to="/login" 
                    className="flex items-center px-3 py-3 text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-3" />
                    Sign In
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>


    </header>
  );
};

export default Navbar;