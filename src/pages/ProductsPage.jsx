import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 25;

    const API_BASE_URL = 'https://spares.jpel.in/api';

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            // Get auth token if available
            const token = localStorage.getItem('token');
            const headers = {
                'Content-Type': 'application/json'
            };
            
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
            
            // Fetch all products by setting a high limit (e.g., 10000)
            const response = await fetch(`${API_BASE_URL}/products?limit=10000`, {
                headers
            });
            const result = await response.json();
            
            if (result.success) {
                setProducts(result.data.products || []);
                console.log(`✅ Loaded ${result.data.products?.length || 0} products`);
            } else {
                setError('Failed to load products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    // Get unique categories from products (excluding 'All' and 'General' if empty)
    const productCategories = [...new Set(products.map(p => p.category || 'General').filter(cat => cat && cat !== 'General'))];

    // Filter products by selected category and search term
    const filteredProducts = products.filter(p => {
        // Filter by category if selected
        const categoryMatch = !selectedCategory || (p.category || 'General') === selectedCategory;
        
        // Filter by search term (product name/description or product code/partNumber)
        const searchMatch = !searchTerm || 
            (p.partNumber && p.partNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
        
        return categoryMatch && searchMatch;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const displayProducts = filteredProducts.slice(startIndex, endIndex);

    // Reset to page 1 when search term or category changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedCategory]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-600"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <p className="text-red-600 text-lg mb-4">{error}</p>
                            <button 
                                onClick={fetchProducts}
                                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                <div className="mb-8 flex items-center">
                    <div className="w-10 h-0.5 bg-black mr-4" />
                    <h2 className="text-2xl font-semibold">Products</h2>
                    {selectedCategory && (
                        <span className="ml-4 text-sm text-gray-500">
                            ({filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} in "{selectedCategory}")
                        </span>
                    )}
                </div>

                {/* Excel Category Buttons */}
                {productCategories.length > 0 && (
                    <div className="mb-12">
                   
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {productCategories.map((category) => {
                                const categoryProducts = products.filter(p => (p.category || 'General') === category);
                                return (
                                    <CategoryButton
                                        key={category}
                                        category={category}
                                        productCount={categoryProducts.length}
                                        isSelected={selectedCategory === category}
                                        onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                                    />
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Products List - Only show when a category is selected */}
                {selectedCategory && (
                    <>
                        <div className="mb-6">
                            <div className="mb-4 flex items-center">
                                <div className="w-10 h-0.5 bg-black mr-4" />
                                <h3 className="text-xl font-semibold">{selectedCategory}</h3>
                            </div>
                            
                            {/* Search Bar */}
                            <div className="mb-6">
                                <div className="relative max-w-md">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search by product name or code..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                    />
                                    {searchTerm && (
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                        >
                                            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                                {searchTerm && (
                                    <p className="mt-2 text-sm text-gray-600">
                                        Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} matching "{searchTerm}"
                                    </p>
                                )}
                            </div>
                        </div>

                        {displayProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
                                    {displayProducts.map((product) => (
                                        <ProductItem key={product.id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8">
                                        <div className="flex flex-1 justify-between sm:hidden">
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                                className={`relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                                                    currentPage === 1 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Previous
                                            </button>
                                            <button
                                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                                className={`relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium ${
                                                    currentPage === totalPages 
                                                        ? 'text-gray-400 cursor-not-allowed' 
                                                        : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                            >
                                                Next
                                            </button>
                                        </div>
                                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                            <div>
                                                <p className="text-sm text-gray-700">
                                                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                                                    <span className="font-medium">{Math.min(endIndex, filteredProducts.length)}</span> of{' '}
                                                    <span className="font-medium">{filteredProducts.length}</span> results
                                                </p>
                                            </div>
                                            <div>
                                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                                        disabled={currentPage === 1}
                                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                                            currentPage === 1 ? 'cursor-not-allowed opacity-50' : ''
                                                        }`}
                                                    >
                                                        <span className="sr-only">Previous</span>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                    
                                                    {/* Page Numbers */}
                                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                                        // Show first page, last page, current page, and pages around current
                                                        if (
                                                            page === 1 ||
                                                            page === totalPages ||
                                                            (page >= currentPage - 1 && page <= currentPage + 1)
                                                        ) {
                                                            return (
                                                                <button
                                                                    key={page}
                                                                    onClick={() => setCurrentPage(page)}
                                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                                                        page === currentPage
                                                                            ? 'z-10 bg-red-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'
                                                                            : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                                    }`}
                                                                >
                                                                    {page}
                                                                </button>
                                                            );
                                                        } else if (page === currentPage - 2 || page === currentPage + 2) {
                                                            return (
                                                                <span key={page} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                                                    ...
                                                                </span>
                                                            );
                                                        }
                                                        return null;
                                                    })}
                                                    
                                                    <button
                                                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                                        disabled={currentPage === totalPages}
                                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                                            currentPage === totalPages ? 'cursor-not-allowed opacity-50' : ''
                                                        }`}
                                                    >
                                                        <span className="sr-only">Next</span>
                                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </nav>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No products available</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {searchTerm 
                                        ? `No products found matching "${searchTerm}" in "${selectedCategory}" category`
                                        : `No products found in "${selectedCategory}" category`
                                    }
                                </p>
                                {searchTerm && (
                                    <button
                                        onClick={() => setSearchTerm('')}
                                        className="mt-4 text-sm text-red-600 hover:text-red-800 underline"
                                    >
                                        Clear search
                                    </button>
                                )}
                            </div>
                        )}
                    </>
                )}

                {/* Show message when no category is selected */}
                {!selectedCategory && productCategories.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">No products available</p>
                        <p className="text-gray-400 text-sm mt-2">Upload an Excel file in the admin panel to add products</p>
                    </div>
                )}

                {!selectedCategory && productCategories.length > 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500 text-lg">Select a category above to view products</p>
                    </div>
                )}

       
            </main>
        </div>
    );
};

// Legacy product list - kept for reference but not currently used
// const productList = [
//     {
//         title: 'Jaiko Loom Models',
//         img: gridshuttle,
//         category: 'jaiko-loom',
//         dropdown: [
//             { name: 'Vega-6 HS Star', subcategory: 'vega-6-hs-star' },
//             { name: 'Vega 608 HF', subcategory: 'vega-608-hf' },
//             { name: 'Vega 812 HF', subcategory: 'vega-812-hf' },
//         ],
//     },
//     {
//         title: 'JP Catalogues',
//         img: gridbag,
//         category: 'jp-catalogues',
//         dropdown: [
//             { name: 'Cheese winder JTW -200 IX', subcategory: 'cheese-winder-jtw-200-ix' },
//             { name: 'Flexographic Printing Machine', subcategory: 'flexographic-printing-machine' },
//             { name: 'Lamination-1600 Polycoat', subcategory: 'lamination-1600-polycoat' },
//             { name: 'Bag liner insertion machine', subcategory: 'bag-liner-insertion-machine' },
//             { name: 'Bag cutting Stitching Machine.', subcategory: 'bag-cutting-stitching-machine' },
//         ],
//     },
// ];

// CategoryButton component for Excel file categories
const CategoryButton = ({ category, productCount, isSelected, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer border-2 ${
                isSelected ? 'border-red-600 bg-red-50' : 'border-gray-200 hover:border-red-300'
            }`}
        >
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                        <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-red-600' : 'text-gray-800'}`}>
                            {category}
                        </h3>
                        <p className={`text-sm ${isSelected ? 'text-red-600' : 'text-gray-600'}`}>
                            {productCount} {productCount === 1 ? 'product' : 'products'}
                        </p>
                    </div>
                    <div className={`ml-4 p-3 rounded-lg ${isSelected ? 'bg-red-600' : 'bg-gray-100'}`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-gray-600'}`}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </div>
                </div>
                <div className={`mt-4 text-center py-2 rounded-lg font-medium ${
                    isSelected 
                        ? 'bg-red-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                    {isSelected ? 'Viewing Products' : 'View Products'}
                </div>
            </div>
        </div>
    );
};

// ProductCard component with subcategories displayed directly
const ProductCard = ({ title, img, dropdown, category }) => {
    const navigate = useNavigate();

    const handleDropdownClick = (subcategory) => {
        navigate(`/products/${category}/${subcategory}`);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            {/* Header with image and title */}
            <div className="flex items-center p-8 bg-gradient-to-r from-gray-50 to-white">
                <img
                    src={img}
                    alt={title}
                    className="w-24 h-24 object-cover rounded-xl mr-6"
                />
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
                    <p className="text-gray-600">Select a category to view products</p>
                </div>
            </div>

            {/* Subcategories grid */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dropdown.map((item) => (
                        <div
                            key={item.name}
                            onClick={() => handleDropdownClick(item.subcategory)}
                            className="p-4 bg-gray-50 hover:bg-red-50 rounded-xl cursor-pointer border border-gray-200 hover:border-red-300 transition-all duration-200 group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700 group-hover:text-red-600 transition-colors duration-200">
                                    {item.name}
                                </span>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={2}
                                    stroke="currentColor"
                                    className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ProductItem component for individual products from Excel
const ProductItem = ({ product }) => {
    const { addToCart, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [quantity, setQuantity] = useState(1);
    const [addingToCart, setAddingToCart] = useState(false);
    const [addToCartMessage, setAddToCartMessage] = useState('');

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        setAddingToCart(true);
        setAddToCartMessage('');

        try {
            const result = await addToCart(
                product.partNumber,
                product.description,
                0, // No price - for quote requests
                quantity,
                product.image,
                product.category
            );

            if (result.success) {
                setAddToCartMessage('Added to cart!');
                setTimeout(() => setAddToCartMessage(''), 2000);
            } else {
                setAddToCartMessage(result.message || 'Failed to add to cart');
            }
        } catch {
            setAddToCartMessage('Failed to add to cart');
        } finally {
            setAddingToCart(false);
        }
    };

    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 group">
            {/* Product Image */}
            <div className="mb-3 flex justify-center">
                <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                    {product.image && (product.image.startsWith('http') || product.image.startsWith('data:') || product.image.startsWith('/')) ? (
                        <img 
                            src={product.image} 
                            alt={product.partNumber}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                                e.target.style.display = 'none';
                                const placeholder = e.target.parentElement.querySelector('.placeholder-icon');
                                if (placeholder) placeholder.style.display = 'flex';
                            }}
                        />
                    ) : null}
                    <div className="placeholder-icon w-full h-full bg-gray-100 flex items-center justify-center" style={{display: product.image && (product.image.startsWith('http') || product.image.startsWith('data:') || product.image.startsWith('/')) ? 'none' : 'flex'}}>
                        <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <div className="flex flex-col">
                <h4 className="text-sm font-semibold text-gray-900 group-hover:text-red-600 transition-colors duration-200 mb-1">
                    {product.partNumber}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-3 mb-2">
                    {product.description}
                </p>
                {product.category && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block w-fit mb-3">
                        {product.category}
                    </span>
                )}

                {/* Quantity Selector */}
                <div className="mb-3">
                    <label className="text-xs text-gray-600 mb-1 block">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                            type="button"
                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                            className="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 rounded-l-lg"
                        >
                            -
                        </button>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-12 h-8 text-center border-0 focus:ring-0 focus:outline-none"
                        />
                        <button
                            type="button"
                            onClick={() => setQuantity(prev => prev + 1)}
                            className="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 rounded-r-lg"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Add to Cart Button */}
                <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className={`w-full py-2 px-4 rounded-lg font-medium text-sm transition-colors ${
                        addingToCart
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                >
                    {addingToCart ? (
                        <span className="flex items-center justify-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Adding...
                        </span>
                    ) : (
                        'Add to Cart'
                    )}
                </button>

                {addToCartMessage && (
                    <p className={`text-xs mt-2 text-center ${
                        addToCartMessage.includes('Added') ? 'text-green-600' : 'text-red-600'
                    }`}>
                        {addToCartMessage}
                    </p>
                )}
            </div>
        </div>
    );
};

export default ProductsPage; 