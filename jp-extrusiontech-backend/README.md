# JP Extrusiontech Backend

A Node.js backend server for JP Extrusion Tech with MongoDB database integration.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **User Management**: User registration, login, and role-based access control
- **Product Management**: CRUD operations for products with part numbers and descriptions
- **Shopping Cart**: Persistent cart functionality for authenticated users
- **Order Management**: Complete order lifecycle with status tracking
- **Admin Panel**: Comprehensive admin interface for managing users, orders, and products
- **Email Notifications**: Order confirmation emails (optional)
- **MongoDB Integration**: Full database integration with Mongoose ODM

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jp-extrusiontech-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/jp-extrusiontech
   
   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (optional)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-email-password
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up MongoDB**
   - Install MongoDB on your system
   - Start MongoDB service
   - Create a database named `jp-extrusiontech` (or use the URI in your .env file)

5. **Run the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Setup

### MongoDB Installation

#### Windows
1. Download MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
2. Install with default settings
3. MongoDB service should start automatically
4. MongoDB will be available at `mongodb://localhost:27017`

#### macOS (using Homebrew)
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

#### Linux (Ubuntu)
```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Database Initialization

The server will automatically:
- Connect to MongoDB
- Create default admin user (admin@jpextrusiontech.com / admin123)
- Initialize sample products if none exist

### Data Migration (if migrating from JSON)

If you have existing JSON data, run the migration script:
```bash
node migrate-data.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:partNo` - Get product by part number
- `GET /api/products/search/:query` - Search products
- `POST /api/products` - Add new product (admin only)
- `PUT /api/products/:partNo` - Update product (admin only)
- `DELETE /api/products/:partNo` - Delete product (admin only)

### Cart (Protected)
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item quantity
- `DELETE /api/cart/remove/:partNo` - Remove item from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders (Protected)
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user's orders

### Admin Routes (Admin only)
- `GET /api/admin/orders` - Get all orders
- `GET /api/admin/users` - Get all users
- `GET /api/admin/stats` - Get admin statistics
- `PUT /api/admin/orders/:orderId` - Update order status
- `DELETE /api/admin/orders/:orderId` - Delete order
- `POST /api/admin/users` - Create new user
- `DELETE /api/admin/users/:userId` - Delete user

## Default Admin Account

- **Email**: admin@jpextrusiontech.com
- **Password**: admin123

**Important**: Change these credentials in production!

## Database Models

### User
- `name` (String, required)
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String, enum: ['user', 'admin'], default: 'user')
- `createdAt` (Date, default: now)
- `updatedAt` (Date, default: now)

### Product
- `partNo` (String, required, unique)
- `description` (String, required)
- `imagePath` (String, default: '/images/default.jpg')
- `createdAt` (Date, default: now)
- `updatedAt` (Date, default: now)

### Order
- `userId` (ObjectId, ref: 'User', required)
- `userEmail` (String, required)
- `customerName` (String, required)
- `customerEmail` (String, required)
- `items` (Array of OrderItems)
- `status` (String, enum: ['pending', 'processing', 'completed', 'cancelled'], default: 'pending')
- `total` (Number, required, default: 0)
- `createdAt` (Date, default: now)
- `updatedAt` (Date, default: now)

### Cart
- `userId` (ObjectId, ref: 'User', required, unique)
- `items` (Array of CartItems)
- `total` (Number, default: 0)
- `updatedAt` (Date, default: now)

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation
- CORS configuration
- Environment variable protection

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
npm test
```

### Database Backup
```bash
# Backup database
mongodump --db jp-extrusiontech --out ./backup

# Restore database
mongorestore --db jp-extrusiontech ./backup/jp-extrusiontech
```

## Production Deployment

1. Set `NODE_ENV=production` in your environment variables
2. Use a strong JWT secret
3. Configure proper MongoDB connection string
4. Set up email credentials for notifications
5. Use a process manager like PM2
6. Set up proper logging
7. Configure SSL/TLS certificates

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **JWT Token Issues**
   - Check JWT_SECRET in environment variables
   - Ensure token is being sent in Authorization header

3. **CORS Errors**
   - Verify frontend URL is in CORS configuration
   - Check if credentials are being sent properly

4. **Email Notifications Not Working**
   - Verify email credentials in .env file
   - Check if email service is properly configured

## Support

For support and questions, please contact the development team.

## License

MIT License 