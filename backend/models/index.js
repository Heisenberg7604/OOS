import { sequelize } from '../database/connection.js';
import { User } from './User.js';
import { Product } from './Product.js';
import { UserProduct } from './UserProduct.js';
import { Order } from './Order.js';

// Define associations
// User.hasMany(Product, { foreignKey: 'createdBy', as: 'createdProducts' });
// Product.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// Many-to-many relationship: Users can have multiple products, products can be assigned to multiple users
User.belongsToMany(Product, {
  through: UserProduct,
  foreignKey: 'userId',
  otherKey: 'productId',
  as: 'assignedProducts'
});
Product.belongsToMany(User, {
  through: UserProduct,
  foreignKey: 'productId',
  otherKey: 'userId',
  as: 'assignedUsers'
});

// One-to-many relationship: User has many Orders
User.hasMany(Order, { 
  foreignKey: 'userId',
  as: 'orders'
});
Order.belongsTo(User, { 
  foreignKey: 'userId',
  as: 'user'
});

// Export models and sequelize
export {
  sequelize,
  User,
  Product,
  UserProduct,
  Order
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Check if tables already exist
    const [results] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = DATABASE() 
      AND table_name IN ('users', 'products', 'user_products')
    `);

    const tableCount = results[0]?.count || 0;

    if (tableCount >= 3) {
      console.log('ℹ️  Database tables already exist. Skipping sync to avoid conflicts.');
    } else {
      // Sync models - only create tables if they don't exist, don't alter existing ones
      try {
        await sequelize.sync({ alter: false });
        console.log('✅ Database models synchronized successfully.');
      } catch (syncError) {
        // If it's a key constraint error, tables likely already exist with correct structure
        if (syncError.code === 'ER_TOO_MANY_KEYS' || syncError.errno === 1069) {
          console.log('ℹ️  Tables already exist with constraints. Skipping sync.');
        } else {
          // Re-throw other errors
          throw syncError;
        }
      }
    }

    // Create default admin user if it doesn't exist
    await createDefaultAdmin();

    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({
      where: { email: 'admin@jpextrusiontech.com' }
    });

    if (!adminExists) {
      await User.create({
        name: 'Admin User',
        email: 'admin@jpextrusiontech.com',
        password: 'admin123',
        role: 'admin',
        isActive: true
      });
      console.log('✅ Default admin user created successfully.');
    } else {
      console.log('ℹ️  Admin user already exists.');
    }
  } catch (error) {
    console.error('❌ Failed to create default admin user:', error);
  }
};

export default {
  sequelize,
  User,
  Product,
  UserProduct,
  Order,
  initializeDatabase
};
