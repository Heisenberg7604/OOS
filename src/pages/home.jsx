import React, { useState } from 'react';
import { ChevronDown, Menu, X, User } from 'lucide-react';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="relative z-50 bg-white/90 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo.png" 
                alt="JP ExtrusionTech" 
                className="h-8 w-auto"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='32' viewBox='0 0 120 32'%3E%3Crect width='120' height='32' fill='%23ef4444'/%3E%3Ctext x='60' y='20' text-anchor='middle' fill='white' font-family='Arial' font-size='14'%3EJ P EXTRUSIONTECH%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-red-500 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-red-500 transition-colors">Products</a>
              <a href="#" className="text-gray-700 hover:text-red-500 transition-colors">Cart</a>
              <a href="#" className="text-gray-700 hover:text-red-500 transition-colors">Contact</a>
            </nav>

            {/* Profile Icon */}
            <div className="hidden md:flex items-center">
              <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t">
                <a href="#" className="block px-3 py-2 text-gray-700 hover:text-red-500">Home</a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:text-red-500">Products</a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:text-red-500">Cart</a>
                <a href="#" className="block px-3 py-2 text-gray-700 hover:text-red-500">Contact</a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero.png" 
            alt="Industrial machinery background" 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1920' height='1080' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23374151;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%236b7280;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='url(%23grad)'/%3E%3C/svg%3E";
            }}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 tracking-wider">
            SPARES
          </h1>
          <p className="text-xl sm:text-2xl lg:text-3xl font-light max-w-3xl mx-auto">
            Your one stop solution for spare parts
          </p>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
          <div className="w-12 h-12 border-2 border-white rounded-full flex items-center justify-center animate-bounce">
            <ChevronDown className="w-6 h-6 text-white" />
          </div>
        </div>
      </section>

      {/* Bento Grid Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-4 grid-rows-3 gap-6 h-[800px]">
          {/* Large machinery image - spans 2x2 (top-left) */}
          <div className="col-span-2 row-span-2 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Industrial machinery" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400' viewBox='0 0 600 400'%3E%3Crect width='600' height='400' fill='%23f3f4f6'/%3E%3Ctext x='300' y='200' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='18'%3EMachinery Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Teal pendant light - spans 2x1 (top-right) */}
          <div className="col-span-2 row-span-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Pendant light" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EPendant Light%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Red text block - 1x1 (middle-right) */}
          <div className="col-span-1 row-span-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Red text block" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3ERed Block%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Quality compliance block - 1x1 (far-right) */}
          <div className="col-span-1 row-span-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Quality compliance" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='90' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'%3E100% Quality%3C/text%3E%3Ctext x='100' y='110' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'%3ECompliance%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Modern interior - 1x1 (bottom-left) */}
          <div className="col-span-1 row-span-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Modern interior" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3EInterior%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Beige block - 1x1 (bottom-middle-left) */}
          <div className="col-span-1 row-span-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Beige block" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3EBeige Block%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Modern room - spans 2x1 (bottom-right) */}
          <div className="col-span-2 row-span-1 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Modern room" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EModern Room%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Mobile/Tablet Grid */}
        <div className="lg:hidden space-y-6">
          {/* Hero machinery image */}
          <div className="h-64 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Industrial machinery" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f3f4f6'/%3E%3Ctext x='200' y='125' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='18'%3EMachinery Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Modern interior */}
          <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Modern interior" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EModern Interior%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Two column grid for smaller items */}
          <div className="grid grid-cols-2 gap-4">
            {/* Red text block */}
            <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="/hero.png" 
                alt="Red text block" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3ERed Block%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Beige block */}
            <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="/hero.png" 
                alt="Beige block" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3EBeige Block%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Quality compliance */}
            <div className="h-32 bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="/hero.png" 
                alt="Quality compliance" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='100' y='65' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'%3E100% Quality%3C/text%3E%3Ctext x='100' y='85' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'%3ECompliance%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            {/* Teal pendant light */}
            <div className="h-32 bg-gray-100 rounded-2xl overflow-hidden">
              <img 
                src="/hero.png" 
                alt="Pendant light" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='150' viewBox='0 0 200 150'%3E%3Crect width='200' height='150' fill='%23f3f4f6'/%3E%3Ctext x='100' y='75' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='12'%3EPendant Light%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>

          {/* Modern room - full width */}
          <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
            <img 
              src="/hero.png" 
              alt="Modern room" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EModern Room%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;