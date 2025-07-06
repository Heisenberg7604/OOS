import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';
import heroimg from '../assets/hero.png';

const productList = [
    {
        title: 'Jaiko Loom Models',
        img: heroimg,
        category: 'jaiko-loom',
        dropdown: [
            { name: 'Vega-6 HS Star', subcategory: 'vega-6-hs-star' },
            { name: 'Vega 608 HF', subcategory: 'vega-608-hf' },
            { name: 'Vega 812 HF', subcategory: 'vega-812-hf' },
        ],
    },
    {
        title: 'JP Catalogues',
        img: heroimg,
        category: 'jp-catalogues',
        dropdown: [
            { name: 'Cheese winder JTW -200 IX', subcategory: 'cheese-winder-jtw-200-ix' },
            { name: 'Flexographic Printing Machine', subcategory: 'flexographic-printing-machine' },
            { name: 'Lamination-1600 Polycoat', subcategory: 'lamination-1600-polycoat' },
            { name: 'Bag liner insertion machine', subcategory: 'bag-liner-insertion-machine' },
            { name: 'Bag cutting Stitching Machine', subcategory: 'bag-cutting-stitching-machine' },
        ],
    },
];

const ProductsPage = () => {
    const navigate = useNavigate();
    const handleCategoryClick = (category, subcategory) => {
        navigate(`/products/${category}/${subcategory}`);
    };
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                <div className="mb-8 flex items-center">
                    <div className="w-10 h-0.5 bg-black mr-4" />
                    <h2 className="text-2xl font-semibold">Products</h2>
                </div>
                <div className="space-y-10">
                    {productList.map((product, idx) => (
                        <div
                            key={product.title + idx}
                            className="flex flex-col md:flex-row bg-white rounded-3xl shadow-lg overflow-hidden w-full"
                        >
                            {/* Image section */}
                            <div className="md:w-1/2 w-full h-64 md:h-auto flex-shrink-0">
                                <img
                                    src={product.img}
                                    alt={product.title}
                                    className="w-full h-full object-cover rounded-3xl md:rounded-none md:rounded-l-3xl"
                                />
                            </div>
                            {/* Categories section */}
                            <div className="flex-1 p-8 flex flex-col justify-center">
                                <h3 className="text-2xl font-bold mb-6 text-gray-800">{product.title}</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {product.dropdown.map((item, idx) => (
                                        <div
                                            key={item.name || item}
                                            onClick={() => handleCategoryClick(
                                                product.category,
                                                item.subcategory || item.toLowerCase().replace(/\s+/g, '-')
                                            )}
                                            className="py-4 px-6 border border-red-200 rounded-xl text-lg font-semibold text-gray-800 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 cursor-pointer text-center transform hover:scale-105"
                                        >
                                            {item.name || item}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-12 mb-12">
                    <span className="text-3xl text-red-500 font-semibold drop-shadow-md">More coming soon...</span>
                </div>
            </main>
        </div>
    );
};

export default ProductsPage; 