import express from 'express';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User, Product, UserProduct } from '../models/index.js';
import { authenticateToken, requireAdmin, requireUser } from '../middleware/auth.js';

const router = express.Router();

// Get all users with their assigned products grouped by category (Admin only)
router.get('/soo', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('🔍 SOO: Fetching users and products...');
    
    // Get all users (excluding admin)
    const users = await User.findAll({
      where: {
        role: 'user',
        isActive: true
      },
      attributes: ['id', 'name', 'email', 'createdAt'],
      order: [['name', 'ASC']]
    });
    console.log(`🔍 SOO: Found ${users.length} users`);

    // Get all products grouped by category
    const products = await Product.findAll({
      attributes: ['id', 'partNumber', 'description', 'category', 'image'],
      order: [['category', 'ASC'], ['partNumber', 'ASC']]
    });
    console.log(`🔍 SOO: Found ${products.length} products`);

    // Get all user-product assignments
    const assignments = await UserProduct.findAll({
      attributes: ['userId', 'productId']
    });
    console.log(`🔍 SOO: Found ${assignments.length} assignments`);

    // Create a map of userId -> Set of productIds
    const userProductMap = new Map();
    assignments.forEach(assignment => {
      if (!userProductMap.has(assignment.userId)) {
        userProductMap.set(assignment.userId, new Set());
      }
      userProductMap.get(assignment.userId).add(assignment.productId);
    });

    // Group products by category
    const productsByCategory = {};
    products.forEach(product => {
      const category = product.category || 'General';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push({
        id: product.id,
        partNumber: product.partNumber,
        description: product.description,
        image: product.image
      });
    });

    // Build response with users and their assigned products
    const usersWithProducts = users.map(user => {
      const assignedProductIds = userProductMap.get(user.id) || new Set();
      const categoriesWithStatus = {};

      // For each category, calculate if all products are assigned
      Object.keys(productsByCategory).forEach(category => {
        const categoryProducts = productsByCategory[category];
        const assignedCount = categoryProducts.filter(p => assignedProductIds.has(p.id)).length;
        const totalCount = categoryProducts.length;
        
        categoriesWithStatus[category] = {
          isFullyAssigned: assignedCount === totalCount && totalCount > 0,
          isPartiallyAssigned: assignedCount > 0 && assignedCount < totalCount,
          assignedCount,
          totalCount,
          products: categoryProducts.map(product => ({
            ...product,
            isAssigned: assignedProductIds.has(product.id)
          }))
        };
      });

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        categoriesWithStatus
      };
    });

    const responseData = {
      users: usersWithProducts,
      allCategories: Object.keys(productsByCategory).sort(),
      totalUsers: users.length,
      totalProducts: products.length
    };
    
    console.log(`🔍 SOO: Returning data - ${responseData.users.length} users, ${responseData.totalProducts} products, ${responseData.allCategories.length} categories`);
    
    res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('❌ Error fetching SOO data:', error);
    console.error('❌ Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch SOO data',
      error: error.message
    });
  }
});

// Assign/Unassign product to user (Admin only)
router.post('/soo/assign', authenticateToken, requireAdmin, [
  body('userId').isUUID().withMessage('Valid userId is required'),
  body('productId').isUUID().withMessage('Valid productId is required'),
  body('assign').isBoolean().withMessage('assign must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, productId, assign } = req.body;

    // Verify user and product exist
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (assign) {
      // Assign product to user (create if doesn't exist)
      const [assignment, created] = await UserProduct.findOrCreate({
        where: {
          userId,
          productId
        },
        defaults: {
          userId,
          productId
        }
      });

      res.json({
        success: true,
        message: created ? 'Product assigned to user' : 'Product already assigned',
        data: { assignment }
      });
    } else {
      // Unassign product from user
      const deleted = await UserProduct.destroy({
        where: {
          userId,
          productId
        }
      });

      res.json({
        success: true,
        message: deleted ? 'Product unassigned from user' : 'Product was not assigned',
        data: { deleted: deleted > 0 }
      });
    }
  } catch (error) {
    console.error('Error assigning product:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign/unassign product',
      error: error.message
    });
  }
});

