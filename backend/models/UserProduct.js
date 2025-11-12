import { DataTypes } from 'sequelize';
import { sequelize } from '../database/connection.js';

export const UserProduct = sequelize.define('UserProduct', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'products',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'user_products',
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'product_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['product_id']
    }
  ]
});

export default UserProduct;

