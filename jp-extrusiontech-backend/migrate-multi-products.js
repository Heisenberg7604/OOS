const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');
// IMPORTANT: Set your MongoDB URI in a .env file as MONGODB_URI=...
const dbUri = process.env.MONGODB_URI;

// Map of JSON file to its asset folder
const productSources = [
  {
    json: 'Cheese_Winder_JTW_(200IX).json',
    assetFolder: 'Cheese-winder(200IX) assets',
  },
  {
    json: 'JAIKO-812_HF.json',
    assetFolder: 'JAIKO-812_HF assets',
  },
  {
    json: 'PRINTING_MACHINE.json',
    assetFolder: 'PRINTING_MACHINE assets',
  },
  {
    json: 'VEGA-6_HS_STAR.json',
    assetFolder: 'VEGA-6 HS STAR assets',
  },
];

async function migrateAllProducts() {
  await mongoose.connect(dbUri, {});
  let added = 0, updated = 0, skipped = 0;
  for (const source of productSources) {
    const filePath = path.join(__dirname, '../public/data', source.json);
    if (!fs.existsSync(filePath)) {
      console.warn('File not found:', filePath);
      continue;
    }
    const raw = fs.readFileSync(filePath, 'utf-8');
    let products;
    try {
      products = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse', filePath, e);
      continue;
    }
    for (const prod of products) {
      const partNo = prod.part_code || prod.partNo;
      const description = prod.description;
      let imagePath = prod.part_image || prod.imagePath;
      if (!partNo || !description) {
        skipped++;
        continue;
      }
      // Fix image path
      if (typeof imagePath === 'string' && imagePath.startsWith('../assets/')) {
        const imgName = imagePath.split('/').pop();
        imagePath = `/data/${source.assetFolder}/${imgName}`;
      } else if (!imagePath || typeof imagePath !== 'string') {
        imagePath = '/assets/placeholder.jpg';
      }
      const result = await Product.findOneAndUpdate(
        { partNo },
        { partNo, description, imagePath },
        { upsert: true, new: true }
      );
      if (result.wasNew) added++;
      else updated++;
    }
  }
  const oldProductsPath = path.join(__dirname, 'data', 'products.json');
  if (fs.existsSync(oldProductsPath)) {
    const raw = fs.readFileSync(oldProductsPath, 'utf-8');
    let products;
    try {
      products = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to parse', oldProductsPath, e);
      products = [];
    }
    for (const prod of products) {
      const partNo = prod['part no'] || prod.partNo;
      const description = prod.description;
      let imagePath = prod['image path'] || prod.imagePath;
      if (!partNo || !description) {
        skipped++;
        continue;
      }
      // Fix image path
      if (typeof imagePath === 'string' && imagePath.startsWith('/images/')) {
        // Try to map to /data/ if file exists, else fallback
        const imgName = imagePath.split('/').pop();
        const dataPath = path.join(__dirname, '../public/data', imgName);
        if (fs.existsSync(dataPath)) {
          imagePath = `/data/${imgName}`;
        } else {
          imagePath = '/assets/placeholder.jpg';
        }
      } else if (!imagePath || typeof imagePath !== 'string') {
        imagePath = '/assets/placeholder.jpg';
      }
      const result = await Product.findOneAndUpdate(
        { partNo },
        { partNo, description, imagePath },
        { upsert: true, new: true }
      );
      if (result.wasNew) added++;
      else updated++;
    }
  }
  console.log(`Migration complete. Added: ${added}, Updated: ${updated}, Skipped: ${skipped}`);
  await mongoose.disconnect();
}

migrateAllProducts(); 