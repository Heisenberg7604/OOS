#!/usr/bin/env node

/**
 * Generate a secure JWT secret for your application
 * Run this script with: node generate-secret.js
 */

const crypto = require('crypto');

// Generate a secure random string
const generateSecret = () => {
  return crypto.randomBytes(64).toString('hex');
};

// Generate multiple secrets for different environments
console.log('🔐 Generating secure JWT secrets for your application...\n');

const developmentSecret = generateSecret();
const productionSecret = generateSecret();
const testSecret = generateSecret();

console.log('📝 Copy these secrets to your .env file:\n');

console.log('🔧 Development Environment:');
console.log(`JWT_SECRET=${developmentSecret}\n`);

console.log('🚀 Production Environment:');
console.log(`JWT_SECRET=${productionSecret}\n`);

console.log('🧪 Test Environment:');
console.log(`JWT_SECRET=${testSecret}\n`);

console.log('⚠️  IMPORTANT SECURITY NOTES:');
console.log('1. Never share these secrets or commit them to version control');
console.log('2. Use different secrets for different environments');
console.log('3. Regularly rotate your production secrets');
console.log('4. Store production secrets securely (e.g., environment variables, secret management services)');
console.log('5. The .env file should be in your .gitignore\n');

console.log('📋 Next steps:');
console.log('1. Copy the env.example file to .env: cp env.example .env');
console.log('2. Replace the JWT_SECRET in your .env file with one of the secrets above');
console.log('3. Fill in other required environment variables');
console.log('4. Restart your server to apply the changes'); 