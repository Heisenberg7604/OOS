-- Migration script to alter image column from TEXT to MEDIUMTEXT
-- This allows storing larger base64 encoded images (up to 16MB)

USE oos_database;

-- Alter the image column to MEDIUMTEXT
ALTER TABLE products MODIFY COLUMN image MEDIUMTEXT NULL;

-- Verify the change
DESCRIBE products;

