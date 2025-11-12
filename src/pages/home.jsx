import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import heroimg from '../assets/hero.png';
import grid1 from '../assets/grid1.png';
import grid2 from '../assets/grid2.png';
import gridbag from '../assets/gridbag.png';
import gridline from '../assets/gridline.png';
import gridloom from '../assets/gridloom.png';
import gridrad from '../assets/gridrad.png';
import gridshuttle from '../assets/gridshuttle.png';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Add a hook to detect if the screen is mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return isMobile;
}

const LandingPage = () => {
  const [openIndex, setOpenIndex] = React.useState(null);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        // Mock products for demo purposes
        const mockProducts = [
          { partNo: 'PART001', description: 'Sample Product 1' },
          { partNo: 'PART002', description: 'Sample Product 2' },
          { partNo: 'PART003', description: 'Sample Product 3' }
        ];
        setProducts(mockProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-white">
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
              <h3 className="text-2xl font-bold mb-2">“Engineered precision spare parts designed to ensure optimal performance and long-term reliability in every application.”</h3>
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
                <h3 className="text-lg font-bold">“Engineered precision spare parts designed to ensure optimal performance and long-term reliability in every application.”</h3>
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

    
    </div>
  );
};

const productList = [
  {
    title: 'Jaiko Loom Models',
    img: gridshuttle,
    category: 'jaiko-loom',
    dropdown: [
      { name: 'Vega-6 HS Star', subcategory: 'vega-6-hs-star' },
      { name: 'Vega 608 HF', subcategory: 'vega-608-hf' },
      { name: 'Vega 812 HF', subcategory: 'vega-812-hf' },
    ],
  },
  {
    title: 'JP Catalogues',
    img: gridbag,
    category: 'jp-catalogues',
    dropdown: [
      { name: 'Cheese winder JTW -200 IX', subcategory: 'cheese-winder-jtw-200-ix' },
      { name: 'Flexographic Printing Machine', subcategory: 'flexographic-printing-machine' },
      { name: 'Lamination-1600 Polycoat', subcategory: 'lamination-1600-polycoat' },
      { name: 'Bag liner insertion machine', subcategory: 'bag-liner-insertion-machine' },
      { name: 'Bag cutting Stitching Machine.', subcategory: 'bag-cutting-stitching-machine' },
    ],
  },
];

// ProductCard component with responsive dropdown direction
const ProductCard = ({ title, img, dropdown, isOpen, onClick, category }) => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const handleDropdownClick = (subcategory) => {
    navigate(`/products/${category}/${subcategory}`);
  };

  return (
    <div className="relative w-full">
      <div className={`flex ${isMobile ? 'flex-col' : 'items-center'} bg-white rounded-2xl shadow-lg overflow-hidden`}>
        {/* Main Card */}
        <div className="flex items-center w-full lg:w-80 p-6">
          <img
            src={img}
            alt={title}
            className="w-16 h-16 object-cover rounded-lg mr-4"
          />
          <div className="flex-1">
            <span className="text-xl font-medium">{title}</span>
          </div>
          <button
            onClick={onClick}
            className={`bg-red-500 rounded-full p-2 flex items-center justify-center transition-transform duration-300 ${isOpen && !isMobile ? 'rotate-90' : ''}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="white"
              className="w-6 h-6"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>

        {/* Desktop Dropdown - sideways expansion */}
        <AnimatePresence>
          {isOpen && !isMobile && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              className="bg-gray-50 border-l-2 border-red-500 overflow-hidden"
            >
              <div className="p-6 min-w-[600px]">
                <div className="grid grid-cols-3 gap-3">
                  {dropdown.map((item, idx) => (
                    <div
                      key={item.name}
                      onClick={() => handleDropdownClick(item.subcategory)}
                      className="py-3 px-4 bg-white hover:bg-red-50 rounded-lg cursor-pointer border border-red-200 hover:border-red-400 transition-colors duration-200 text-sm font-medium text-gray-700 hover:text-red-600"
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Dropdown - below the card */}
      <AnimatePresence>
        {isOpen && isMobile && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="w-full bg-gray-50 border-2 border-red-500 rounded-2xl mt-2 overflow-hidden"
          >
            <div className="p-4">
              <div className="grid grid-cols-1 gap-2">
                {dropdown.map((item, idx) => (
                  <div
                    key={item.name}
                    onClick={() => handleDropdownClick(item.subcategory)}
                    className="py-3 px-4 bg-white hover:bg-red-50 rounded-lg cursor-pointer border border-red-200 hover:border-red-400 transition-colors duration-200 text-sm font-medium text-gray-700 hover:text-red-600"
                  >
                    {item.name}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LandingPage;