import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const CartPage = () => {
    const [cart, setCart] = useState([]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCart(storedCart);
    }, []);

    const removeFromCart = (partNo) => {
        const updatedCart = cart.filter(item => item["part no"] !== partNo);
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    const clearCart = () => {
        setCart([]);
        localStorage.removeItem('cart');
    };

    const handleQuantityChange = (partNo, newQty) => {
        if (newQty < 1) return;
        const updatedCart = cart.map(item =>
            item["part no"] === partNo ? { ...item, quantity: newQty } : item
        );
        setCart(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 mt-12">
                <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
                {cart.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🛒</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">Your cart is empty</h3>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-end">
                            <button
                                onClick={clearCart}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Clear Cart
                            </button>
                        </div>
                        <div className="space-y-4">
                            {cart.map((item, idx) => (
                                <div key={item["part no"] + idx} className="flex items-center bg-gray-50 rounded-xl p-4 shadow">
                                    <img
                                        src={item["image path"] ? `/data/stackofill ${item["image path"].replace('assets', 'assets')}` : '/assets/placeholder.jpg'}
                                        alt={item.description}
                                        className="w-20 h-20 object-contain rounded-lg mr-6"
                                    />
                                    <div className="flex-1">
                                        <div className="font-bold text-lg text-gray-800">{item.description}</div>
                                        <div className="text-sm text-gray-500">Part No: {item["part no"]}</div>
                                        <div className="flex items-center gap-4 mt-2">
                                            <button
                                                className="w-10 h-10 rounded-full bg-red-500 text-white text-2xl flex items-center justify-center disabled:opacity-50"
                                                onClick={() => handleQuantityChange(item["part no"], item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >-</button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => handleQuantityChange(item["part no"], Number(e.target.value))}
                                                className="w-16 text-center text-2xl border-none outline-none font-bold"
                                                style={{ appearance: 'textfield' }}
                                            />
                                            <button
                                                className="w-10 h-10 rounded-full bg-red-500 text-white text-2xl flex items-center justify-center"
                                                onClick={() => handleQuantityChange(item["part no"], item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item["part no"])}
                                        className="ml-4 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-red-100 hover:text-red-600"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CartPage;
