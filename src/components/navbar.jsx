import React, { useState } from 'react';
import { Menu, X, User, Shield, LogOut } from 'lucide-react';
import logo from '../assets/logo.png';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center">
              <img
                src={logo}
                alt="J P ExtrusionTech"
                className="h-8 w-8 mr-2"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23ef4444'/%3E%3Ctext x='16' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='10'%3EJP%3C/text%3E%3C/svg%3E";
                }}
              />
              <span className="text-xl font-bold text-gray-800">J P ExtrusionTech</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-red-500 transition-colors">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-red-500 transition-colors">
              Products
            </Link>
            <Link to="/cart" className="text-gray-700 hover:text-red-500 transition-colors">
              Cart
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-red-500 transition-colors">
              Contact
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-red-600 hover:text-red-700 transition-colors font-semibold">
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Desktop User Actions */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <>
                <span className="text-gray-700">
                  Welcome, {user?.name || user?.username || 'admin'}
                  {user?.isAdmin && <span className="text-red-600 ml-1">(Admin)</span>}
                </span>
                {user?.isAdmin && (
                  <Link 
                    to="/admin" 
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4 inline mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-red-500 transition-colors"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-red-500 focus:outline-none"
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
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                to="/" 
                className="block px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/products" 
                className="block px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Products
              </Link>
              <Link 
                to="/cart" 
                className="block px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Cart
              </Link>
              <Link 
                to="/contact" 
                className="block px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              
              {user?.isAdmin && (
                <Link 
                  to="/admin" 
                  className="block px-3 py-2 text-red-600 hover:text-red-700 font-semibold hover:bg-gray-50 rounded-md transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              
              {/* Mobile Authentication Section */}
              {user ? (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <div className="px-3 py-2 text-gray-700 text-sm">
                    Welcome, {user?.name || user?.username || 'admin'}
                    {user?.isAdmin && <span className="text-red-600 ml-1">(Admin)</span>}
                  </div>
                  {user?.isAdmin && (
                    <Link 
                      to="/admin" 
                      className="block px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200 space-y-2">
                  <Link 
                    to="/login" 
                    className="block px-3 py-2 text-gray-700 hover:text-red-500 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Login
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