import React from 'react';
import { ChevronDown } from 'lucide-react';
import heroimg from '../assets/hero.png';
import grid1 from '../assets/grid1.png';
import grid2 from '../assets/grid2.png';
import gridbag from '../assets/gridbag.png';
import gridline from '../assets/gridline.png';
import gridloom from '../assets/gridloom.png';
import gridrad from '../assets/gridrad.png';
import gridshuttle from '../assets/gridshuttle.png';
import Navbar from '../components/navbar'; // Import the navbar component
import Footer from '../components/Footer'; // Import the Footer component
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Use the Navbar component */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src={heroimg}
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
      <section className="py-20 px-4 sm:px-8 lg:px-16 max-w-7xl mx-auto">
        {/* Desktop Grid */}
        <div className="hidden lg:grid grid-cols-12 grid-rows-9 gap-4 h-[900px]">
          {/* 1: Top-left machinery image */}
          <div className="col-span-5 row-span-4">
            <img
              src={gridshuttle}
              alt="Industrial machinery"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EMachinery Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* 2: Top-right large machinery image */}
          <div className="col-span-7 row-span-3 col-start-6">
            <img
              src={gridloom}
              alt="Large machinery"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200' viewBox='0 0 800 200'%3E%3Crect width='800' height='200' fill='%23f3f4f6'/%3E%3Ctext x='400' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='18'%3ELarge Machinery Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* 3: Lorem ipsum text block */}
          <div className="col-span-5 row-span-3 col-start-1 row-start-5 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 flex items-center justify-center text-white">
            <div className="text-center">
              <h3 className="text-2xl font-bold mb-2">Lorem ipsum is simply dummy text of the printing typesetting industry.</h3>
            </div>
          </div>
          {/* 4: 100% Quality Compliance text block */}
          <div className="col-span-3 row-span-3 col-start-6 row-start-4 bg-gradient-to-br from-red-300 to-red-500 rounded-2xl p-6 flex items-center justify-center text-white">
            <div className="text-center">
              <h3 className="text-3xl font-bold mb-2">100% Quality</h3>
              <p className="text-xl">Compliance</p>
            </div>
          </div>
          {/* 5: Warehouse image */}
          <div className="col-span-4 row-span-6 col-start-9 row-start-4">
            <img
              src={grid1}
              alt="Warehouse"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EWarehouse Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* 6: Bottom-center parts image */}
          <div className="col-span-3 row-span-3 col-start-6 row-start-7">
            <img
              src={grid2}
              alt="Parts"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EParts Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
          {/* 7: Bottom-left product image */}
          <div className="col-span-5 row-span-2 row-start-8">
            <img
              src={gridbag}
              alt="Product"
              className="w-full h-full object-cover rounded-2xl"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EProduct Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>

        {/* Mobile/Tablet Grid */}
        <div className="lg:hidden space-y-6">
          {/* Hero machinery image */}
          <div className="h-64 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={heroimg}
              alt="Industrial machinery"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='250' viewBox='0 0 400 250'%3E%3Crect width='400' height='250' fill='%23f3f4f6'/%3E%3Ctext x='200' y='125' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='18'%3EMachinery Image%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          {/* Text blocks */}
          <div className="grid grid-cols-1 gap-4">
            {/* Lorem ipsum text block */}
            <div className="h-40 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl p-6 flex items-center justify-center text-white">
              <div className="text-center">
                <h3 className="text-lg font-bold">Lorem ipsum is simply dummy text of the printing typesetting industry.</h3>
              </div>
            </div>

            {/* Quality compliance text block */}
            <div className="h-32 bg-gradient-to-br from-red-300 to-red-500 rounded-2xl p-4 flex items-center justify-center text-white">
              <div className="text-center">
                <h3 className="text-2xl font-bold">100% Quality</h3>
                <p className="text-lg">Compliance</p>
              </div>
            </div>
          </div>

          {/* Two column grid for images */}
          <div className="grid grid-cols-2 gap-4">
            {/* Product images */}
            <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={heroimg}
                alt="Product"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3EProduct%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>

            <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
              <img
                src={heroimg}
                alt="Parts"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f3f4f6'/%3E%3Ctext x='100' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='14'%3EParts%3C/text%3E%3C/svg%3E";
                }}
              />
            </div>
          </div>

          {/* Full width images */}
          <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={heroimg}
              alt="Warehouse"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EWarehouse%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>

          <div className="h-48 bg-gray-100 rounded-2xl overflow-hidden">
            <img
              src={heroimg}
              alt="Components"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'%3E%3Crect width='400' height='200' fill='%23f3f4f6'/%3E%3Ctext x='200' y='100' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='16'%3EComponents%3C/text%3E%3C/svg%3E";
              }}
            />
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
        <div className="mb-8 flex items-center">
          <div className="w-10 h-0.5 bg-black mr-4" />
          <h2 className="text-2xl font-semibold">Products</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Product Cards with dropdowns */}
          {productList.map((product) => (
            <ProductCard key={product.title} title={product.title} img={product.img} />
          ))}
        </div>
        {/* More coming soon */}
        <div className="mt-8 mb-12">
          <span className="text-3xl text-red-500 font-semibold drop-shadow-md">More coming soon...</span>
        </div>
      </section>
      <Footer />
    </div>
  );
};

const productList = [
  { title: 'Tape Extrusion Line', img: grid1 },
  { title: 'Winding Machines', img: grid2 },
  { title: 'Circular Looms', img: gridloom },
  { title: 'Extrusion Coating Line', img: gridbag },
  { title: 'Printing Machine', img: gridrad },
  { title: 'Bag Conversion Line', img: gridline },
];

// ProductCard component with dropdown
const ProductCard = ({ title, img }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="w-80 rounded-2xl shadow-lg bg-white overflow-hidden mb-8">
      <img
        src={img}
        alt={title}
        className="w-full h-32 object-cover"
      />
      <div className="flex items-center justify-between p-6 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <span className="text-xl font-medium">{title}</span>
        <span className={`bg-red-500 rounded-full p-2 flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </span>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="px-6 pb-4"
          >
            <div className="bg-gray-50 rounded-xl p-4 mt-2 shadow">
              <div className="py-2 px-3 hover:bg-gray-100 rounded-lg cursor-pointer border border-[#FF2B2B]">F.X. 10</div>
              <div className="py-2 px-3 hover:bg-gray-100 rounded-lg cursor-pointer border border-[#FF2B2B] mt-2">F.X. 8</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;