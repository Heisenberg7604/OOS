import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
    const [cart, setCart] = useState({ items: [], total: 0 });
    const [orderConfirmed, setOrderConfirmed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isCartLoading, setIsCartLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});
    
    const { user, isAuthenticated, logout, token, api } = useAuth();
    const navigate = useNavigate();

    const fetchCart = async () => {
        if (!isAuthenticated || !token) {
            console.error('Authentication required - redirecting to login');
            navigate('/login');
            return;
        }
        
        setIsCartLoading(true);
        setError(null);
        
        try {
            console.log('Attempting to fetch cart...');
            const response = await api.get('/cart', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.data && (response.data.items || response.data.length === 0)) {
                console.log('Cart data received:', response.data);
                setCart(response.data);
            } else {
                throw new Error('Invalid cart data structure received');
            }
        } catch (error) {
            console.error('Cart fetch error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: {
                    url: error.config?.url,
                    method: error.config?.method
                }
            });
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                console.log('Authentication error - logging out');
                logout();
                navigate('/login');
            } else if (error.response?.status === 404) {
                setError('Cart service unavailable. Please try again later.');
            } else {
                setError(error.response?.data?.message || 
                        error.message || 
                        'Failed to load cart. Please refresh the page.');
            }
        } finally {
            setIsCartLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        
        fetchCart();
        
        // Cleanup function
        return () => {
            // Cancel any pending requests if component unmounts
        };
    }, [isAuthenticated, token, navigate]);

    const removeFromCart = async (partNo) => {
        if (!isAuthenticated || !token) {
            navigate('/login');
            return;
        }
        
        try {
            // Optimistic UI update
            setCart(prev => ({
                ...prev,
                items: prev.items.filter(item => item["part no"] !== partNo),
                total: prev.total - (prev.items.find(item => item["part no"] === partNo)?.price || 0)
            }));
            
            await api.delete(`/cart/remove/${encodeURIComponent(partNo)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Final sync with server
            await fetchCart();
        } catch (error) {
            console.error('Remove item error:', error);
            // Revert optimistic update on error
            await fetchCart();
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
                navigate('/login');
            } else {
                setError('Failed to remove item. Please try again.');
            }
        }
    };

    const clearCart = async () => {
        if (!isAuthenticated || !token) {
            navigate('/login');
            return;
        }
        
        try {
            await api.delete('/cart/clear', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            setCart({ items: [], total: 0 });
        } catch (error) {
            console.error('Clear cart error:', error);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
                navigate('/login');
            } else {
                setError('Failed to clear cart. Please try again.');
            }
        }
    };

    const handleQuantityChange = async (partNo, newQty) => {
        if (newQty < 1 || !isAuthenticated || !token) return;
        
        try {
            // Optimistic UI update
            setCart(prev => {
                const updatedItems = prev.items.map(item => 
                    item["part no"] === partNo ? { ...item, quantity: newQty } : item
                );
                
                return {
                    items: updatedItems,
                    total: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
                };
            });
            
            await api.put('/cart/update', {
                partNo,
                quantity: newQty
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            // Final sync with server
            await fetchCart();
        } catch (error) {
            console.error('Quantity update error:', error);
            // Revert optimistic update on error
            await fetchCart();
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
                navigate('/login');
            } else {
                setError('Failed to update quantity. Please try again.');
            }
        }
    };

    const handleSubmitOrder = async () => {
        if (!isAuthenticated || !token) {
            alert('Please log in to place an order');
            navigate('/login');
            return;
        }

        if (cart.items.length === 0) {
            alert('Your cart is empty');
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const response = await api.post('/orders', {
                items: cart.items,
                total: cart.total
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setOrderConfirmed(true);
            setCart({ items: [], total: 0 });
            
            // Optional: Show success notification
            console.log('Order submitted successfully:', response.data);
        } catch (error) {
            console.error('Order submission error:', error);
            
            if (error.response?.status === 401 || error.response?.status === 403) {
                logout();
                navigate('/login');
            } else {
                setError(error.response?.data?.message || 
                        'Failed to submit order. Please try again later.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageError = (partNo) => {
        setImageErrors(prev => ({
            ...prev,
            [partNo]: true
        }));
    };

    const getImageSrc = (item) => {
        const partNo = item["part no"] || item.partNo;
        
        // If this image has already failed, return placeholder
        if (imageErrors[partNo]) {
            return '/assets/placeholder.jpg';
        }
        
        let imgSrc = item["image path"] || '/assets/placeholder.jpg';
        
        // Fix image path if it doesn't start with /
        if (imgSrc && !imgSrc.startsWith('/')) {
            imgSrc = '/data/stackofill assets/' + imgSrc.replace(/^assets\//, '');
        }
        
        return imgSrc;
    };

    if (isCartLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your cart...</p>
                    </div>
                </main>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-white flex flex-col">
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-gray-600">Please log in to view your cart.</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Go to Login
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-8 lg:px-16 mt-12 mb-12">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Your Shopping Cart</h1>
                    {user && (
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-600">Welcome, {user.name || user.email}</span>
                            <button
                                onClick={() => logout()}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span>{error}</span>
                            <button 
                                onClick={() => setError(null)}
                                className="ml-4 text-sm underline text-red-800 hover:text-red-900"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {cart.items.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🛒</div>
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">
                            {orderConfirmed ? 'Order Confirmed!' : 'Your Cart is Empty'}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {orderConfirmed 
                                ? 'Thank you for your purchase. A confirmation has been sent to your email.' 
                                : 'Browse our products to add items to your cart.'}
                        </p>
                        <button
                            onClick={() => navigate('/products')}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            {orderConfirmed ? 'Continue Shopping' : 'Start Shopping'}
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="mb-6 flex justify-between items-center">
                            <h2 className="text-lg font-semibold text-gray-700">
                                {cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'} in Cart
                            </h2>
                            <button
                                onClick={clearCart}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition-colors text-sm"
                            >
                                Clear Entire Cart
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {cart.items.map((item) => {
                                const partNo = item["part no"] || item.partNo;
                                const imgSrc = getImageSrc(item);
                                
                                return (
                                    <div key={partNo} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                                        <div className="p-4 flex flex-col h-full">
                                            <div className="flex justify-center mb-4 bg-gray-50 rounded-lg p-4">
                                                <img
                                                    src={imgSrc}
                                                    alt={item.description}
                                                    className="h-32 w-32 object-contain"
                                                    onError={() => handleImageError(partNo)}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-gray-800 mb-1 line-clamp-2">
                                                    {item.description}
                                                </h3>
                                                <p className="text-sm text-gray-500 mb-2">Part No: {partNo}</p>

                                            </div>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div className="flex items-center border border-gray-300 rounded-lg">
                                                    <button
                                                        className="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 disabled:opacity-50 rounded-l-lg"
                                                        onClick={() => handleQuantityChange(partNo, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </button>
                                                    <span className="px-3 text-center w-10 bg-white">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        className="w-8 h-8 bg-gray-100 text-gray-600 flex items-center justify-center hover:bg-gray-200 rounded-r-lg"
                                                        onClick={() => handleQuantityChange(partNo, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(partNo)}
                                                    className="text-red-500 hover:text-red-700 text-sm font-medium ml-2"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>



                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleSubmitOrder}
                                disabled={isLoading || orderConfirmed}
                                className={`w-full md:w-auto px-8 py-3 rounded-lg text-lg font-semibold transition-colors ${
                                    isLoading || orderConfirmed
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-green-600 text-white hover:bg-green-700'
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Processing...
                                    </span>
                                ) : orderConfirmed ? (
                                    'Order Confirmed!'
                                ) : (
                                    'Proceed to Checkout'
                                )}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default CartPage;