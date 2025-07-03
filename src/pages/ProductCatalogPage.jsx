import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const ProductCatalogPage = () => {
    const navigate = useNavigate();
    // State management
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('description');
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(20);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [cart, setCart] = useState([]);

    // Load products from stackofill.json
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('/data/stackofill.json');
                if (!response.ok) {
                    throw new Error(`Failed to load products: ${response.status}`);
                }
                const data = await response.json();
                setProducts(data || []);
            } catch (err) {
                setError(err.message);
                console.error('Error loading products:', err);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Load cart from localStorage on mount
    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);
    }, []);

    // Helper to update cart in state and localStorage
    const updateCart = (newCart) => {
        setCart(newCart);
        localStorage.setItem('cart', JSON.stringify(newCart));
    };

    // Filter and sort products
    useEffect(() => {
        let filtered = [...products];
        // Apply search filter
        if (searchTerm) {
            filtered = filtered.filter(product =>
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product["part no"] && product["part no"].toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        // Apply sorting
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'description':
                    return (a.description || '').localeCompare(b.description || '');
                case 'partno':
                    return (a["part no"] || '').localeCompare(b["part no"] || '');
                default:
                    return 0;
            }
        });
        setFilteredProducts(filtered);
        setCurrentPage(1); // Reset to first page when filtering
    }, [products, searchTerm, sortBy]);

    // Pagination
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    // Handle image load error
    const handleImageError = (e) => {
        e.target.src = '/assets/placeholder.jpg';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600">Loading products...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">⚠️ Error Loading Products</div>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                        >
                            Go Back
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-0.5 bg-black mr-4" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            Stacofill 200 A II
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Showing {filteredProducts.length} of {products.length} products
                    </p>
                </div>
                {/* Search and Sort Controls */}
                <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Search Products
                            </label>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by part no or description..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                        </div>
                        {/* Sort */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sort By
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            >
                                <option value="description">Description</option>
                                <option value="partno">Part No</option>
                            </select>
                        </div>
                    </div>
                </div>
                {/* Products Grid */}
                {currentProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {currentProducts.map((product, idx) => (
                            <div
                                key={product["part no"] + idx}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                            >
                                {/* Product Image */}
                                <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                    <img
                                        src={product["image path"] ? `/data/stackofill ${product["image path"].replace('assets', 'assets')}` : '/assets/placeholder.jpg'}
                                        alt={product.description}
                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                        onError={handleImageError}
                                    />
                                </div>
                                {/* Product Info */}
                                <div className="p-6">
                                    <div className="mb-2">
                                        <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                            {product["part no"]}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                        {product.description}
                                    </h3>
                                    {/* Cart Controls */}
                                    {(() => {
                                        const cartItem = cart.find(item => item["part no"] === product["part no"]);
                                        if (cartItem && cartItem.quantity > 0) {
                                            return (
                                                <div className="flex items-center justify-between mt-4">
                                                    <button
                                                        className="w-10 h-10 rounded-full bg-red-500 text-white text-2xl flex items-center justify-center hover:bg-red-600"
                                                        onClick={() => {
                                                            let newCart;
                                                            if (cartItem.quantity === 1) {
                                                                newCart = cart.filter(item => item["part no"] !== product["part no"]);
                                                            } else {
                                                                newCart = cart.map(item =>
                                                                    item["part no"] === product["part no"]
                                                                        ? { ...item, quantity: item.quantity - 1 }
                                                                        : item
                                                                );
                                                            }
                                                            updateCart(newCart);
                                                        }}
                                                    >-</button>
                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={cartItem.quantity}
                                                        onChange={e => {
                                                            let value = Number(e.target.value);
                                                            if (isNaN(value) || value < 1) value = 1;
                                                            const newCart = cart.map(item =>
                                                                item["part no"] === product["part no"]
                                                                    ? { ...item, quantity: value }
                                                                    : item
                                                            );
                                                            updateCart(newCart);
                                                        }}
                                                        className="mx-2 w-16 text-center text-lg border border-gray-300 rounded"
                                                        style={{ appearance: 'textfield' }}
                                                    />
                                                    <button
                                                        className="w-10 h-10 rounded-full bg-red-500 text-white text-2xl flex items-center justify-center hover:bg-red-600"
                                                        onClick={() => {
                                                            const newCart = cart.map(item =>
                                                                item["part no"] === product["part no"]
                                                                    ? { ...item, quantity: item.quantity + 1 }
                                                                    : item
                                                            );
                                                            updateCart(newCart);
                                                        }}
                                                    >+</button>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <button
                                                    className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
                                                    onClick={() => {
                                                        const existing = cart.find(item => item["part no"] === product["part no"]);
                                                        let newCart;
                                                        if (existing) {
                                                            newCart = cart.map(item =>
                                                                item["part no"] === product["part no"]
                                                                    ? { ...item, quantity: (item.quantity || 1) + 1 }
                                                                    : item
                                                            );
                                                        } else {
                                                            newCart = [...cart, { ...product, quantity: 1 }];
                                                        }
                                                        updateCart(newCart);
                                                    }}
                                                >
                                                    Add to Cart
                                                </button>
                                            );
                                        }
                                    })()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center space-x-2 mb-12">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        {[...Array(Math.min(5, totalPages))].map((_, index) => {
                            const pageNum = Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + index;
                            return pageNum <= totalPages ? (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-4 py-2 rounded-lg ${currentPage === pageNum
                                        ? 'bg-red-500 text-white'
                                        : 'border border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            ) : null;
                        })}
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default ProductCatalogPage; 