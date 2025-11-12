import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { Op } from 'sequelize';
import { Product, UserProduct } from '../models/index.js';
import { authenticateToken, requireAdmin, requireUser, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all products (public endpoint, but filters by user assignments for regular users)
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('Limit must be between 1 and 50000'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('sortBy').optional().isIn(['partNumber', 'description', 'createdAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'partNumber', 
      sortOrder = 'asc' 
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { partNumber: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // If user is authenticated and not admin, filter by assigned products only
    // Unauthenticated users see all products (public browsing)
    // Admins see all products
    if (req.user && req.user.role !== 'admin') {
      const assignedProductIds = await UserProduct.findAll({
        where: { userId: req.user.id },
        attributes: ['productId']
      });
      
      const productIds = assignedProductIds.map(up => up.productId);
      
      if (productIds.length === 0) {
        // User has no assigned products, return empty result
        return res.json({
          success: true,
          data: {
            products: [],
            pagination: {
              currentPage: parseInt(page),
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: parseInt(limit),
              hasNext: false,
              hasPrev: false
            }
          }
        });
      }
      
      // Add product ID filter
      whereClause.id = {
        [Op.in]: productIds
      };
    }
    // If req.user is null (unauthenticated), show all products (public access)

    // Map camelCase sortBy to snake_case database column names
    const sortFieldMap = {
      'partNumber': 'part_number',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at'
    };
    const dbSortBy = sortFieldMap[sortBy] || sortBy;

    // Get products with pagination - explicitly include image field
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [[dbSortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset),
      attributes: ['id', 'partNumber', 'description', 'image', 'category', 'createdAt', 'updatedAt']
    });

    // Debug: Log first product to check image field
    if (products.length > 0) {
      console.log(`📦 First product fetched - Image: ${products[0].image || '(null/empty)'}`);
      console.log(`📦 First product data: ${JSON.stringify({ id: products[0].id, partNumber: products[0].partNumber, image: products[0].image })}`);
    }

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNext: offset + products.length < count,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products'
    });
  }
});

// Get product by ID (public endpoint)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findOne({
      where: { 
        id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product'
    });
  }
});

// Search products (public endpoint)
router.get('/search/:query', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { query } = req.params;
    const { limit = 20 } = req.query;

    const products = await Product.findAll({
      where: {
        [Op.or]: [
          { partNumber: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      },
      order: [['partNumber', 'ASC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        products,
        total: products.length,
        query
      }
    });

  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products'
    });
  }
});

// Get product statistics (admin only)
router.get('/admin/statistics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalProducts = await Product.count();

    res.json({
      success: true,
      data: {
        total: totalProducts
      }
    });

  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving statistics'
    });
  }
});

// Get all products for admin (with additional data)
router.get('/admin/all', authenticateToken, requireAdmin, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isLength({ min: 1 }).withMessage('Search term cannot be empty'),
  query('sortBy').optional().isIn(['partNumber', 'description', 'createdAt', 'updatedAt']).withMessage('Invalid sort field'),
  query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Sort order must be asc or desc')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      page = 1, 
      limit = 20, 
      search, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { partNumber: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get products with pagination
    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNext: offset + products.length < count,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving products'
    });
  }
});

// Update product (admin only)
router.put('/admin/:id', authenticateToken, requireAdmin, [
  body('partNumber').optional().isLength({ min: 1 }).withMessage('Part number cannot be empty'),
  body('description').optional().isLength({ min: 1 }).withMessage('Description cannot be empty'),
  body('image').optional().isLength({ min: 1 }).withMessage('Image cannot be empty')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const updates = req.body;

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if part number is being changed and if it already exists
    if (updates.partNumber && updates.partNumber !== product.partNumber) {
      const existingProduct = await Product.findOne({ 
        where: { partNumber: updates.partNumber } 
      });

      if (existingProduct) {
        return res.status(409).json({
          success: false,
          message: 'Product with this part number already exists'
        });
      }
    }

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;
    delete updates.importDate;
    delete updates.lastImportSource;

    // Update product
    await product.update(updates);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product'
    });
  }
});

// Delete product (admin only)
router.delete('/admin/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Find product
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete product
    await product.destroy();

    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: {
        id: product.id,
        partNumber: product.partNumber,
        description: product.description
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product'
    });
  }
});

// Bulk update products (admin only)
router.put('/admin/bulk', authenticateToken, requireAdmin, [
  body('productIds').isArray({ min: 1 }).withMessage('Product IDs array is required'),
  body('updates').isObject().withMessage('Updates object is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productIds, updates } = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates.id;
    delete updates.createdAt;

    const results = [];
    const bulkErrors = [];

    for (const id of productIds) {
      try {
        const product = await Product.findByPk(id);
        if (product) {
          await product.update(updates);
          results.push(product);
        } else {
          bulkErrors.push({ id, error: 'Product not found' });
        }
      } catch (error) {
        bulkErrors.push({ id, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk update completed. ${results.length} products updated, ${bulkErrors.length} failed.`,
      data: {
        updated: results,
        errors: bulkErrors
      }
    });

  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({
      success: false,
      message: 'Error performing bulk update'
    });
  }
});

// Get product by part number (admin only)
router.get('/admin/part/:partNumber', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { partNumber } = req.params;
    
    const product = await Product.findOne({
      where: { partNumber }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Get product by part number error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving product'
    });
  }
});

// Create new product (admin only)
router.post('/admin', authenticateToken, requireAdmin, [
  body('partNumber').isLength({ min: 1 }).withMessage('Part number is required'),
  body('description').isLength({ min: 1 }).withMessage('Description is required'),
  body('image').optional().isLength({ min: 1 }).withMessage('Image cannot be empty')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const productData = req.body;

    // Check if product with same part number already exists
    const existingProduct = await Product.findOne({
      where: { partNumber: productData.partNumber }
    });

    if (existingProduct) {
      return res.status(409).json({
        success: false,
        message: 'Product with this part number already exists'
      });
    }

    // Create new product
    const product = await Product.create({
      partNumber: productData.partNumber,
      description: productData.description,
      image: productData.image || null
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product'
    });
  }
});

export default router;