// Assign/Unassign all products in a category to user (Admin only)
router.post('/soo/assign-category', authenticateToken, requireAdmin, [
  body('userId').isUUID().withMessage('Valid userId is required'),
  body('category').isString().withMessage('Valid category name is required'),
  body('assign').isBoolean().withMessage('assign must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, category, assign } = req.body;

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get all products in this category
    const products = await Product.findAll({
      where: {
        category: category
      },
      attributes: ['id']
    });

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found in category: ${category}`
      });
    }

    const productIds = products.map(p => p.id);

    if (assign) {
      // Bulk assign all products in category
      const assignments = productIds.map(productId => ({
        userId,
        productId
      }));

      await UserProduct.bulkCreate(assignments, {
        ignoreDuplicates: true
      });

      res.json({
        success: true,
        message: `Assigned ${productIds.length} products from category "${category}" to user`,
        data: { assigned: productIds.length, category }
      });
    } else {
      // Bulk unassign all products in category
      const deleted = await UserProduct.destroy({
        where: {
          userId,
          productId: {
            [Op.in]: productIds
          }
        }
      });

      res.json({
        success: true,
        message: `Unassigned ${deleted} products from category "${category}" from user`,
        data: { unassigned: deleted, category }
      });
    }
  } catch (error) {
    console.error('Error assigning category:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign/unassign category',
      error: error.message
    });
  }
});

// Bulk assign/unassign products to user (Admin only)
router.post('/soo/bulk-assign', authenticateToken, requireAdmin, [
  body('userId').isUUID().withMessage('Valid userId is required'),
  body('productIds').isArray().withMessage('productIds must be an array'),
  body('assign').isBoolean().withMessage('assign must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, productIds, assign } = req.body;

    // Verify user exists
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (assign) {
      // Bulk assign products
      const assignments = productIds.map(productId => ({
        userId,
        productId
      }));

      // Use bulkCreate with ignoreDuplicates to handle existing assignments
      await UserProduct.bulkCreate(assignments, {
        ignoreDuplicates: true
      });

      res.json({
        success: true,
        message: `Assigned ${productIds.length} products to user`,
        data: { assigned: productIds.length }
      });
    } else {
      // Bulk unassign products
      const deleted = await UserProduct.destroy({
        where: {
          userId,
          productId: {
            [Op.in]: productIds
          }
        }
      });

      res.json({
        success: true,
        message: `Unassigned ${deleted} products from user`,
        data: { unassigned: deleted }
      });
    }
  } catch (error) {
    console.error('Error bulk assigning products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk assign/unassign products',
      error: error.message
    });
  }
});

// Get user's assigned products (for regular users)
router.get('/my-products', authenticateToken, requireUser, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all products assigned to this user using the association
    const user = await User.findByPk(userId, {
      include: [{
        model: Product,
        as: 'assignedProducts',
        attributes: ['id', 'partNumber', 'description', 'image', 'category'],
        through: {
          attributes: []
        }
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Group by category
    const productsByCategory = {};
    const assignedProducts = user.assignedProducts || [];
    assignedProducts.forEach(product => {
      const category = product.category || 'General';
      if (!productsByCategory[category]) {
        productsByCategory[category] = [];
      }
      productsByCategory[category].push({
        id: product.id,
        partNumber: product.partNumber,
        description: product.description,
        image: product.image,
        category: product.category
      });
    });

    res.json({
      success: true,
      data: {
        productsByCategory,
        totalProducts: userProducts.length
      }
    });
  } catch (error) {
    console.error('Error fetching user products:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user products',
      error: error.message
    });
  }
});

export default router;

