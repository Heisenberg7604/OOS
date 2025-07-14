require('dotenv').config();
console.log('MONGODB_URI:', process.env.MONGODB_URI);
const mongoose = require('mongoose');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');
const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/jp-extrusiontech';

async function migrateProducts() {
  await mongoose.connect(dbUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const filePath = path.join(__dirname, 'products.json');
  const raw = fs.readFileSync(filePath, 'utf-8');
  const products = JSON.parse(raw);
  let added = 0, updated = 0;
  for (const prod of products) {
    const partNo = prod['part no'] || prod.partNo;
    const description = prod.description;
    const imagePath = prod['image path'] || prod.imagePath || '/images/default.jpg';
    if (!partNo || !description) {
      console.warn('Skipping product due to missing fields:', prod);
      continue;
    }
    const result = await Product.findOneAndUpdate(
      { partNo },
      { partNo, description, imagePath },
      { upsert: true, new: true }
    );
    if (result.wasNew) added++;
    else updated++;
  }
  console.log(`Migration complete. Added: ${added}, Updated: ${updated}`);
  await mongoose.disconnect();
}

migrateProducts().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
}); 