# Database Migrations

This directory contains database migration scripts.

## Migration: Image Column to MEDIUMTEXT

### Purpose
Updates the `image` column in the `products` table from `TEXT` to `MEDIUMTEXT` to support storing base64 encoded images (up to 16MB).

### Files
- `alter_image_to_mediumtext.sql` - SQL script for manual migration
- `migrate-image-to-mediumtext.js` - Node.js script for automated migration

### Running the Migration

#### Option 1: Using Node.js Script (Recommended)
```bash
cd backend
node database/migrations/migrate-image-to-mediumtext.js
```

#### Option 2: Using SQL Script
```bash
mysql -u root -p oos_database < backend/database/migrations/alter_image_to_mediumtext.sql
```

Or connect to MySQL and run:
```sql
USE oos_database;
ALTER TABLE products MODIFY COLUMN image MEDIUMTEXT NULL;
```

### Verification
After running the migration, verify the change:
```sql
DESCRIBE products;
```

The `image` column should show `MEDIUMTEXT` as its type.

### Notes
- This migration is safe to run multiple times (it checks if already migrated)
- Existing data will be preserved
- MEDIUMTEXT can store up to 16MB, which is sufficient for base64 encoded images

