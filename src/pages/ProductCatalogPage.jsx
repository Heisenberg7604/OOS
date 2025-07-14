import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductCatalogPage = () => {
    const navigate = useNavigate();
    const { addToCart, isAuthenticated, cart, loadCart } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('description');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                // Fetch products from backend API
                const response = await fetch('http://localhost:5000/api/products');
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
        if (isAuthenticated) loadCart();
        // eslint-disable-next-line
    }, [isAuthenticated]);

    useEffect(() => {
        let filtered = [...products];
        if (searchTerm) {
            filtered = filtered.filter(product =>
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.partNo && product.partNo.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'description':
                    return (a.description || '').localeCompare(b.description || '');
                case 'partno':
                    return (a.partNo || '').localeCompare(b.partNo || '');
                default:
                    return 0;
            }
        });
        setFilteredProducts(filtered);
    }, [products, searchTerm, sortBy]);

    const handleImageError = (e) => {
        e.target.src = '/assets/placeholder.jpg';
    };

    const handleAddToCart = async (partNo) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const result = await addToCart(partNo, 1);
        if (result.success) {
            setSuccessMsg('Added to cart!');
            loadCart();
            setTimeout(() => setSuccessMsg(''), 1500);
        } else {
            setError(result.message || 'Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-lg text-gray-600">Loading products...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
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
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-0.5 bg-black mr-4" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            Product Catalog
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Showing {filteredProducts.length} of {products.length} products
                    </p>
                </div>
                {/* Success Message */}
                {successMsg && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
                        {successMsg}
                    </div>
                )}
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
                {filteredProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                        {filteredProducts.map((product) => {
                            const cartItem = cart?.items?.find(item => item.partNo === product.partNo);
                            // Fix image path
                            let imgSrc = product.imagePath || '/assets/placeholder.jpg';
                            if (imgSrc && !imgSrc.startsWith('/')) {
                                imgSrc = '/data/stackofill assets/' + imgSrc.replace(/^assets\//, '');
                            }
                            return (
                                <div
                                    key={product.partNo}
                                    className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                >
                                    {/* Product Image */}
                                    <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                        <img
                                            src={imgSrc}
                                            alt={product.description}
                                            className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                            onError={handleImageError}
                                        />
                                    </div>
                                    {/* Product Info */}
                                    <div className="p-6">
                                        <div className="mb-2">
                                            <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                                {product.partNo}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                                            {product.description}
                                        </h3>
                                        {/* Cart Controls */}
                                        {cartItem && cartItem.quantity > 0 ? (
                                            <div className="flex items-center justify-between mt-4">
                                                <span className="text-green-600 font-semibold">In Cart ({cartItem.quantity})</span>
                                            </div>
                                        ) : (
                                            <button
                                                className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
                                                onClick={() => handleAddToCart(product.partNo)}
                                            >
                                                Add to Cart
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* Checkout Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate('/cart')}
                        className="bg-red-500 text-white px-12 py-4 rounded-lg text-lg font-semibold hover:bg-red-600 transition-colors duration-200"
                    >
                        Checkout
                    </button>
                </div>
            </main>
        </div>
    );
};

export default ProductCatalogPage; 