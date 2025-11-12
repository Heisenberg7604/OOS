import express from 'express';
import path from 'path';
import fs from 'fs';
import { upload, handleUploadError } from '../middleware/upload.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { ExcelParser } from '../utils/excelParser.js';
import { Product } from '../models/index.js';

const router = express.Router();
const excelParser = new ExcelParser();

// Add logging middleware to track requests
router.use('/excel', (req, res, next) => {
  console.log('🔍 CHECKPOINT ROUTE: /excel route middleware hit!');
  console.log('🔍 CHECKPOINT ROUTE.1: Method:', req.method);
  console.log('🔍 CHECKPOINT ROUTE.2: URL:', req.url);
  console.log('🔍 CHECKPOINT ROUTE.3: Has body?', !!req.body);
  console.log('🔍 CHECKPOINT ROUTE.4: Has file?', !!req.file);
  next();
});

// Upload Excel file endpoint
router.post('/excel', authenticateToken, requireAdmin, upload.single('file'), handleUploadError, async (req, res) => {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🔍 CHECKPOINT START: Upload route handler EXECUTED!');
  console.log('🔍 CHECKPOINT START.1: Request method:', req.method);
  console.log('🔍 CHECKPOINT START.2: Request has file?', !!req.file);
  console.log('🔍 CHECKPOINT START.2.1: Timestamp:', new Date().toISOString());
  console.log('═══════════════════════════════════════════════════════');
  
  let filePath = null;
  
  try {
    console.log('🔍 CHECKPOINT START.3: Inside try block');
    
    if (!req.file) {
      console.log('🔍 CHECKPOINT START.4: No file in request!');
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    console.log('🔍 CHECKPOINT START.5: File found in request!');
    filePath = req.file.path;
    const originalName = req.file.originalname;

    console.log('📤 File upload started:', originalName);
    console.log('🔍 CHECKPOINT START.6: File details - path:', filePath, 'originalName:', originalName);
    console.log('📁 File path from multer:', filePath);
    console.log('📁 File exists?', fs.existsSync(filePath));
    
    // Resolve absolute path if relative
    if (!path.isAbsolute(filePath)) {
      const resolvedPath = path.resolve(filePath);
      console.log('📁 Resolved file path:', resolvedPath);
      filePath = resolvedPath;
    }

    // Validate file
    const validation = excelParser.validateFile(filePath, originalName);
    if (!validation.success) {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(400).json({
        success: false,
        message: validation.error
      });
    }

    console.log('✅ File validation passed');
    console.log(`🔍 CHECKPOINT 0.0: About to call parseFile with filePath: ${filePath}`);

    // Parse Excel file
    console.log(`🔍 CHECKPOINT 0.0.1: Calling excelParser.parseFile()...`);
    const parseResult = await excelParser.parseFile(filePath, originalName);
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`🔍 CHECKPOINT PARSE_RESULT: parseFile returned!`);
    console.log(`🔍 Success: ${parseResult.success}`);
    console.log(`═══════════════════════════════════════════════════════`);
    
    if (!parseResult.success) {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error('❌ Parse error:', parseResult.error);
      return res.status(400).json({
        success: false,
        message: parseResult.error
      });
    }

    console.log('✅ File parsed successfully');

    const { products, metadata, errors } = parseResult.data;
    console.log(`📊 Parsed ${products.length} products from ${metadata.totalRows} rows`);
    console.log(`📊 Parse errors: ${errors.length}`);
    
    // CHECKPOINT: Verify images in parsed products
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`🔍 CHECKPOINT 13: Checking parsed products for images...`);
    console.log(`🔍 Total products parsed: ${products.length}`);
    const productsWithImages = products.filter(p => p.image && (p.image.startsWith('data:image/') || typeof p.image === 'string'));
    console.log(`🔍 CHECKPOINT 14: Found ${productsWithImages.length} products with images out of ${products.length} total`);
    if (productsWithImages.length > 0) {
      const firstWithImage = productsWithImages[0];
      console.log(`🔍 CHECKPOINT 15: Sample product with image:`);
      console.log(`   Part: ${firstWithImage.partNumber}`);
      console.log(`   Image type: ${typeof firstWithImage.image}`);
      console.log(`   Image length: ${firstWithImage.image ? firstWithImage.image.length : 0} chars`);
      console.log(`   Image preview: ${firstWithImage.image ? firstWithImage.image.substring(0, 80) + '...' : 'null'}`);
    } else if (products.length > 0) {
      console.log(`⚠️  CHECKPOINT 16: NO PRODUCTS HAVE IMAGES!`);
      console.log(`   First product part: ${products[0].partNumber}`);
      console.log(`   First product image value: ${products[0].image || 'null'}`);
      console.log(`   First product image type: ${typeof products[0].image}`);
      console.log(`   First 3 products image values: ${products.slice(0, 3).map(p => p.image || 'null').join(', ')}`);
    }
    console.log(`═══════════════════════════════════════════════════════`);
    
    if (errors.length > 0) {
      console.log('⚠️ Parse errors details:');
      errors.slice(0, 20).forEach((err, idx) => {
        console.log(`  ${idx + 1}. Row ${err.row}: ${err.error}`);
      });
      if (errors.length > 20) {
        console.log(`  ... and ${errors.length - 20} more errors`);
      }
    }

    // Import products to database
    console.log(`═══════════════════════════════════════════════════════`);
    console.log(`🔍 CHECKPOINT BEFORE_DB_IMPORT: About to import ${products.length} products to database`);
    if (products.length > 0) {
      const productsWithImages = products.filter(p => p.image && typeof p.image === 'string' && p.image.length > 0);
      console.log(`🔍 Products WITH images: ${productsWithImages.length} out of ${products.length}`);
      console.log(`🔍 Products WITHOUT images: ${products.length - productsWithImages.length} out of ${products.length}`);
      if (productsWithImages.length > 0) {
        console.log(`🔍 First product WITH image - Part: ${productsWithImages[0].partNumber}, Image length: ${productsWithImages[0].image.length} chars`);
      } else {
        console.log(`⚠️  NO PRODUCTS HAVE IMAGES! First 3 products:`);
        products.slice(0, 3).forEach((p, idx) => {
          console.log(`   ${idx + 1}. Part: ${p.partNumber}, Image: ${p.image || 'null'} (type: ${typeof p.image})`);
        });
      }
    }
    console.log(`═══════════════════════════════════════════════════════`);
    
    const importResult = await importProductsToDatabase(products, originalName);
    
    if (!importResult.success) {
      // Clean up uploaded file
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      console.error('❌ Import error:', importResult.error);
      return res.status(500).json({
        success: false,
        message: importResult.error || 'Failed to import products to database'
      });
    }

    console.log(`✅ Import completed: ${importResult.data.added} added, ${importResult.data.updated} updated, ${importResult.data.skipped} skipped`);
    
    // Log skipped products details
    if (importResult.data.skippedProducts && importResult.data.skippedProducts.length > 0) {
      console.log('⚠️ Skipped products:');
      importResult.data.skippedProducts.forEach((skipped, index) => {
        console.log(`  ${index + 1}. Part Number: ${skipped.partNumber}, Error: ${skipped.error}`);
      });
    }

    // Clean up uploaded file after successful processing
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Return success response
    res.json({
      success: true,
      message: 'File uploaded and processed successfully',
      data: {
        import: importResult.data,
        parse: {
          metadata,
          errors
        },
        summary: {
          totalRows: metadata.totalRows,
          validProducts: metadata.validProducts,
          parseErrors: errors.length,
          addedProducts: importResult.data.added,
          updatedProducts: importResult.data.updated,
          skippedProducts: importResult.data.skipped,
          fileName: originalName
        }
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    console.error('Error stack:', error.stack);
    
    // Clean up uploaded file on error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.error('Failed to delete file:', unlinkError);
      }
    }
    
    // Make sure we send a response
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during file processing',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
});

// Get upload history (optional feature)
router.get('/history', authenticateToken, requireAdmin, (req, res) => {
  try {
    // This could be expanded to track upload history
    res.json({
      success: true,
      message: 'Upload history retrieved',
      data: {
        uploads: [],
        message: 'Upload history feature coming soon'
      }
    });
  } catch (error) {
    console.error('Upload history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving upload history'
    });
  }
});

