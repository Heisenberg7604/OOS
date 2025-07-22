import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });

  // Initialize axios
  const api = axios.create({
    baseURL: 'http://localhost:5001/api',
  });

  // Add auth token to requests
  api.interceptors.request.use(config => {
    const currentToken = token || localStorage.getItem('token');
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }
    return config;
  });

  // Response interceptor to handle token expiration
  api.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Token expired or invalid
        logout();
      }
      return Promise.reject(error);
    }
  );

  const checkAuth = async () => {
    try {
      // Get token from localStorage as fallback
      const currentToken = token || localStorage.getItem('token');
      
      if (!currentToken) {
        setLoading(false);
        return;
      }

      // Update token in state if it was retrieved from localStorage
      if (!token && currentToken) {
        setToken(currentToken);
      }

      const response = await api.get('/auth/me');
      setUser(response.data);
      setIsAuthenticated(true);
      
      // Load user's cart
      await loadCart();
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      const currentToken = token || localStorage.getItem('token');
      if (!currentToken) return;
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (err) {
      console.error('Failed to load cart:', err);
      setCart({ items: [], total: 0 });
    }
  };

  // On initial load, check localStorage for a token
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken && !token) {
      setToken(storedToken);
    } else if (!storedToken) {
      // If no token in localStorage, set loading to false
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [token]);

  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error('Registration failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      setToken(response.data.token);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      return { success: true, user: response.data.user };
    } catch (err) {
      console.error('Login failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Login failed' 
      };
    }
  };

  // Admin login function for the navbar
  const loginAsAdmin = async (username, password) => {
    try {
      // Try to login with admin credentials
      const response = await api.post('/auth/login', { email: username, password });
      
      // Check if the user has admin role
      if (response.data.user && response.data.user.role === 'admin') {
        setToken(response.data.token);
        localStorage.setItem('token', response.data.token);
        setUser({ ...response.data.user, isAdmin: true });
        setIsAuthenticated(true);
        return true;
      } else {
        return false; // Not an admin
      }
    } catch (err) {
      console.error('Admin login failed:', err);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    setCart({ items: [], total: 0 });
  };

  // Cart functions
  const addToCart = async (partNo, quantity = 1) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to add items to cart');
      }
      
      const response = await api.post('/cart/add', { partNo, quantity });
      setCart(response.data);
      return { success: true };
    } catch (err) {
      console.error('Add to cart failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to add to cart' 
      };
    }
  };

  const updateCartItem = async (partNo, quantity) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to update cart');
      }
      
      const response = await api.put('/cart/update', { partNo, quantity });
      setCart(response.data);
      return { success: true };
    } catch (err) {
      console.error('Update cart failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to update cart' 
      };
    }
  };

  const removeFromCart = async (partNo) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to remove items from cart');
      }
      
      const response = await api.delete(`/cart/remove/${partNo}`);
      setCart(response.data);
      return { success: true };
    } catch (err) {
      console.error('Remove from cart failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to remove from cart' 
      };
    }
  };

  const clearCart = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to clear cart');
      }
      
      await api.delete('/cart/clear');
      setCart({ items: [], total: 0 });
      return { success: true };
    } catch (err) {
      console.error('Clear cart failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to clear cart' 
      };
    }
  };

  const submitOrder = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to submit order');
      }
      
      const response = await api.post('/orders');
      setCart({ items: [], total: 0 }); // Clear cart after successful order
      return { success: true, order: response.data };
    } catch (err) {
      console.error('Order submission failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to submit order' 
      };
    }
  };

  const getMyOrders = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to view orders');
      }
      
      const response = await api.get('/orders/my');
      return { success: true, orders: response.data };
    } catch (err) {
      console.error('Get orders failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to get orders' 
      };
    }
  };

  // Product functions
  const getProducts = async () => {
    try {
      const response = await api.get('/products');
      return { success: true, products: response.data };
    } catch (err) {
      console.error('Get products failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to get products' 
      };
    }
  };

  const searchProducts = async (query) => {
    try {
      const response = await api.get(`/products/search/${query}`);
      return { success: true, products: response.data };
    } catch (err) {
      console.error('Search products failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to search products' 
      };
    }
  };

  const getProduct = async (partNo) => {
    try {
      const response = await api.get(`/products/${partNo}`);
      return { success: true, product: response.data };
    } catch (err) {
      console.error('Get product failed:', err);
      return { 
        success: false, 
        message: err.response?.data?.message || 'Failed to get product' 
      };
    }
  };

  // Check if user can access cart (must be logged in)
  const canAccessCart = () => {
    return isAuthenticated;
  };

  // Check if user is admin
  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      loading,
      isAuthenticated,
      setIsAuthenticated,
      token,
      cart,
      register,
      login,
      loginAsAdmin,
      logout,
      api,
      // Cart functions
      addToCart,
      updateCartItem,
      removeFromCart,
      clearCart,
      submitOrder,
      getMyOrders,
      // Product functions
      getProducts,
      searchProducts,
      getProduct,
      // Utility functions
      canAccessCart,
      isAdmin,
      loadCart
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the AuthContext if you need to use it directly
export { AuthContext };

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};