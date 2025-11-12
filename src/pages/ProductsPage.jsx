import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gridshuttle from '../assets/gridshuttle.png';
import gridbag from '../assets/gridbag.png';

const ProductsPage = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api';

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

    // Filter products by selected category
    const displayProducts = selectedCategory
        ? products.filter(p => (p.category || 'General') === selectedCategory)
        : [];

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
                            ({displayProducts.length} products in "{selectedCategory}")
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
                        <div className="mb-6 flex items-center">
                            <div className="w-10 h-0.5 bg-black mr-4" />
                            <h3 className="text-xl font-semibold">{selectedCategory}</h3>
                        </div>
                        {displayProducts.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {displayProducts.map((product) => (
                                    <ProductItem key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">No products available</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    No products found in "{selectedCategory}" category
                                </p>
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
                    {dropdown.map((item, idx) => (
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
    return (
        <div className="bg-white rounded-xl p-4 border border-gray-200 hover:border-red-300 hover:shadow-lg transition-all duration-200 group cursor-pointer">
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
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded inline-block w-fit">
                        {product.category}
                    </span>
                )}
            </div>
        </div>
    );
};

export default ProductsPage; 