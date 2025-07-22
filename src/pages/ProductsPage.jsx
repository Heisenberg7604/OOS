import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProductsPage = () => {
    const navigate = useNavigate();
    const { addToCart, isAuthenticated } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('http://localhost:5001/api/products');
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const handleAddToCart = async (partNo) => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        const result = await addToCart(partNo, 1);
        if (result.success) {
            setSuccessMsg('Added to cart!');
            setTimeout(() => setSuccessMsg(''), 1500);
        } else {
            setError(result.message || 'Failed to add to cart');
        }
    };

    if (loading) {
        return <div className="text-center py-12">Loading products...</div>;
    }
    if (error) {
        return <div className="text-center py-12 text-red-500">{error}</div>;
    }
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                <div className="mb-8 flex items-center">
                    <div className="w-10 h-0.5 bg-black mr-4" />
                    <h2 className="text-2xl font-semibold">Products</h2>
                </div>
                {successMsg && (
                    <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-lg text-center font-semibold">
                        {successMsg}
                    </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => {
                        let imgSrc = product.imagePath || '/assets/placeholder.jpg';
                        // If imagePath does not start with /, fix it
                        if (imgSrc && !imgSrc.startsWith('/')) {
                            imgSrc = '/data/' + imgSrc.replace(/^assets\//, '');
                        }
                        return (
                            <div key={product.partNo} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                    <img
                                        src={imgSrc}
                                        alt={product.description}
                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                        onError={e => { e.target.src = '/assets/placeholder.jpg'; }}
                                    />
                                </div>
                                <div className="p-6">
                                    <div className="mb-2">
                                        <span className="text-sm font-medium text-red-500 bg-red-50 px-2 py-1 rounded">{product.partNo}</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.description}</h3>
                                    <button
                                        className="mt-4 w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 font-semibold"
                                        onClick={() => handleAddToCart(product.partNo)}
                                    >
                                        Add to Cart
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default ProductsPage; 