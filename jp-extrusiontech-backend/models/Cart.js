const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  partNo: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    required: true 
  },
  imagePath: { 
    type: String 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  }
});

const CartSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    unique: true 
  },
  items: [CartItemSchema],
  total: { 
    type: Number, 
    default: 0 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Cart', CartSchema); 