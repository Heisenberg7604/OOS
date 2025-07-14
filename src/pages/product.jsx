import React, { useEffect, useState } from 'react';

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetch('http://localhost:5000/api/products');
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.partNo} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                            <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
                                <img
                                    src={product.imagePath || '/assets/placeholder.jpg'}
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
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default ProductPage;