// Download sample template
router.get('/template', (req, res) => {
  try {
    const templateData = [
      ['id', 'part_number', 'partimage', 'part description'],
      ['', 'JPCWC032', 'https://via.placeholder.com/100x100/cccccc/666666?text=JPCWC032', 'WINDING SCHAFT BRAKE LEVER'],
      ['', 'JPCWP015', 'https://via.placeholder.com/100x100/cccccc/666666?text=JPCWP015', 'BRAKE BUSH'],
      ['', 'SAMPLE-001', 'https://via.placeholder.com/100x100/cccccc/666666?text=SAMPLE-001', 'Sample Product 1']
    ];

    // Convert to CSV format
    const csvContent = templateData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="product_template.csv"');
    res.send(csvContent);

  } catch (error) {
    console.error('Template download error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating template'
    });
  }
});

// Helper function to import products to database
async function importProductsToDatabase(products, fileName) {
  try {
    const addedProducts = [];
    const updatedProducts = [];
    const skippedProducts = [];

    console.log(`🔄 Starting import of ${products.length} products...`);

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      
      // Log progress every 50 products
      if ((i + 1) % 50 === 0) {
        console.log(`   Processing ${i + 1}/${products.length} products...`);
      }

      try {
        // Remove fields that shouldn't be in database
        const { rowNumber, ...dbProductData } = productData;
        
        // Validate required fields
        const partNumberRaw = productData.partNumber || dbProductData.part_number || '';
        if (!partNumberRaw || !partNumberRaw.trim()) {
          throw new Error('Part number is required and cannot be empty');
        }

        // Truncate partNumber if too long (max 100 chars)
        const partNumber = partNumberRaw.trim().substring(0, 100);
        if (!partNumber) {
          throw new Error('Part number is empty after trimming');
        }

        // Validate description - allow empty but default to part number
        const descriptionRaw = productData.description || dbProductData.description || '';
        const description = descriptionRaw.trim() || partNumber || 'No description';

        // Check if product already exists by partNumber or id
        const existingProductById = productData.id 
          ? await Product.findByPk(productData.id)
          : null;
        
        const existingProductByPartNumber = await Product.findOne({
          where: { partNumber: partNumber }
        });

        const existingProduct = existingProductById || existingProductByPartNumber;

        // Extract image - check both productData and dbProductData
        // productData comes from Excel parser with 'image' field already set
        let imageRaw = productData.image;
        
        // If image is not set, check dbProductData (after rowNumber removal)
        if (imageRaw === null || imageRaw === undefined || imageRaw === '') {
          imageRaw = dbProductData.image;
        }
        
        // Debug logging to see what we have
        console.log(`🔍 CHECKPOINT 17.${i + 1}: Processing product for database import`);
        console.log(`🔍 CHECKPOINT 18.${i + 1}: Row ${productData.rowNumber || i + 1} - Part: ${partNumber}`);
        console.log(`🔍 CHECKPOINT 19.${i + 1}: Product data keys: ${Object.keys(productData).join(', ')}`);
        console.log(`🔍 CHECKPOINT 20.${i + 1}: productData.image type: ${typeof productData.image}`);
        console.log(`🔍 CHECKPOINT 21.${i + 1}: productData.image value: ${productData.image ? (productData.image.startsWith('data:image/') ? `base64 (${Math.round(productData.image.length / 1024)}KB)` : productData.image.substring(0, 100) + '...') : 'null'}`);
        if (i < 5) {
          console.log(`🔍 Row ${productData.rowNumber || i + 1} - Part: ${partNumber}`);
          console.log(`🔍 Product data keys: ${Object.keys(productData).join(', ')}`);
          console.log(`🔍 productData.image: ${productData.image ? (productData.image.length > 200 ? productData.image.substring(0, 200) + '...' : productData.image) : 'null'}`);
          console.log(`🔍 productData.image type: ${typeof productData.image}`);
          console.log(`🔍 dbProductData keys: ${Object.keys(dbProductData).join(', ')}`);
          console.log(`🔍 dbProductData.image: ${dbProductData.image ? (typeof dbProductData.image === 'string' && dbProductData.image.length > 200 ? dbProductData.image.substring(0, 200) + '...' : dbProductData.image) : 'null'}`);
        }
        
        // Handle image value - preserve valid URLs/paths, set to null if empty
        let image = null;
        if (imageRaw !== null && imageRaw !== undefined) {
          // Convert to string if not already
          const imageStr = typeof imageRaw === 'string' ? imageRaw : (imageRaw.toString ? imageRaw.toString() : String(imageRaw));
          const trimmed = imageStr.trim();
          // Only set image if it's not empty after trimming
          if (trimmed && trimmed.length > 0) {
            image = trimmed;
          }
        }
        
        // Debug logging for first few products
        if (i < 5) {
          const imagePreview = image ? (image.startsWith('data:image/') ? `base64 (${Math.round(image.length / 1024)}KB)` : image.substring(0, 50) + '...') : 'null';
          console.log(`🖼️  Image raw: ${imageRaw ? (typeof imageRaw === 'string' && imageRaw.length > 50 ? imageRaw.substring(0, 50) + '...' : imageRaw) : 'null'}`);
          console.log(`🖼️  Image final: ${imagePreview}`);
        }

        if (existingProduct) {
          // Update existing product (preserve existing ID)
          const updateData = {
            partNumber: partNumber,
            description: description,
            image: image,
            category: (productData.category || dbProductData.category || 'General').trim()
          };
          
          console.log(`🔍 CHECKPOINT 22.${i + 1}: Updating existing product. Image in updateData: ${updateData.image ? (updateData.image.startsWith('data:image/') ? `base64 (${Math.round(updateData.image.length / 1024)}KB)` : 'not base64') : 'null'}`);
          if (i < 3) {
            console.log(`💾 Updating product with image: ${updateData.image ? `base64 (${Math.round(updateData.image.length / 1024)}KB)` : 'null'}`);
          }
          
          await existingProduct.update(updateData);
          console.log(`🔍 CHECKPOINT 23.${i + 1}: Product updated in database`);
          
          // Verify the update
          await existingProduct.reload();
          console.log(`🔍 CHECKPOINT 24.${i + 1}: After reload, product.image: ${existingProduct.image ? (existingProduct.image.startsWith('data:image/') ? `base64 (${Math.round(existingProduct.image.length / 1024)}KB)` : existingProduct.image.substring(0, 50) + '...') : 'null'}`);
          if (i < 3) {
            console.log(`✅ After update, product image: ${existingProduct.image ? (existingProduct.image.startsWith('data:image/') ? `base64 (${Math.round(existingProduct.image.length / 1024)}KB)` : existingProduct.image.substring(0, 50) + '...') : '(null)'}`);
          }
          
          updatedProducts.push(existingProduct);
        } else {
          // Create new product (use ID from Excel if provided, or let Sequelize generate one)
          const productToCreate = {
            partNumber: partNumber,
            description: description,
            image: image,
            category: (productData.category || dbProductData.category || 'General').trim()
          };
          
          // If ID was provided, use it; otherwise let Sequelize generate UUID
          if (productData.id) {
            productToCreate.id = productData.id.trim();
          }
          
          console.log(`🔍 CHECKPOINT 25.${i + 1}: Creating new product. Image in productToCreate: ${productToCreate.image ? (productToCreate.image.startsWith('data:image/') ? `base64 (${Math.round(productToCreate.image.length / 1024)}KB)` : 'not base64') : 'null'}`);
          if (i < 3) {
            console.log(`💾 Creating product with image: ${productToCreate.image ? `base64 (${Math.round(productToCreate.image.length / 1024)}KB)` : 'null'}`);
          }
          
          const newProduct = await Product.create(productToCreate);
          console.log(`🔍 CHECKPOINT 26.${i + 1}: Product created in database`);
          
          console.log(`🔍 CHECKPOINT 27.${i + 1}: After create, product.image: ${newProduct.image ? (newProduct.image.startsWith('data:image/') ? `base64 (${Math.round(newProduct.image.length / 1024)}KB)` : newProduct.image.substring(0, 50) + '...') : 'null'}`);
          if (i < 3) {
            console.log(`✅ After create, product image: ${newProduct.image ? (newProduct.image.startsWith('data:image/') ? `base64 (${Math.round(newProduct.image.length / 1024)}KB)` : newProduct.image.substring(0, 50) + '...') : '(null)'}`);
          }
          
          addedProducts.push(newProduct);
        }
      } catch (error) {
        const errorMessage = error.message || 'Unknown error';
        const errorName = error.name || 'Error';
        
        console.error(`❌ Error processing product (Row ${productData.rowNumber || i + 1}): ${productData.partNumber || 'unknown'} - ${errorName}: ${errorMessage}`);
        
        // Log full error for duplicate key errors
        if (errorName === 'SequelizeUniqueConstraintError' || errorMessage.includes('Duplicate entry')) {
          console.error(`   ⚠️ Duplicate part number detected: ${productData.partNumber}`);
        }
        
        skippedProducts.push({
          partNumber: productData.partNumber || 'unknown',
          id: productData.id || 'unknown',
          rowNumber: productData.rowNumber || i + 1,
          error: errorMessage,
          errorType: errorName
        });
      }
    }

    console.log(`✅ Import summary: ${addedProducts.length} added, ${updatedProducts.length} updated, ${skippedProducts.length} skipped out of ${products.length} total`);

    return {
      success: true,
      data: {
        total: products.length,
        added: addedProducts.length,
        updated: updatedProducts.length,
        skipped: skippedProducts.length,
        addedProducts,
        updatedProducts,
        skippedProducts
      }
    };

  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    return {
      success: false,
      error: error.message || 'Unknown error during import'
    };
  }
}

export default router;
