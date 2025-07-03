import React, { useState, useEffect } from 'react';
import Navbar from '../components/navbar';
import Footer from '../components/Footer';

const CartPage = () => {
    const [cart, setCart] = useState([]);
    const [orderConfirmed, setOrderConfirmed] = useState(false);

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
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 mt-12 mb-12">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {cart.map((item, idx) => (
                                <div key={item["part no"] + idx} className="flex flex-col items-center bg-gray-50 rounded-xl p-2 sm:p-4 shadow h-full text-center">
                                    <img
                                        src={item["image path"] ? `/data/stackofill ${item["image path"].replace('assets', 'assets')}` : '/assets/placeholder.jpg'}
                                        alt={item.description}
                                        className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-lg mb-2"
                                    />
                                    <div className="flex-1 text-center">
                                        <div className="font-bold text-base sm:text-lg text-gray-800">{item.description}</div>
                                        <div className="text-xs sm:text-sm text-gray-500">Part No: {item["part no"]}</div>
                                        <div className="flex items-center gap-2 sm:gap-4 mt-2 justify-center">
                                            <button
                                                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-red-500 text-white text-xl sm:text-2xl flex items-center justify-center disabled:opacity-50"
                                                onClick={() => handleQuantityChange(item["part no"], item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >-</button>
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.quantity}
                                                onChange={e => handleQuantityChange(item["part no"], Number(e.target.value))}
                                                className="px-1 sm:px-2 text-center text-lg sm:text-2xl border-none outline-none font-bold bg-white flex-shrink-0"
                                                style={{ appearance: 'textfield', width: `${Math.max(String(item.quantity).length, 3)}ch` }}
                                            />
                                            <button
                                                className="w-8 h-8 sm:w-12 sm:h-12 rounded-full bg-red-500 text-white text-xl sm:text-2xl flex items-center justify-center"
                                                onClick={() => handleQuantityChange(item["part no"], item.quantity + 1)}
                                            >+</button>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item["part no"])}
                                        className="mt-2 bg-gray-200 text-gray-700 px-2 sm:px-3 py-1 rounded hover:bg-red-100 hover:text-red-600 text-xs sm:text-base"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center mt-8 px-2">
                            <button
                                onClick={() => setOrderConfirmed(true)}
                                className="w-full sm:w-auto bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-base sm:text-lg font-semibold hover:bg-green-700 transition-colors shadow"
                                disabled={orderConfirmed}
                            >
                                Confirm Order
                            </button>
                        </div>
                        {orderConfirmed && (
                            <div className="mt-8 bg-gray-100 rounded-lg p-2 sm:p-6 shadow overflow-x-auto">
                                <h2 className="text-xl sm:text-2xl font-bold mb-4 text-center">Order Details</h2>
                                <div className="block w-full overflow-x-auto">
                                    <table className="min-w-full text-left text-gray-700 text-xs sm:text-base">
                                        <thead>
                                            <tr>
                                                <th className="px-2 sm:px-4 py-2">Image</th>
                                                <th className="px-2 sm:px-4 py-2">Description</th>
                                                <th className="px-2 sm:px-4 py-2">Part No</th>
                                                <th className="px-2 sm:px-4 py-2">Quantity</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item, idx) => (
                                                <tr key={item["part no"] + idx} className="border-t">
                                                    <td className="px-2 sm:px-4 py-2">
                                                        <img
                                                            src={item["image path"] ? `/data/stackofill ${item["image path"].replace('assets', 'assets')}` : '/assets/placeholder.jpg'}
                                                            alt={item.description}
                                                            className="w-8 h-8 sm:w-12 sm:h-12 object-contain rounded"
                                                        />
                                                    </td>
                                                    <td className="px-2 sm:px-4 py-2">{item.description}</td>
                                                    <td className="px-2 sm:px-4 py-2">{item["part no"]}</td>
                                                    <td className="px-2 sm:px-4 py-2">{item.quantity}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex justify-center mt-6 sm:mt-6">
                                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow">
                                        Get Invoice
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default CartPage;
