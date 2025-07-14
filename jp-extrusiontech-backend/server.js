// MongoDB Backend Server (server.js)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const connectDB = require('./config/database');

// Import Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
}));
app.use(bodyParser.json());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here-change-in-production';

// Email configuration (optional)
let transporter = null;
try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASS || 'your-email-password'
        }
    });
} catch (error) {
    console.warn('Email configuration not set up properly');
}

// JWT Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Admin access required' });
    }
    next();
};

// Initialize default admin user if not exists
async function initializeDefaultAdmin() {
    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (!adminExists) {
            const defaultAdmin = new User({
                name: 'Admin',
                email: 'admin@jpextrusiontech.com',
                password: bcrypt.hashSync('admin123', 10),
                role: 'admin'
            });
            await defaultAdmin.save();
            console.log('Default admin user created - email: admin@jpextrusiontech.com, password: admin123');
        }
    } catch (error) {
        console.error('Error initializing admin:', error);
    }
}

// Auth Routes
// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Prevent admin registration through public endpoint
        if (role === 'admin') {
            return res.status(403).json({ message: 'Admin registration is not allowed through this endpoint' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user (always as 'user' role)
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: 'user' // Force user role
        });

        await user.save();

        // Initialize empty cart for new user
        const cart = new Cart({
            userId: user._id,
            items: [],
            total: 0
        });
        await cart.save();

        // Create token
        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, {
            expiresIn: '24h'
        });

        // Don't send password back
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json({ user: userResponse, token });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Initialize cart if doesn't exist
        let cart = await Cart.findOne({ userId: user._id });
        if (!cart) {
            cart = new Cart({
                userId: user._id,
                items: [],
                total: 0
            });
            await cart.save();
        }

        const token = jwt.sign({
            id: user._id,
            email: user.email,
            role: user.role
        }, JWT_SECRET, {
            expiresIn: '24h'
        });

        // Don't send password back
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        console.log('Login successful for user:', userResponse.email);
        res.json({ user: userResponse, token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
});

// Get current user
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ message: 'Failed to get user' });
    }
});

// Product Routes
// Get all products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        console.log('Fetching all products, count:', products.length);
        res.json(products);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ message: 'Failed to fetch products' });
    }
});

// Get product by part no
app.get('/api/products/:partNo', async (req, res) => {
    try {
        const product = await Product.findOne({ partNo: req.params.partNo });
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ message: 'Failed to fetch product' });
    }
});

// Search products
app.get('/api/products/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const filteredProducts = await Product.find({
            $or: [
                { partNo: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(filteredProducts);
    } catch (err) {
        console.error('Search products error:', err);
        res.status(500).json({ message: 'Failed to search products' });
    }
});

// Admin Product Routes
// Add new product
app.post('/api/products', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { partNo, description, imagePath } = req.body;

        if (!partNo || !description) {
            return res.status(400).json({ message: 'Part number and description are required' });
        }

        // Check if product already exists
        const existingProduct = await Product.findOne({ partNo });
        if (existingProduct) {
            return res.status(400).json({ message: 'Product already exists' });
        }

        const product = new Product({
            partNo,
            description,
            imagePath: imagePath || '/images/default.jpg'
        });

        await product.save();
        console.log('Product added:', product);
        res.status(201).json(product);
    } catch (err) {
        console.error('Add product error:', err);
        res.status(500).json({ message: 'Failed to add product' });
    }
});

// Update product
app.put('/api/products/:partNo', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { partNo } = req.params;
        const { description, imagePath } = req.body;

        const product = await Product.findOneAndUpdate(
            { partNo },
            {
                description,
                imagePath,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json(product);
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ message: 'Failed to update product' });
    }
});

// Delete product
app.delete('/api/products/:partNo', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { partNo } = req.params;
        const product = await Product.findOneAndDelete({ partNo });

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ message: 'Failed to delete product' });
    }
});

// Cart Routes (Protected)
// Get user's cart
app.get('/api/cart', authenticateToken, async (req, res) => {
    try {
        let cart = await Cart.findOne({ userId: req.user.id });

        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                items: [],
                total: 0
            });
            await cart.save();
        }

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        await cart.save();

        console.log('Fetching cart for user:', req.user.id, 'cart:', cart);
        res.json(cart);
    } catch (err) {
        console.error('Get cart error:', err);
        res.status(500).json({ message: 'Failed to get cart' });
    }
});

// Add to cart
app.post('/api/cart/add', authenticateToken, async (req, res) => {
    try {
        const { partNo, quantity } = req.body;

        if (!partNo || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Valid part number and quantity are required' });
        }

        const product = await Product.findOne({ partNo });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        let cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            cart = new Cart({
                userId: req.user.id,
                items: [],
                total: 0
            });
        }

        const existingItem = cart.items.find(item => item.partNo === partNo);

        if (existingItem) {
            existingItem.quantity += parseInt(quantity);
        } else {
            cart.items.push({
                partNo: product.partNo,
                description: product.description,
                imagePath: product.imagePath,
                quantity: parseInt(quantity)
            });
        }

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.updatedAt = new Date();

        await cart.save();

        console.log('Added to cart for user:', req.user.id, 'cart:', cart);
        res.json(cart);
    } catch (err) {
        console.error('Add to cart error:', err);
        res.status(500).json({ message: 'Failed to add to cart' });
    }
});

// Update cart item quantity
app.put('/api/cart/update', authenticateToken, async (req, res) => {
    try {
        const { partNo, quantity } = req.body;

        if (!partNo || !quantity || quantity <= 0) {
            return res.status(400).json({ message: 'Valid part number and quantity are required' });
        }

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.partNo === partNo);

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.items[itemIndex].quantity = parseInt(quantity);

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.updatedAt = new Date();

        await cart.save();

        console.log('Updated cart for user:', req.user.id, 'cart:', cart);
        res.json(cart);
    } catch (err) {
        console.error('Update cart error:', err);
        res.status(500).json({ message: 'Failed to update cart' });
    }
});

// Remove from cart
app.delete('/api/cart/remove/:partNo', authenticateToken, async (req, res) => {
    try {
        const { partNo } = req.params;

        const cart = await Cart.findOne({ userId: req.user.id });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter(item => item.partNo !== partNo);

        if (cart.items.length === initialLength) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        // Calculate total
        cart.total = cart.items.reduce((sum, item) => sum + item.quantity, 0);
        cart.updatedAt = new Date();

        await cart.save();

        console.log('Removed from cart for user:', req.user.id, 'cart:', cart);
        res.json(cart);
    } catch (err) {
        console.error('Remove from cart error:', err);
        res.status(500).json({ message: 'Failed to remove from cart' });
    }
});

// Clear cart
app.delete('/api/cart/clear', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });
        if (cart) {
            cart.items = [];
            cart.total = 0;
            cart.updatedAt = new Date();
            await cart.save();
        }

        console.log('Cleared cart for user:', req.user.id);
        res.json({ message: 'Cart cleared successfully' });
    } catch (err) {
        console.error('Clear cart error:', err);
        res.status(500).json({ message: 'Failed to clear cart' });
    }
});

// Order Routes (Protected)
// Place order
app.post('/api/orders', authenticateToken, async (req, res) => {
    try {
        const cart = await Cart.findOne({ userId: req.user.id });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const order = new Order({
            userId: req.user.id,
            userEmail: req.user.email,
            customerName: user.name,
            customerEmail: user.email,
            items: cart.items,
            status: 'pending',
            total: cart.total
        });

        await order.save();

        // Clear user's cart
        cart.items = [];
        cart.total = 0;
        cart.updatedAt = new Date();
        await cart.save();

        console.log('Order placed:', order);

        // Send confirmation email if transporter is configured
        if (transporter) {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: req.user.email,
                subject: 'Order Confirmation',
                html: `
                    <h2>Order Confirmation</h2>
                    <p>Thank you for your order! Your order ID is: <strong>${order._id}</strong></p>
                    <h3>Items:</h3>
                    <ul>
                        ${order.items.map(item => `
                            <li>${item.description} (Part No: ${item.partNo}) - Quantity: ${item.quantity}</li>
                        `).join('')}
                    </ul>
                    <p>Total items: ${order.total}</p>
                `
            };

            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.error('Email sending error:', error);
                } else {
                    console.log('Email sent:', info.response);
                }
            });
        }

        res.status(201).json(order);
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ message: 'Failed to place order' });
    }
});

// Get user's orders
app.get('/api/orders', authenticateToken, async (req, res) => {
    try {
        const userOrders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(userOrders);
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ message: 'Failed to get orders' });
    }
});

// Admin Routes
// Get all orders (admin only)
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const orders = await Order.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Get all orders error:', err);
        res.status(500).json({ message: 'Failed to get orders' });
    }
});

// Get all users (admin only)
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        console.error('Get all users error:', err);
        res.status(500).json({ message: 'Failed to get users' });
    }
});

// Get admin stats (admin only)
app.get('/api/admin/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const totalOrders = await Order.countDocuments();
        const pendingOrders = await Order.countDocuments({ status: 'pending' });
        const completedOrders = await Order.countDocuments({ status: 'completed' });
        const totalUsers = await User.countDocuments();
        const totalProducts = await Product.countDocuments();

        const stats = {
            totalOrders,
            pendingOrders,
            completedOrders,
            totalUsers,
            totalProducts
        };

        res.json(stats);
    } catch (err) {
        console.error('Get stats error:', err);
        res.status(500).json({ message: 'Failed to get stats' });
    }
});

// Update order status (admin only)
app.put('/api/admin/orders/:orderId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        const order = await Order.findByIdAndUpdate(
            orderId,
            {
                status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(order);
    } catch (err) {
        console.error('Update order error:', err);
        res.status(500).json({ message: 'Failed to update order' });
    }
});

// Delete order (admin only)
app.delete('/api/admin/orders/:orderId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await Order.findByIdAndDelete(orderId);

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json({ message: 'Order deleted successfully' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ message: 'Failed to delete order' });
    }
});

// Create additional admin user (admin only)
app.post('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Enforce single admin rule
        if (role === 'admin') {
            const adminExists = await User.findOne({ role: 'admin' });
            if (adminExists) {
                return res.status(400).json({ message: 'Only one admin account is allowed. Admin already exists.' });
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        await user.save();

        // Initialize empty cart for new user
        const cart = new Cart({
            userId: user._id,
            items: [],
            total: 0
        });
        await cart.save();

        // Don't send password back
        const userResponse = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        res.status(201).json(userResponse);
    } catch (err) {
        console.error('Create user error:', err);
        res.status(500).json({ message: 'Failed to create user' });
    }
});

// Delete user (admin only)
app.delete('/api/admin/users/:userId', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Also remove user's cart and orders
        await Cart.findOneAndDelete({ userId });
        await Order.deleteMany({ userId });

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ message: 'Failed to delete user' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Initialize data and start server
initializeDefaultAdmin();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Available routes:`);
    console.log(`- GET /api/products`);
    console.log(`- GET /api/products/:partNo`);
    console.log(`- GET /api/products/search/:query`);
    console.log(`- POST /api/auth/register`);
    console.log(`- POST /api/auth/login`);
    console.log(`- GET /api/auth/me`);
    console.log(`- GET /api/cart`);
    console.log(`- POST /api/cart/add`);
    console.log(`- PUT /api/cart/update`);
    console.log(`- DELETE /api/cart/remove/:partNo`);
    console.log(`- DELETE /api/cart/clear`);
    console.log(`- POST /api/orders`);
    console.log(`- GET /api/orders`);
    console.log(`- Admin routes: /api/admin/*`);
    console.log(`- Default admin: admin@jpextrusiontech.com / admin123`);
});