# Admin-Only Account Creation System

## Overview
This system has been updated to implement **admin-only account creation**. Only administrators can create new user accounts for customers. Public registration has been completely disabled.

## Key Changes Made

### 1. **Frontend Changes**
- **Removed public registration**: The "Register" button has been removed from the navbar
- **Removed public route**: The `/register` route is no longer accessible to the public
- **Admin-only access**: Registration is now available at `/admin/create-user` for admins only
- **Enhanced form**: The registration form now includes customer information fields

### 2. **Backend Changes**
- **Disabled public registration**: The `/api/auth/register` endpoint now returns a 403 error
- **New admin endpoint**: Added `/api/admin/create-customer` for admin-only account creation
- **Enhanced user model**: Added customer information fields to the User schema
- **Customer tracking**: Each user now stores customer details and who created the account

### 3. **Admin Panel Enhancements**
- **Create Customer Account button**: Added to both main admin panel and user management
- **Customer information display**: User management now shows customer details
- **Improved user tracking**: Admins can see which customer each account belongs to

## How It Works

### For Administrators:
1. **Login as admin** using the admin credentials
2. **Navigate to Admin Panel** or User Management
3. **Click "Create Customer Account"** button
4. **Fill out the form** with:
   - Basic account info (name, email, password)
   - Customer information (customer name, company, phone, address)
5. **Submit** to create the account
6. **Provide credentials** to the customer

### For Customers:
1. **Contact administrator** to request an account
2. **Receive login credentials** from admin
3. **Login** using provided email and password
4. **Access the website** with full functionality

## Customer Information Fields

When creating a customer account, admins can provide:

- **Customer Name**: The customer's full name
- **Company Name**: The customer's company (optional)
- **Phone Number**: Contact phone number (optional)
- **Address**: Customer address (optional)

## Security Features

- **No public registration**: Prevents unauthorized account creation
- **Admin-only access**: Only authenticated admins can create accounts
- **Customer tracking**: Each account is linked to specific customer information
- **Audit trail**: Records which admin created each account

## Default Admin Account

The system includes a default admin account:
- **Email**: admin@jpextrusiontech.com
- **Password**: admin123

**Important**: Change these credentials after first login for security.

## User Management

Admins can:
- **View all users** with their customer information
- **Edit user roles** (user/admin)
- **Activate/deactivate** user accounts
- **Delete users** (removes account and all associated data)
- **Track customer details** for each account

## Benefits

1. **Controlled access**: Only authorized customers can access the system
2. **Customer tracking**: Know exactly which customer has which account
3. **Security**: Prevents spam and unauthorized registrations
4. **Accountability**: Track who created each account
5. **Professional**: Provides a more controlled, business-like experience

## Troubleshooting

### If a customer can't login:
1. Check if the account exists in User Management
2. Verify the account is active (not deactivated)
3. Confirm the email and password are correct
4. Reset password if needed (admin can create new account)

### If admin can't create accounts:
1. Ensure you're logged in as admin
2. Check if you have the correct permissions
3. Verify the backend server is running
4. Check browser console for any errors

## API Endpoints

### Disabled:
- `POST /api/auth/register` - Returns 403 error

### New Admin Endpoints:
- `POST /api/admin/create-customer` - Create customer account (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `DELETE /api/admin/users/:userId` - Delete user (admin only)

## Database Schema Updates

The User model now includes:
```javascript
{
  customerName: String,
  companyName: String,
  phoneNumber: String,
  address: String,
  isActive: Boolean,
  createdBy: ObjectId (reference to admin who created the account)
}
```

## Future Enhancements

Potential improvements:
- Password reset functionality for admins
- Bulk user import/export
- Customer account expiration dates
- Advanced customer categorization
- Email notifications for new accounts 