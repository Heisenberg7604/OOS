import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminPanel = () => {
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [error, setError] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState('');
    const [uploadError, setUploadError] = useState('');
    const [sooData, setSooData] = useState(null);
    const [sooLoading, setSooLoading] = useState(false);
    const [assigningProducts, setAssigningProducts] = useState(new Set());
    const [sooSearchTerm, setSooSearchTerm] = useState('');

    const API_BASE_URL = 'https://spares.jpel.in/api';

    // Get auth token from localStorage
    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    // Get auth headers for API calls
    const getAuthHeaders = () => {
        const token = getAuthToken();
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    };

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            setError('No authentication token found. Please login.');
            setLoading(false);
            return;
        }

        // Load real data from APIs
        loadDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load users
            const usersResponse = await fetch(`${API_BASE_URL}/users`, {
                headers: getAuthHeaders()
            });
            const usersResult = await usersResponse.json();
            if (usersResult.success) {
                setUsers(usersResult.data.users || []);
            }

            // Load product statistics
            const statsResponse = await fetch(`${API_BASE_URL}/products/admin/statistics`, {
                headers: getAuthHeaders()
            });
            const statsResult = await statsResponse.json();
            
            // Load orders
            const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
                headers: getAuthHeaders()
            });
            const ordersResult = await ordersResponse.json();
            
            if (ordersResult.success) {
                const ordersData = ordersResult.data.orders || [];
                setOrders(ordersData);
                
                // Calculate order statistics
                const totalOrders = ordersData.length;
                const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
                const completedOrders = ordersData.filter(o => o.status === 'completed').length;
                
                if (statsResult.success) {
                    const productStats = statsResult.data;
                    setStats({
                        totalOrders,
                        pendingOrders,
                        completedOrders,
                        totalUsers: usersResult.success ? usersResult.data.users.length : 0,
                        totalProducts: productStats.total || 0
                    });
                }
            } else {
                // If orders fetch fails, set empty orders
                setOrders([]);
                if (statsResult.success) {
                    const productStats = statsResult.data;
                    setStats({
                        totalOrders: 0,
                        pendingOrders: 0,
                        completedOrders: 0,
                        totalUsers: usersResult.success ? usersResult.data.users.length : 0,
                        totalProducts: productStats.total || 0
                    });
                }
            }

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            setError('Failed to load dashboard data');
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: getAuthHeaders(),
                body: JSON.stringify({ status: newStatus })
            });

            const result = await response.json();
            
            if (result.success) {
                // Update local orders state
                setOrders(prev => prev.map(order =>
                    order.id === orderId ? { ...order, status: newStatus } : order
                ));

                // Reload dashboard data to update stats
                loadDashboardData();
            } else {
                setError(result.message || 'Failed to update order status');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            setError('Failed to update order status');
        }
    };

    const deleteOrder = async (orderId) => {
        if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
            try {
                // Note: You may want to add a DELETE endpoint in the backend
                // For now, we'll just update the status to cancelled
                await updateOrderStatus(orderId, 'cancelled');
            } catch (error) {
                console.error('Error deleting order:', error);
                setError('Failed to delete order');
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'processing': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const chartData = [
        { name: 'Total Orders', value: stats.totalOrders || 0 },
        { name: 'Pending', value: stats.pendingOrders || 0 },
        { name: 'Completed', value: stats.completedOrders || 0 },
        { name: 'Total Users', value: stats.totalUsers || 0 },
        { name: 'Total Products', value: stats.totalProducts || 0 }
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = [
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'text/csv'
            ];

            // Check file type
            if (!allowedTypes.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
                setUploadError('Please select a valid Excel file (.xlsx, .xls) or CSV file');
                setUploadFile(null);
                event.target.value = '';
                return;
            }

            // Check file size (100MB = 104857600 bytes)
            const maxSize = 100 * 1024 * 1024; // 100MB
            if (file.size > maxSize) {
                const fileSizeMB = (file.size / 1024 / 1024).toFixed(2);
                setUploadError(`File is too large (${fileSizeMB} MB). Maximum size is 100MB.`);
                setUploadFile(null);
                event.target.value = '';
                return;
            }

            setUploadFile(file);
            setUploadError('');
        }
    };

    const handleFileUpload = async () => {
        if (!uploadFile) {
            setUploadError('Please select a file first');
            return;
        }

        setUploadLoading(true);
        setUploadError('');
        setUploadSuccess('');

        try {
            const token = getAuthToken();
            if (!token) {
                setUploadError('Please login first');
                setUploadLoading(false);
                return;
            }

            const formData = new FormData();
            formData.append('file', uploadFile);
            
            // Test if backend is reachable first
            try {
                const healthCheckResponse = await fetch('https://spares.jpel.in/api/health');
                if (!healthCheckResponse.ok) {
                    throw new Error('Backend server is not responding');
                }
            } catch (healthError) {
                const errorMsg = healthError.message.includes('Failed to fetch') || healthError.message.includes('NetworkError')
                    ? 'Cannot connect to backend server. Make sure it\'s running on port 5001 and check the browser console for CORS errors.'
                    : healthError.message;
                throw new Error(errorMsg);
            }
            
            const response = await fetch(`${API_BASE_URL}/upload/excel`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Don't set Content-Type header - let browser set it with boundary for FormData
                }
            });

            // Check if response is ok
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorMessage;
                } catch {
                    // If response is not JSON, use status text
                    errorMessage = response.statusText || errorMessage;
                }
                throw new Error(errorMessage);
            }

            const result = await response.json();

            if (result.success) {
                const { summary } = result.data;
                const skipped = summary.skippedProducts || 0;
                let successMessage = `File "${uploadFile.name}" uploaded successfully!\n`;
                successMessage += `Total rows: ${summary.totalRows || 0}\n`;
                successMessage += `Valid products: ${summary.validProducts || 0}\n`;
                successMessage += `✅ Added: ${summary.addedProducts || 0}\n`;
                successMessage += `🔄 Updated: ${summary.updatedProducts || 0}\n`;
                if (skipped > 0) {
                    successMessage += `⚠️ Skipped: ${skipped} (check server logs for details)`;
                }
                
                setUploadSuccess(successMessage);
                setUploadFile(null);

                // Reset file input
                const fileInput = document.getElementById('excel-upload');
                if (fileInput) fileInput.value = '';

                // Update stats
                setStats(prev => ({
                    ...prev,
                    totalProducts: prev.totalProducts + (summary.addedProducts || 0)
                }));

                // Reload dashboard data to refresh stats
                loadDashboardData();
            } else {
                setUploadError(result.message || 'Failed to upload file');
            }

        } catch (error) {
            console.error('Upload error:', error);
            setUploadError(error.message || 'Failed to upload file. Please check your connection and try again.');
        } finally {
            setUploadLoading(false);
        }
    };

    const clearUploadMessages = () => {
        setUploadSuccess('');
        setUploadError('');
    };

    const loadSooData = async () => {
        try {
            setSooLoading(true);
            setError('');
            console.log('🔍 Frontend: Loading SOO data...');
            const response = await fetch(`${API_BASE_URL}/user-products/soo`, {
                headers: getAuthHeaders()
            });
            
            console.log('🔍 Frontend: Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 Frontend: Error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('🔍 Frontend: SOO result:', result);
            
            if (result.success) {
                console.log('🔍 Frontend: SOO data loaded successfully:', {
                    users: result.data?.users?.length || 0,
                    products: result.data?.totalProducts || 0,
                    categories: result.data?.allCategories?.length || 0
                });
                setSooData(result.data);
            } else {
                const errorMsg = result.message || 'Failed to load SOO data';
                console.error('🔍 Frontend: SOO error:', errorMsg);
                setError(errorMsg);
            }
        } catch (error) {
            console.error('❌ Frontend: Error loading SOO data:', error);
            setError(`Failed to load SOO data: ${error.message}`);
        } finally {
            setSooLoading(false);
        }
    };

    const toggleCategoryAssignment = async (userId, category, isAssigned) => {
        const assignmentKey = `${userId}-${category}`;
        setAssigningProducts(prev => new Set(prev).add(assignmentKey));
        
        try {
            const response = await fetch(`${API_BASE_URL}/user-products/soo/assign-category`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    userId,
                    category,
                    assign: !isAssigned
                })
            });
            
            const result = await response.json();
            if (result.success) {
                // Reload SOO data
                await loadSooData();
            } else {
                setError(result.message || 'Failed to update category assignment');
            }
        } catch (error) {
            console.error('Error updating category assignment:', error);
            setError('Failed to update category assignment');
        } finally {
            setAssigningProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(assignmentKey);
                return newSet;
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
                    <p className="font-bold">Error:</p>
                    <p>{error}</p>
                    <button
                        onClick={() => window.location.href = '/login'}
                        className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Professional Header */}
            <div className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6">
                        <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                                <p className="text-sm text-gray-500">JP Extrusiontech Management Portal</p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <button
                                onClick={() => setActiveTab('dashboard')}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'dashboard'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Dashboard
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'orders'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Orders
                            </button>
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'upload'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload Excel
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('soo');
                                    loadSooData();
                                }}
                                className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'soo'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                    }`}
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                SOO
                            </button>
                            <button
                                onClick={() => window.location.href = '/admin/users'}
                                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                </svg>
                                Users
                            </button>
                            <button
                                onClick={() => window.location.href = '/admin/create-user'}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                </svg>
                                Create User
                            </button>
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium shadow-sm"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        {/* Admin Notice */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">
                                        Single Admin System
                                    </h3>
                                    <div className="mt-2 text-sm text-blue-700">
                                        <p>This system is configured for single admin access. Only one admin account is allowed.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Professional Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Total Orders</div>
                                        <div className="text-3xl font-bold text-gray-900">{stats.totalOrders || 0}</div>
                                        <div className="text-xs text-green-600 mt-1">+12% from last month</div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Pending Orders</div>
                                        <div className="text-3xl font-bold text-gray-900">{stats.pendingOrders || 0}</div>
                                        <div className="text-xs text-yellow-600 mt-1">Needs attention</div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Completed</div>
                                        <div className="text-3xl font-bold text-gray-900">{stats.completedOrders || 0}</div>
                                        <div className="text-xs text-green-600 mt-1">+8% this week</div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Total Users</div>
                                        <div className="text-3xl font-bold text-gray-900">{stats.totalUsers || 0}</div>
                                        <div className="text-xs text-blue-600 mt-1">Active customers</div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-medium text-gray-500 mb-1">Products</div>
                                        <div className="text-3xl font-bold text-gray-900">{stats.totalProducts || 0}</div>
                                        <div className="text-xs text-indigo-600 mt-1">In catalog</div>
                                    </div>
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Professional Quick Actions */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                                    <p className="text-sm text-gray-500 mt-1">Manage your system efficiently</p>
                                </div>
                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <button
                                    onClick={() => window.location.href = '/admin/users'}
                                    className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl hover:from-purple-100 hover:to-purple-200 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                        </svg>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <div className="text-sm font-semibold text-purple-900">User Management</div>
                                        <div className="text-xs text-purple-600 mt-1">Manage customers</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => window.location.href = '/admin/create-user'}
                                    className="group flex flex-col items-center p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl hover:from-green-100 hover:to-green-200 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <div className="text-sm font-semibold text-green-900">Create User</div>
                                        <div className="text-xs text-green-600 mt-1">Add new customer</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('orders')}
                                    className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl hover:from-blue-100 hover:to-blue-200 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <div className="text-sm font-semibold text-blue-900">Order Management</div>
                                        <div className="text-xs text-blue-600 mt-1">View all orders</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className="group flex flex-col items-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl hover:from-orange-100 hover:to-orange-200 hover:shadow-md transition-all duration-200"
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-200">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div className="mt-4 text-center">
                                        <div className="text-sm font-semibold text-orange-900">Upload Excel</div>
                                        <div className="text-xs text-orange-600 mt-1">Import products</div>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Professional Chart */}
                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">System Analytics</h3>
                                    <p className="text-sm text-gray-500 mt-1">Overview of key metrics</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                    <span className="text-xs text-gray-500">Current Period</span>
                                </div>
                            </div>
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis 
                                        dataKey="name" 
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        axisLine={{ stroke: '#e5e7eb' }}
                                    />
                                    <Tooltip 
                                        contentStyle={{
                                            backgroundColor: '#1f2937',
                                            border: 'none',
                                            borderRadius: '8px',
                                            color: '#fff'
                                        }}
                                    />
                                    <Bar 
                                        dataKey="value" 
                                        fill="url(#colorGradient)"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <defs>
                                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#1d4ed8" />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Recent Orders */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Order ID
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Customer
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Items Count
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Date
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {orders.slice(0, 5).map((order) => (
                                            <tr key={order.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {order.id.substring(0, 8)}...
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{order.customerName || order.user?.name || 'N/A'}</div>
                                                    <div className="text-sm text-gray-500">{order.customerEmail || order.user?.email || 'N/A'}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {Array.isArray(order.items) ? order.items.length : 0} items
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {new Date(order.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">All Orders</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {order.id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{order.customerName || order.user?.name || 'N/A'}</div>
                                                <div className="text-sm text-gray-500">{order.customerEmail || order.user?.email || 'N/A'}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900">
                                                    {Array.isArray(order.items) ? order.items.map((item, index) => (
                                                        <div key={index} className="mb-1">
                                                            <span className="font-medium">{item.partNo}</span>: {item.description} (Qty: {item.quantity})
                                                        </div>
                                                    )) : 'No items'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="mr-2 px-2 py-1 border rounded text-sm"
                                                >
                                                    <option value="pending">Pending</option>
                                                    <option value="processing">Processing</option>
                                                    <option value="completed">Completed</option>
                                                    <option value="cancelled">Cancelled</option>
                                                </select>
                                                <button
                                                    onClick={() => deleteOrder(order.id)}
                                                    className="text-red-600 hover:text-red-900 ml-2"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'upload' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-medium text-gray-900">Upload Excel File</h3>
                                <p className="text-sm text-gray-600 mt-1">
                                    Upload an Excel file (.xlsx, .xls) or CSV file to import product data
                                </p>
                            </div>

                            <div className="p-6">
                                {/* Upload Messages */}
                                {uploadSuccess && (
                                    <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span>{uploadSuccess}</span>
                                            <button
                                                onClick={clearUploadMessages}
                                                className="ml-4 text-sm underline text-green-800 hover:text-green-900"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {uploadError && (
                                    <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span>{uploadError}</span>
                                            <button
                                                onClick={clearUploadMessages}
                                                className="ml-4 text-sm underline text-red-800 hover:text-red-900"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* File Upload Section */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Excel File
                                        </label>
                                        <input
                                            id="excel-upload"
                                            type="file"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileSelect}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Supported formats: .xlsx, .xls, .csv (Max size: 100MB)
                                        </p>
                                    </div>

                                    {uploadFile && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">Selected File:</p>
                                                    <p className="text-sm text-gray-600">{uploadFile.name}</p>
                                                    <p className="text-xs text-gray-500">
                                                        Size: {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        setUploadFile(null);
                                                        document.getElementById('excel-upload').value = '';
                                                    }}
                                                    className="text-red-600 hover:text-red-800 text-sm"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex space-x-4">
                                        <button
                                            onClick={handleFileUpload}
                                            disabled={!uploadFile || uploadLoading}
                                            className={`px-6 py-2 rounded-lg font-semibold ${!uploadFile || uploadLoading
                                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                                }`}
                                        >
                                            {uploadLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Uploading...
                                                </span>
                                            ) : (
                                                'Upload File'
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Instructions */}
                                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Excel File Format Instructions:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Column A: Part No (required)</li>
                                        <li>• Column B: Part Image (optional - URL or file path)</li>
                                        <li>• Column C: DESCRIPTION (required)</li>
                                        <li>• First row should contain headers</li>
                                        <li>• Maximum 1000 rows per upload</li>
                                        <li>• Images can be URLs or file paths</li>
                                    </ul>
                                </div>

                                {/* Sample Template Download */}
                                <div className="mt-4">
                                    <button
                                        onClick={async () => {
                                            try {
                                                const response = await fetch(`${API_BASE_URL}/upload/template`);
                                                if (response.ok) {
                                                    const blob = await response.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = 'product_template.csv';
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                } else {
                                                    setUploadError('Failed to download template');
                                                }
                                            } catch (error) {
                                                console.error('Template download error:', error);
                                                setUploadError('Failed to download template');
                                            }
                                        }}
                                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                                    >
                                        Download Sample Template
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'soo' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">SOO - Product Assignment</h3>
                                        <p className="text-sm text-gray-600 mt-1">
                                            Assign products to users. Only checked products will be visible to each user.
                                        </p>
                                    </div>
                                    <div className="flex-1 sm:max-w-md">
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="Search by customer name or company name..."
                                                value={sooSearchTerm}
                                                onChange={(e) => setSooSearchTerm(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                            />
                                            {sooSearchTerm && (
                                                <button
                                                    onClick={() => setSooSearchTerm('')}
                                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                >
                                                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6">
                                {sooLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    </div>
                                ) : sooData ? (
                                    <div className="space-y-8">
                                        {(() => {
                                            // Filter users based on search term (frontend-only filtering)
                                            const filteredUsers = sooData.users && sooData.users.length > 0 
                                                ? sooData.users.filter((user) => {
                                                    if (!sooSearchTerm.trim()) return true;
                                                    
                                                    const searchLower = sooSearchTerm.toLowerCase().trim();
                                                    const userName = (user.name || '').toLowerCase();
                                                    const userEmail = (user.email || '').toLowerCase();
                                                    
                                                    // Search by customer name (user.name) or company name (if available)
                                                    // For now, searching by name and email since companyName/customerName aren't in DB yet
                                                    return userName.includes(searchLower) || 
                                                           userEmail.includes(searchLower);
                                                })
                                                : [];
                                            
                                            return filteredUsers.length > 0 ? (
                                                filteredUsers.map((user) => (
                                            <div key={user.id} className="border border-gray-200 rounded-lg p-6">
                                                <div className="mb-4 pb-4 border-b border-gray-200">
                                                    <h4 className="text-lg font-semibold text-gray-900">{user.name}</h4>
                                                    <p className="text-sm text-gray-600">{user.email}</p>
                                                </div>
                                                
                                                {sooData.allCategories && sooData.allCategories.length > 0 ? (
                                                    <div className="space-y-4">
                                                        {sooData.allCategories.map((category) => {
                                                            const categoryData = user.categoriesWithStatus?.[category];
                                                            if (!categoryData || categoryData.totalCount === 0) return null;
                                                            
                                                            const assignmentKey = `${user.id}-${category}`;
                                                            const isAssigning = assigningProducts.has(assignmentKey);
                                                            const isChecked = categoryData.isFullyAssigned;
                                                            
                                                            return (
                                                                <div 
                                                                    key={category} 
                                                                    className={`border rounded-lg p-4 transition-all ${
                                                                        isChecked 
                                                                            ? 'bg-green-50 border-green-300' 
                                                                            : categoryData.isPartiallyAssigned
                                                                            ? 'bg-yellow-50 border-yellow-300'
                                                                            : 'bg-gray-50 border-gray-200'
                                                                    }`}
                                                                >
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center flex-1">
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isChecked}
                                                                                onChange={() => toggleCategoryAssignment(user.id, category, isChecked)}
                                                                                disabled={isAssigning}
                                                                                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                                                            />
                                                                            <label className="ml-3 flex-1 cursor-pointer">
                                                                                <div className="text-lg font-semibold text-gray-900">
                                                                                    {category}
                                                                                </div>
                                                                                <div className="text-sm text-gray-600 mt-1">
                                                                                    {categoryData.assignedCount} of {categoryData.totalCount} products assigned
                                                                                    {categoryData.isPartiallyAssigned && (
                                                                                        <span className="ml-2 text-yellow-600">(Partial)</span>
                                                                                    )}
                                                                                </div>
                                                                            </label>
                                                                        </div>
                                                                        {isAssigning && (
                                                                            <div className="ml-4">
                                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p className="text-sm text-gray-500 text-center py-4">
                                                        No products available. Upload products first.
                                                    </p>
                                                )}
                                            </div>
                                                ))
                                            ) : sooSearchTerm ? (
                                                <div className="text-center py-12 border border-gray-200 rounded-lg p-8">
                                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                                    </svg>
                                                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        No users match "{sooSearchTerm}". Try a different search term.
                                                    </p>
                                                    <button
                                                        onClick={() => setSooSearchTerm('')}
                                                        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        Clear search
                                                    </button>
                                                </div>
                                            ) : (
                                            <div className="text-center py-12 border border-gray-200 rounded-lg p-8">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                                </svg>
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                                                <p className="mt-1 text-sm text-gray-500">Create users first to assign products to them.</p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={() => window.location.href = '/admin/create-user'}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        Create User
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                        })()}
                                        
                                        {sooSearchTerm && sooData.users && sooData.users.length > 0 && (
                                            <div className="text-sm text-gray-600 text-center py-2 border-t border-gray-200 pt-4">
                                                Showing {(() => {
                                                    const filtered = sooData.users.filter((user) => {
                                                        if (!sooSearchTerm.trim()) return true;
                                                        const searchLower = sooSearchTerm.toLowerCase().trim();
                                                        const userName = (user.name || '').toLowerCase();
                                                        const userEmail = (user.email || '').toLowerCase();
                                                        return userName.includes(searchLower) || userEmail.includes(searchLower);
                                                    });
                                                    return filtered.length;
                                                })()} of {sooData.users.length} users
                                            </div>
                                        )}
                                        
                                        {sooData.totalProducts === 0 && sooData.users && sooData.users.length > 0 && (
                                            <div className="text-center py-8 border border-yellow-200 rounded-lg p-6 bg-yellow-50">
                                                <svg className="mx-auto h-10 w-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                                </svg>
                                                <h3 className="mt-2 text-sm font-medium text-yellow-800">No products found</h3>
                                                <p className="mt-1 text-sm text-yellow-700">Upload products first using the Upload Excel tab.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500">Failed to load SOO data. Check the browser console for details.</p>
                                        {error && (
                                            <p className="mt-2 text-sm text-red-600">{error}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="px-6 py-4 border-b">
                            <h3 className="text-lg font-medium text-gray-900">All Users</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Note: Only one admin account is allowed in the system. Additional admin accounts cannot be created.
                            </p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Name
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Email
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created At
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {user._id.substring(0, 8)}...
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {user.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminPanel;