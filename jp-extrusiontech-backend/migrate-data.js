// Migration script to convert JSON data to MongoDB
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/database');

// Import Models
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Cart = require('./models/Cart');

// File paths for JSON storage
const USERS_FILE = path.join(__dirname, 'users.json');
const ORDERS_FILE = path.join(__dirname, 'orders.json');
const CART_SESSIONS_FILE = path.join(__dirname, 'cart-sessions.json');
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

async function migrateData() {
    try {
        console.log('Starting data migration...');
        
        // Connect to MongoDB
        await connectDB();
        
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await Cart.deleteMany({});
        
        console.log('Cleared existing data');
        
        // Migrate Users
        if (fs.existsSync(USERS_FILE)) {
            const usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            for (const userData of usersData) {
                const user = new User({
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role || 'user',
                    createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
                    updatedAt: new Date()
                });
                await user.save();
            }
            console.log(`Migrated ${usersData.length} users`);
        }
        
        // Migrate Products
        if (fs.existsSync(PRODUCTS_FILE)) {
            const productsData = JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
            for (const productData of productsData) {
                const product = new Product({
                    partNo: productData['part no'],
                    description: productData.description,
                    imagePath: productData['image path'] || '/images/default.jpg',
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
                await product.save();
            }
            console.log(`Migrated ${productsData.length} products`);
        }
        
        // Migrate Orders
        if (fs.existsSync(ORDERS_FILE)) {
            const ordersData = JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
            for (const orderData of ordersData) {
                // Find the user for this order
                const user = await User.findOne({ email: orderData.userEmail });
                if (!user) {
                    console.log(`User not found for order: ${orderData.id}, skipping...`);
                    continue;
                }
                
                const order = new Order({
                    userId: user._id,
                    userEmail: orderData.userEmail,
                    customerName: orderData.customerName || user.name,
                    customerEmail: orderData.customerEmail || orderData.userEmail,
                    items: orderData.items.map(item => ({
                        partNo: item['part no'] || item.partNo,
                        description: item.description,
                        imagePath: item['image path'] || item.imagePath,
                        quantity: item.quantity
                    })),
                    status: orderData.status || 'pending',
                    total: orderData.total || 0,
                    createdAt: orderData.createdAt ? new Date(orderData.createdAt) : new Date(),
                    updatedAt: new Date()
                });
                await order.save();
            }
            console.log(`Migrated ${ordersData.length} orders`);
        }
        
        // Migrate Cart Sessions
        if (fs.existsSync(CART_SESSIONS_FILE)) {
            const cartSessionsData = JSON.parse(fs.readFileSync(CART_SESSIONS_FILE, 'utf8'));
            for (const [userId, cartData] of Object.entries(cartSessionsData)) {
                // Find the user for this cart
                const user = await User.findById(userId);
                if (!user) {
                    console.log(`User not found for cart: ${userId}, skipping...`);
                    continue;
                }
                
                const cart = new Cart({
                    userId: user._id,
                    items: cartData.items.map(item => ({
                        partNo: item['part no'] || item.partNo,
                        description: item.description,
                        imagePath: item['image path'] || item.imagePath,
                        quantity: item.quantity
                    })),
                    total: cartData.total || 0,
                    updatedAt: new Date()
                });
                await cart.save();
            }
            console.log(`Migrated ${Object.keys(cartSessionsData).length} cart sessions`);
        }
        
        console.log('Migration completed successfully!');
        process.exit(0);
        
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

// Run migration
migrateData(); 