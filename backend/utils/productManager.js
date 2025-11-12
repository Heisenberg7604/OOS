import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class ProductManager {
  constructor() {
    this.dataDir = path.join(__dirname, '..', 'data');
    this.productsFile = path.join(this.dataDir, 'products.json');
    this.ensureDataDirectory();
  }

  /**
   * Ensure data directory exists
   */
  ensureDataDirectory() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * Load products from JSON file
   * @returns {Array} Array of products
   */
  loadProducts() {
    try {
      if (!fs.existsSync(this.productsFile)) {
        return [];
      }
      
      const data = fs.readFileSync(this.productsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error loading products:', error);
      return [];
    }
  }

  /**
   * Save products to JSON file
   * @param {Array} products - Array of products
   * @returns {boolean} Success status
   */
  saveProducts(products) {
    try {
      const data = JSON.stringify(products, null, 2);
      fs.writeFileSync(this.productsFile, data, 'utf8');
      return true;
    } catch (error) {
      console.error('Error saving products:', error);
      return false;
    }
  }

  /**
   * Add new products from Excel import
   * @param {Array} newProducts - Array of new products
   * @param {string} fileName - Source file name
   * @returns {Object} Import result
   */
  importProducts(newProducts, fileName) {
    try {
      const existingProducts = this.loadProducts();
      const existingPartNumbers = new Set(existingProducts.map(p => p.partNumber.toLowerCase()));
      
      const addedProducts = [];
      const updatedProducts = [];
      const skippedProducts = [];
      
      for (const newProduct of newProducts) {
        const existingIndex = existingProducts.findIndex(
          p => p.partNumber.toLowerCase() === newProduct.partNumber.toLowerCase()
        );
        
        if (existingIndex !== -1) {
          // Update existing product
          const existingProduct = existingProducts[existingIndex];
          const updatedProduct = {
            ...existingProduct,
            ...newProduct,
            id: existingProduct.id, // Keep original ID
            updatedAt: new Date().toISOString(),
            lastImportSource: fileName
          };
          
          existingProducts[existingIndex] = updatedProduct;
          updatedProducts.push(updatedProduct);
        } else {
          // Add new product
          const productWithImportInfo = {
            ...newProduct,
            lastImportSource: fileName,
            importDate: new Date().toISOString()
          };
          
          existingProducts.push(productWithImportInfo);
          addedProducts.push(productWithImportInfo);
        }
      }
      
      // Save updated products
      const saveSuccess = this.saveProducts(existingProducts);
      
      if (!saveSuccess) {
        throw new Error('Failed to save products to file');
      }
      
      return {
        success: true,
        data: {
          total: newProducts.length,
          added: addedProducts.length,
          updated: updatedProducts.length,
          skipped: skippedProducts.length,
          addedProducts,
          updatedProducts,
          skippedProducts
        }
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get all products with optional filtering
   * @param {Object} filters - Filter options
   * @returns {Array} Filtered products
   */
  getAllProducts(filters = {}) {
    try {
      let products = this.loadProducts();
      
      // Apply filters
      if (filters.category) {
        products = products.filter(p => 
          p.category.toLowerCase().includes(filters.category.toLowerCase())
        );
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        products = products.filter(p => 
          p.partNumber.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.brand.toLowerCase().includes(searchTerm)
        );
      }
      
      if (filters.isActive !== undefined) {
        products = products.filter(p => p.isActive === filters.isActive);
      }
      
      // Sort products
      if (filters.sortBy) {
        products.sort((a, b) => {
          const aVal = a[filters.sortBy];
          const bVal = b[filters.sortBy];
          
          if (filters.sortOrder === 'desc') {
            return bVal > aVal ? 1 : -1;
          }
          return aVal > bVal ? 1 : -1;
        });
      }
      
      return products;
      
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  /**
   * Get product by ID
   * @param {string} id - Product ID
   * @returns {Object|null} Product object or null
   */
  getProductById(id) {
    try {
      const products = this.loadProducts();
      return products.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  /**
   * Get product by part number
   * @param {string} partNumber - Part number
   * @returns {Object|null} Product object or null
   */
  getProductByPartNumber(partNumber) {
    try {
      const products = this.loadProducts();
      return products.find(p => 
        p.partNumber.toLowerCase() === partNumber.toLowerCase()
      ) || null;
    } catch (error) {
      console.error('Error getting product by part number:', error);
      return null;
    }
  }

  /**
   * Update product
   * @param {string} id - Product ID
   * @param {Object} updates - Update data
   * @returns {Object} Update result
   */
  updateProduct(id, updates) {
    try {
      const products = this.loadProducts();
      const index = products.findIndex(p => p.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: 'Product not found'
        };
      }
      
      products[index] = {
        ...products[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      const saveSuccess = this.saveProducts(products);
      
      if (!saveSuccess) {
        throw new Error('Failed to save products');
      }
      
      return {
        success: true,
        data: products[index]
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete product
   * @param {string} id - Product ID
   * @returns {Object} Delete result
   */
  deleteProduct(id) {
    try {
      const products = this.loadProducts();
      const index = products.findIndex(p => p.id === id);
      
      if (index === -1) {
        return {
          success: false,
          error: 'Product not found'
        };
      }
      
      const deletedProduct = products.splice(index, 1)[0];
      
      const saveSuccess = this.saveProducts(products);
      
      if (!saveSuccess) {
        throw new Error('Failed to save products');
      }
      
      return {
        success: true,
        data: deletedProduct
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get product statistics
   * @returns {Object} Statistics object
   */
  getStatistics() {
    try {
      const products = this.loadProducts();
      
      const stats = {
        total: products.length,
        active: products.filter(p => p.isActive).length,
        inactive: products.filter(p => !p.isActive).length,
        categories: {},
        brands: {},
        totalValue: 0
      };
      
      products.forEach(product => {
        // Count by category
        if (product.category) {
          stats.categories[product.category] = (stats.categories[product.category] || 0) + 1;
        }
        
        // Count by brand
        if (product.brand) {
          stats.brands[product.brand] = (stats.brands[product.brand] || 0) + 1;
        }
        
        // Calculate total value
        if (product.price && product.quantity) {
          stats.totalValue += product.price * product.quantity;
        }
      });
      
      return stats;
      
    } catch (error) {
      console.error('Error getting statistics:', error);
      return {
        total: 0,
        active: 0,
        inactive: 0,
        categories: {},
        brands: {},
        totalValue: 0
      };
    }
  }

  /**
   * Search products
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Array} Search results
   */
  searchProducts(query, options = {}) {
    try {
      const products = this.loadProducts();
      const searchTerm = query.toLowerCase();
      
      let results = products.filter(product => {
        return (
          product.partNumber.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.brand.toLowerCase().includes(searchTerm) ||
          product.model.toLowerCase().includes(searchTerm)
        );
      });
      
      // Apply additional filters
      if (options.category) {
        results = results.filter(p => 
          p.category.toLowerCase().includes(options.category.toLowerCase())
        );
      }
      
      if (options.isActive !== undefined) {
        results = results.filter(p => p.isActive === options.isActive);
      }
      
      // Limit results
      if (options.limit) {
        results = results.slice(0, options.limit);
      }
      
      return results;
      
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }
}

