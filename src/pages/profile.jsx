import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import heroImg from '../assets/hero.png';

const Profile = () => {
    const { user, isAuthenticated, getMyOrders } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('profile');

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        const loadOrders = async () => {
            try {
                const result = await getMyOrders();
                if (result.success) {
                    setOrders(result.orders);
                }
            } catch (error) {
                console.error('Failed to load orders:', error);
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [isAuthenticated, navigate, getMyOrders]);

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center space-x-6">
                        <img
                            src={heroImg}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                            onError={(e) => {
                                e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Ccircle cx='48' cy='48' r='48' fill='%23f3f4f6'/%3E%3Ctext x='48' y='58' text-anchor='middle' fill='%236b7280' font-family='Arial' font-size='24'%3E👤%3C/text%3E%3C/svg%3E";
                            }}
                        />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Welcome, {user?.name || user?.email}
                            </h1>
                            <p className="text-gray-600">
                                {user?.role === 'admin' ? 'Administrator' : 'Customer'} Account
                            </p>
                        </div>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('profile')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'profile'
                                        ? 'border-red-500 text-red-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Profile Information
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === 'orders'
                                        ? 'border-red-500 text-red-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                Order History
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Name
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                                                {user?.name || 'Not provided'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                                                {user?.email || 'Not provided'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Role
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                                                {user?.role === 'admin' ? 'Administrator' : 'Customer'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Customer ID
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                                                {user?.id || 'Not assigned'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Member Since
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3 text-gray-900">
                                                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Not available'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Account Status
                                            </label>
                                            <div className="bg-gray-50 rounded-lg px-4 py-3">
                                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Order History</h3>
                                {loading ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                                        <p className="mt-2 text-gray-600">Loading orders...</p>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-8">
                                        <div className="text-gray-400 text-4xl mb-4">📦</div>
                                        <h4 className="text-lg font-medium text-gray-600 mb-2">No orders yet</h4>
                                        <p className="text-gray-500 mb-4">Start shopping to see your orders here</p>
                                        <button
                                            onClick={() => navigate('/products')}
                                            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                                        >
                                            Browse Products
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">Order #{order.id}</h4>
                                                        <p className="text-sm text-gray-600">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                        order.status === 'completed' 
                                                            ? 'bg-green-100 text-green-800'
                                                            : order.status === 'pending'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="space-y-2">
                                                    {order.items.map((item, index) => (
                                                        <div key={index} className="flex justify-between text-sm">
                                                            <span className="text-gray-600">
                                                                {item.partNo} - {item.description}
                                                            </span>
                                                            <span className="text-gray-900">
                                                                Qty: {item.quantity} × ${item.price}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <div className="flex justify-between font-medium">
                                                        <span>Total:</span>
                                                        <span>${order.total}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
