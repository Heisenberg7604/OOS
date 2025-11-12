import { sequelize } from '../database/connection.js';
import { User } from './User.js';
import { Product } from './Product.js';
import { UserProduct } from './UserProduct.js';

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

// Export models and sequelize
export {
  sequelize,
  User,
  Product,
  UserProduct
};

// Initialize database
export const initializeDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized successfully.');

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
  initializeDatabase
};





