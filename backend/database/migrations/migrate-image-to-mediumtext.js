/**
 * Migration script to alter image column from TEXT to MEDIUMTEXT
 * Run this script to update existing databases to support base64 images
 * 
 * Usage: node backend/database/migrations/migrate-image-to-mediumtext.js
 */

import { sequelize } from '../connection.js';
import { config } from '../../config.js';

async function migrateImageColumn() {
  try {
    console.log('🔄 Starting migration: Alter image column to MEDIUMTEXT...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');
    
    // Check current column type
    const [results] = await sequelize.query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'image'
    `, {
      replacements: [config.database.database]
    });
    
    if (results.length === 0) {
      console.log('⚠️  Products table or image column not found. Creating table with MEDIUMTEXT...');
      // Table will be created with correct type by Sequelize sync
      return;
    }
    
    const currentType = results[0].COLUMN_TYPE;
    console.log(`📋 Current image column type: ${currentType}`);
    
    if (currentType.includes('mediumtext') || currentType.includes('MEDIUMTEXT')) {
      console.log('✅ Image column is already MEDIUMTEXT. No migration needed.');
      return;
    }
    
    // Alter the column
    console.log('🔄 Altering image column to MEDIUMTEXT...');
    await sequelize.query(`
      ALTER TABLE products 
      MODIFY COLUMN image MEDIUMTEXT NULL
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('📊 Image column is now MEDIUMTEXT and can store base64 images up to 16MB.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Run migration
migrateImageColumn()
  .then(() => {
    console.log('✅ Migration script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });

