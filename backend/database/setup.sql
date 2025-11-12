-- Create database for OOS system
CREATE DATABASE IF NOT EXISTS oos_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE oos_database;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'user') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    part_number VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image MEDIUMTEXT NULL,
    category VARCHAR(100) DEFAULT 'General',
    price DECIMAL(10,2) DEFAULT 0.00,
    quantity INT DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'pcs',
    brand VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    source ENUM('manual', 'excel_import') DEFAULT 'manual',
    import_date DATETIME NULL,
    last_import_source VARCHAR(255) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_part_number (part_number),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active),
    INDEX idx_brand (brand),
    INDEX idx_source (source)
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, name, email, password, role, is_active) 
VALUES (
    UUID(),
    'Admin User',
    'admin@jpextrusiontech.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8K5K5K.', -- admin123
    'admin',
    TRUE
);

-- Show tables
SHOW TABLES;

-- Show users
SELECT id, name, email, role, is_active, created_at FROM users;

