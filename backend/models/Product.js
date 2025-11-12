import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.js';

export const Product = sequelize.define('Product', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  partNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  image: {
    type: DataTypes.TEXT('medium'), // MEDIUMTEXT for base64 images (up to 16MB)
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: 'General'
  }
}, {
  tableName: 'products',
  underscored: true,
  indexes: [
    {
      fields: ['part_number']
    },
    {
      fields: ['category']
    }
  ]
});

export default Product;



