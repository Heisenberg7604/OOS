import React from 'react';
import { useNavigate } from 'react-router-dom';
import gridshuttle from '../assets/gridshuttle.png';
import gridbag from '../assets/gridbag.png';

const ProductsPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                <div className="mb-8 flex items-center">
                    <div className="w-10 h-0.5 bg-black mr-4" />
                    <h2 className="text-2xl font-semibold">Products</h2>
                </div>

                {/* Product Cards Container */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {productList.map((product, idx) => (
                        <ProductCard
                            key={product.title + idx}
                            title={product.title}
                            img={product.img}
                            dropdown={product.dropdown}
                            category={product.category}
                        />
                    ))}
                </div>

                {/* More coming soon */}
                <div className="mt-8 mb-12">
                    <span className="text-3xl text-red-500 font-semibold drop-shadow-md">More coming soon...</span>
                </div>
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

export default ProductsPage; 