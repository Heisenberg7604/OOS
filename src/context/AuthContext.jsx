import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(null);
  const [cart, setCart] = useState({ items: [], total: 0 });

  // Mock API functions for frontend-only operation
  const api = {
    get: async (url) => ({ data: [] }),
    post: async (url, data) => ({ data: { success: true } }),
    put: async (url, data) => ({ data: { success: true } }),
    delete: async (url) => ({ data: { success: true } })
  };

  const checkAuth = async () => {
    try {
      // Check localStorage for existing session
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
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
        } catch (err) {
          console.error('Failed to parse stored user data:', err);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('cart');
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
  }, []);

  useEffect(() => {
    checkAuth();
  }, [token]);

  const register = async (name, email, password, role = 'user') => {
    try {
      // Create mock user data
      const mockUser = {
        id: Date.now().toString(),
        name,
        email,
        role,
        createdAt: new Date().toISOString()
      };

      const mockToken = 'mock-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);

      return { success: true, user: mockUser };
    } catch (err) {
      console.error('Registration failed:', err);
      return {
        success: false,
        message: 'Registration failed'
      };
    }
  };

  const login = async (email, password) => {
    try {
      // Mock login - accept any email/password combination
      const mockUser = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        role: email.includes('admin') ? 'admin' : 'user',
        createdAt: new Date().toISOString()
      };

      const mockToken = 'mock-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);

      return { success: true, user: mockUser };
    } catch (err) {
      console.error('Login failed:', err);
      return {
        success: false,
        message: 'Login failed'
      };
    }
  };

  // Admin login function for the navbar
  const loginAsAdmin = async (username, password) => {
    try {
      // Mock admin login - accept any username/password
      const mockUser = {
        id: Date.now().toString(),
        name: username,
        email: username + '@admin.com',
        role: 'admin',
        isAdmin: true,
        createdAt: new Date().toISOString()
      };

      const mockToken = 'mock-admin-token-' + Date.now();

      // Store in localStorage
      localStorage.setItem('token', mockToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      setToken(mockToken);
      setUser(mockUser);
      setIsAuthenticated(true);

      return true;
    } catch (err) {
      console.error('Admin login failed:', err);
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