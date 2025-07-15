import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Mapping from subcategory to JSON and asset folder
const PRODUCT_MAP = {
    'cheese-winder-jtw-200-ix': {
        json: '/data/Cheese_Winder_JTW_(200IX).json',
        asset: '/data/Cheese-winder(200IX) assets/',
        title: 'Cheese Winder JTW - 200 IX',
    },
    'vega-6-hs-star': {
        json: '/data/VEGA-6_HS_STAR.json',
        asset: '/data/VEGA-6 HS STAR assets/',
        title: 'Vega-6 HS Star',
    },
    'flexographic-printing-machine': {
        json: '/data/PRINTING_MACHINE.json',
        asset: '/data/PRINTING_MACHINE assets/',
        title: 'Flexographic Printing Machine',
    },
    'vega-812-hf': {
        json: '/data/JAIKO-812_HF.json',
        asset: '/data/JAIKO-812_HF assets/',
        title: 'Vega 812 HF',
    },
    'lamination-1600-polycoat': {
        json: '/data/Polycoat.json',
        asset: '/data/Polycoat assets/',
        title: 'Lamination-1600 Polycoat',
    },
    // Add more mappings as you add more products
};

const FALLBACK = PRODUCT_MAP['cheese-winder-jtw-200-ix'];

const PAGE_SIZE = 50;

const ProductCatalogPage = () => {
    const navigate = useNavigate();
    const { subcategory } = useParams();
    const { addToCart, isAuthenticated, cart, loadCart } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('description');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [successMsg, setSuccessMsg] = useState('');
    const [assetPrefix, setAssetPrefix] = useState(FALLBACK.asset);
    const [pageTitle, setPageTitle] = useState(FALLBACK.title);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const prod = PRODUCT_MAP[subcategory] || FALLBACK;
        setAssetPrefix(prod.asset);
        setPageTitle(prod.title);
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                let response = await fetch(prod.json);
                if (!response.ok) throw new Error('Not found');
                let data = await response.json();
                setProducts(data);
            } catch (err) {
                // fallback
                if (prod !== FALLBACK) {
                    try {
                        let response = await fetch(FALLBACK.json);
                        let data = await response.json();
                        setProducts(data);
                    } catch (e) {
                        setError('Failed to load products');
                    }
                } else {
                    setError('Failed to load products');
                }
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
        if (isAuthenticated) loadCart();
        // eslint-disable-next-line
    }, [subcategory, isAuthenticated]);

    // Helper for consistent part number sorting
    const getPartNumber = (product) => product.partNo || product.part_code || '';

    useEffect(() => {
        let filtered = [...products];
        if (searchTerm) {
            filtered = filtered.filter(product =>
                (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.partNo && product.partNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (product.part_code && product.part_code.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'description':
                    return (a.description || '').localeCompare(b.description || '');
                case 'partno':
                    return getPartNumber(a).localeCompare(getPartNumber(b));
                default:
                    return 0;
            }
        });
        setFilteredProducts(filtered);
    }, [products, searchTerm, sortBy, subcategory]);

    // Reset to first page only when search/sort/subcategory changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, sortBy, subcategory]);

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / PAGE_SIZE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const firstProductIdx = filteredProducts.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
    const lastProductIdx = Math.min(currentPage * PAGE_SIZE, filteredProducts.length);

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
                            {pageTitle} Catalog
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Showing {firstProductIdx}–{lastProductIdx} of {filteredProducts.length} products
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
                {paginatedProducts.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {paginatedProducts.map((product) => {
                                const cartItem = cart?.items?.find(item => (item.partNo === product.partNo || item.partNo === product.part_code));
                                // Use part_image or imagePath
                                let imgFiles = [];
                                if (Array.isArray(product.part_image)) {
                                    imgFiles = product.part_image.map(img => img.split('/').pop());
                                } else if (product.part_image) {
                                    imgFiles = [product.part_image.split('/').pop()];
                                } else if (product.imagePath) {
                                    imgFiles = [product.imagePath.split('/').pop()];
                                }
                                return (
                                    <div
                                        key={product.partNo || product.part_code}
                                        className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                                    >
                                        {/* Product Image(s) */}
                                        <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                            {imgFiles.length > 0 ? (
                                                imgFiles.map((imgFile, idx) => (
                                                    <img
                                                        key={imgFile + idx}
                                                        src={imgFile ? assetPrefix + imgFile : '/assets/placeholder.jpg'}
                                                        alt={product.description}
                                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                                        onError={handleImageError}
                                                        style={{ maxWidth: '50%', maxHeight: '100%', display: 'inline-block' }}
                                                    />
                                                ))
                                            ) : (
                                                <img
                                                    src={'/assets/placeholder.jpg'}
                                                    alt={product.description}
                                                    className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                                    onError={handleImageError}
                                                />
                                            )}
                                        </div>
                                        {/* Product Info */}
                                        <div className="p-6">
                                            <div className="mb-2">
                                                <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">
                                                    {product.partNo || product.part_code}
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
                                                    onClick={() => handleAddToCart(product.partNo || product.part_code)}
                                                >
                                                    Add to Cart
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center items-center gap-2 mb-8">
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            {/* Page numbers */}
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`px-3 py-2 rounded font-semibold ${currentPage === i + 1
                                        ? 'bg-red-500 text-white'
                                        : 'bg-gray-100 hover:bg-gray-200'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </>
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