const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
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

const OrderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  userEmail: { 
    type: String, 
    required: true 
  },
  customerName: { 
    type: String, 
    required: true 
  },
  customerEmail: { 
    type: String, 
    required: true 
  },
  items: [OrderItemSchema],
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled'], 
    default: 'pending' 
  },
  total: { 
    type: Number, 
    required: true, 
    default: 0 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('Order', OrderSchema); 