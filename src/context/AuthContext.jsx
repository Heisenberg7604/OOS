import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });

  // API base URL
  const API_BASE_URL = 'http://localhost:5001/api';

  const checkAuth = async () => {
    try {
      // Check localStorage for existing session
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // Verify token with backend
          const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`,
              'Content-Type': 'application/json',
            },
          });

          const result = await response.json();

          if (result.success) {
            const userData = result.data.user;
            setUser(userData);
            setToken(storedToken);
            setIsAuthenticated(true);

            // Load cart from localStorage
            const storedCart = localStorage.getItem('cart');
            if (storedCart) {
              try {
                const parsedCart = JSON.parse(storedCart);
                setCart({
                  items: parsedCart.items || [],
                  total: parsedCart.total || 0
                });
              } catch (err) {
                console.error('Failed to parse stored cart:', err);
                setCart({ items: [], total: 0 });
              }
            } else {
              setCart({ items: [], total: 0 });
            }
          } else {
            // Token is invalid, clear storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            setCart({ items: [], total: 0 });
          }
        } catch (err) {
          console.error('Token verification failed:', err);
          // Clear invalid token
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
          setCart({ items: [], total: 0 });
        }
      } else {
        setUser(null);
        setToken(null);
        setIsAuthenticated(false);
        setCart({ items: [], total: 0 });
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    // Load cart from localStorage
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        // Ensure the cart has proper structure
        setCart({
          items: parsedCart.items || [],
          total: parsedCart.total || 0
        });
      } catch (err) {
        console.error('Failed to parse stored cart:', err);
        setCart({ items: [], total: 0 });
      }
    } else {
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
  }, [token]);

  useEffect(() => {
    checkAuth();
  }, [token]);

  const register = async (name, email, password, role = 'user') => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const result = await response.json();

      if (result.success) {
        const { token, user } = result.data;
        
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

        return { success: true, user, token };
      } else {
        return { success: false, message: result.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Network error. Please check if backend is running.' };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (result.success) {
        const { token, user } = result.data;
        
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

        return { success: true, user, token };
      } else {
        return { success: false, message: result.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Network error. Please check if backend is running.' };
    }
  };

  // Admin login function for the navbar
  const loginAsAdmin = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: username, password }),
      });

      const result = await response.json();

      if (result.success) {
        const { token, user } = result.data;
        
        setUser(user);
        setToken(token);
        setIsAuthenticated(true);

        // Store in localStorage
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);

        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cart');
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

      // Mock product data
      const mockProduct = {
        partNo,
        description: `Product ${partNo}`,
        price: Math.floor(Math.random() * 100) + 10,
        quantity
      };

      // Update cart state
      setCart(prev => {
        // Ensure prev has proper structure
        const currentCart = prev || { items: [], total: 0 };
        const currentItems = currentCart.items || [];

        const existingItem = currentItems.find(item => item.partNo === partNo);
        let newItems;

        if (existingItem) {
          newItems = currentItems.map(item =>
            item.partNo === partNo
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          newItems = [...currentItems, mockProduct];
        }

        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newCart = { items: newItems, total: newTotal };

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));

        return newCart;
      });

      return { success: true };
    } catch (err) {
      console.error('Add to cart failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to add to cart'
      };
    }
  };

  const updateCartItem = async (partNo, quantity) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to update cart');
      }

      setCart(prev => {
        // Ensure prev has proper structure
        const currentCart = prev || { items: [], total: 0 };
        const currentItems = currentCart.items || [];

        const newItems = currentItems.map(item =>
          item.partNo === partNo ? { ...item, quantity } : item
        );
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newCart = { items: newItems, total: newTotal };

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));

        return newCart;
      });

      return { success: true };
    } catch (err) {
      console.error('Update cart failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to update cart'
      };
    }
  };

  const removeFromCart = async (partNo) => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to remove items from cart');
      }

      setCart(prev => {
        // Ensure prev has proper structure
        const currentCart = prev || { items: [], total: 0 };
        const currentItems = currentCart.items || [];

        const newItems = currentItems.filter(item => item.partNo !== partNo);
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newCart = { items: newItems, total: newTotal };

        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(newCart));

        return newCart;
      });

      return { success: true };
    } catch (err) {
      console.error('Remove from cart failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to remove from cart'
      };
    }
  };

  const clearCart = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to clear cart');
      }

      setCart({ items: [], total: 0 });
      localStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));

      return { success: true };
    } catch (err) {
      console.error('Clear cart failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to clear cart'
      };
    }
  };

  const submitOrder = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to submit order');
      }

      // Mock order submission
      const mockOrder = {
        id: 'order-' + Date.now(),
        items: cart.items,
        total: cart.total,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Clear cart after successful order
      setCart({ items: [], total: 0 });
      localStorage.setItem('cart', JSON.stringify({ items: [], total: 0 }));

      return { success: true, order: mockOrder };
    } catch (err) {
      console.error('Order submission failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to submit order'
      };
    }
  };

  const getMyOrders = async () => {
    try {
      if (!isAuthenticated) {
        throw new Error('Please login to view orders');
      }

      // Return mock orders
      const mockOrders = [
        {
          id: 'order-1',
          items: [{ partNo: 'PART001', description: 'Sample Part 1', quantity: 2, price: 50 }],
          total: 100,
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 'order-2',
          items: [{ partNo: 'PART002', description: 'Sample Part 2', quantity: 1, price: 75 }],
          total: 75,
          status: 'pending',
          createdAt: new Date(Date.now() - 172800000).toISOString()
        }
      ];

      return { success: true, orders: mockOrders };
    } catch (err) {
      console.error('Get orders failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to get orders'
      };
    }
  };

  // Product functions
  const getProducts = async () => {
    try {
      // Return mock products
      const mockProducts = [
        { partNo: 'PART001', description: 'Sample Product 1', price: 50 },
        { partNo: 'PART002', description: 'Sample Product 2', price: 75 },
        { partNo: 'PART003', description: 'Sample Product 3', price: 100 }
      ];

      return { success: true, products: mockProducts };
    } catch (err) {
      console.error('Get products failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to get products'
      };
    }
  };

  const searchProducts = async (query) => {
    try {
      // Mock search - return filtered products
      const mockProducts = [
        { partNo: 'PART001', description: 'Sample Product 1', price: 50 },
        { partNo: 'PART002', description: 'Sample Product 2', price: 75 },
        { partNo: 'PART003', description: 'Sample Product 3', price: 100 }
      ];

      const filteredProducts = mockProducts.filter(product =>
        product.partNo.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase())
      );

      return { success: true, products: filteredProducts };
    } catch (err) {
      console.error('Search products failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to search products'
      };
    }
  };

  const getProduct = async (partNo) => {
    try {
      // Return mock product
      const mockProduct = {
        partNo,
        description: `Product ${partNo}`,
        price: Math.floor(Math.random() * 100) + 10
      };

      return { success: true, product: mockProduct };
    } catch (err) {
      console.error('Get product failed:', err);
      return {
        success: false,
        message: err.message || 'Failed to get product'
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