// ============================================================================
// Jaxmart B2B Platform - Single Unified Server & Database Engine
// URL: http://localhost:3000
// Database Engine: PostgreSQL (Port 5432 / captain DB)
// ============================================================================

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Jadequest%403009@localhost:5432/captain?schema=public";

const pool = new Pool({
  connectionString: connectionString,
});

// Initialize PostgreSQL Database Tables & Migrations
async function initializeDbSchema() {
  try {
    const client = await pool.connect();
    console.log('📡 Connecting Server to PostgreSQL database...');

    // 1. Users Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(64) PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          mobile VARCHAR(32) NOT NULL,
          password_hash VARCHAR(255) DEFAULT '123456',
          first_name VARCHAR(100) NOT NULL,
          last_name VARCHAR(100) NOT NULL,
          role VARCHAR(32) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
          avatar_url TEXT,
          is_deleted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure is_deleted column exists
    await client.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_deleted') THEN
          ALTER TABLE users ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
        END IF;
      END $$;
    `);

    // 2. Categories
    await client.query(`
      CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          parent_id VARCHAR(64),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Products
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          sku VARCHAR(64) UNIQUE NOT NULL,
          category_id VARCHAR(64),
          seller_id VARCHAR(64),
          price DECIMAL(12,2) NOT NULL,
          stock INT NOT NULL DEFAULT 0,
          status VARCHAR(32) NOT NULL DEFAULT 'APPROVED',
          is_deleted BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. RFQs
    await client.query(`
      CREATE TABLE IF NOT EXISTS rfqs (
          id VARCHAR(64) PRIMARY KEY,
          rfq_number VARCHAR(64) UNIQUE NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          seller_id VARCHAR(64),
          product_name VARCHAR(255) NOT NULL,
          quantity INT NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Orders
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
          id VARCHAR(64) PRIMARY KEY,
          order_number VARCHAR(64) UNIQUE NOT NULL,
          customer_name VARCHAR(255) NOT NULL,
          seller_id VARCHAR(64),
          total_amount DECIMAL(12,2) NOT NULL,
          payment_status VARCHAR(32) NOT NULL DEFAULT 'PAID',
          order_status VARCHAR(32) NOT NULL DEFAULT 'DELIVERED',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Payments
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
          id VARCHAR(64) PRIMARY KEY,
          payment_number VARCHAR(64) UNIQUE NOT NULL,
          order_id VARCHAR(64),
          amount DECIMAL(12,2) NOT NULL,
          payment_method VARCHAR(50) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'COMPLETED',
          transaction_ref VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. System Settings
    await client.query(`
      CREATE TABLE IF NOT EXISTS system_settings (
          key_name VARCHAR(100) PRIMARY KEY,
          value_json JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Captain Attendance Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS captain_attendance (
          id VARCHAR(64) PRIMARY KEY,
          captain_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          date DATE NOT NULL DEFAULT CURRENT_DATE,
          punch_in_time TIMESTAMP WITH TIME ZONE,
          punch_in_location TEXT,
          punch_out_time TIMESTAMP WITH TIME ZONE,
          punch_out_location TEXT,
          total_hours VARCHAR(64),
          status VARCHAR(32) NOT NULL DEFAULT 'PUNCHED_IN',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Captain Field Products Table
    await client.query(`
      CREATE TABLE IF NOT EXISTS captain_field_products (
          id VARCHAR(64) PRIMARY KEY,
          captain_id VARCHAR(64) REFERENCES users(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          sub_category VARCHAR(100) NOT NULL,
          price DECIMAL(12,2) NOT NULL,
          color VARCHAR(50),
          image_url TEXT,
          color_image_url TEXT,
          status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed baseline accounts into PostgreSQL database if missing
    await client.query(`
      INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted) VALUES
      ('USR-SA-001', 'jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
      ('USR-SA-002', 'superadmin@jaxmart.com', '+91 99999 88888', '123456', 'Main', 'SuperAdmin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
      ('USR-ADM-101', 'jaxmart@gmail.com', '+91 98220 11223', '123456', 'Jaxmart', 'Admin', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', FALSE),
      ('USR-CAP-201', 'amit.captain@jaxmart.com', '+91 97112 33445', '123456', 'Amit', 'Verma', 'CAPTAIN', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', FALSE),
      ('USR-SEL-301', 'contact@abctraders.in', '+91 91234 56789', '123456', 'Rajesh', 'Mehta', 'SELLER', 'ACTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', FALSE),
      ('USR-CUST-401', 'customer@reliancestores.com', '+91 98111 22334', '123456', 'Sanjay', 'Patel', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', FALSE)
      ON CONFLICT (email) DO NOTHING;
    `);

    client.release();
    console.log('✅ PostgreSQL Database Tables & Baseline Accounts Seeded!');
  } catch (err) {
    console.error('⚠️ PostgreSQL Connection Error:', err.message);
  }
}

// ============================================================================
// CENTRAL REST API ROUTES FOR SUPER ADMIN & PLATFORM CORE
// ============================================================================

// 1. GET /api/users - Fetch All Users from PostgreSQL
app.get('/api/users', async (req, res) => {
  try {
    const showDeleted = req.query.showDeleted === 'true';
    const query = showDeleted
      ? 'SELECT * FROM users ORDER BY created_at DESC;'
      : 'SELECT * FROM users WHERE is_deleted = FALSE OR is_deleted IS NULL ORDER BY created_at DESC;';

    const result = await pool.query(query);
    const users = result.rows.map(r => ({
      id: r.id,
      name: `${r.first_name} ${r.last_name}`.trim(),
      firstName: r.first_name,
      lastName: r.last_name,
      email: r.email,
      mobile: r.mobile,
      role: r.role,
      status: r.status,
      avatarUrl: r.avatar_url,
      isDeleted: r.is_deleted || false,
      createdDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-08-11',
      lastLogin: 'Active'
    }));
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/users - Create User (Super Admin Permission)
app.post('/api/users', async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, role, password, companyName } = req.body;
    if (!firstName || !email || !role) {
      return res.status(400).json({ success: false, error: 'First Name, Email, and Role are required.' });
    }

    const formattedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [formattedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists.' });
    }

    const prefixMap = { ADMIN: 'USR-ADM', CAPTAIN: 'USR-CAP', SELLER: 'USR-SEL', CUSTOMER: 'USR-CUST' };
    const prefix = prefixMap[role] || 'USR-SA';
    const newId = `${prefix}-${Math.floor(100 + Math.random() * 900)}`;

    await pool.query(
      `INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'ACTIVE', $8, FALSE)`,
      [
        newId,
        formattedEmail,
        mobile || '+91 98000 00000',
        password || '123456',
        firstName.trim(),
        lastName ? lastName.trim() : '',
        role,
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      ]
    );

    console.log(`✅ [PostgreSQL DB] New ${role} inserted successfully:`, newId, formattedEmail);

    res.json({
      success: true,
      message: `${role} account created successfully!`,
      user: { id: newId, name: `${firstName} ${lastName || ''}`.trim(), email: formattedEmail, role, status: 'ACTIVE' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/captain/register - Register Captain
app.post('/api/captain/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, Email, and Password are required.' });
    }

    const formattedEmail = email.trim().toLowerCase();
    const existing = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [formattedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'An account with this email is already registered.' });
    }

    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'Captain';
    const lastName = nameParts.slice(1).join(' ') || '';
    const newId = `USR-CAP-${Math.floor(250 + Math.random() * 700)}`;

    await pool.query(
      `INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted)
       VALUES ($1, $2, $3, $4, $5, $6, 'CAPTAIN', 'INACTIVE', $7, FALSE)`,
      [
        newId,
        formattedEmail,
        '+91 98000 11223',
        password,
        firstName,
        lastName,
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      ]
    );

    console.log('✅ [PostgreSQL DB] New Public Captain registered:', newId, formattedEmail);

    res.json({
      success: true,
      message: 'Captain registered successfully! Pending Admin Activation.',
      user: { id: newId, name, email: formattedEmail, role: 'CAPTAIN', status: 'INACTIVE' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. POST /api/users/status - Activate/Deactivate/Suspend Account
app.post('/api/users/status', async (req, res) => {
  try {
    const { id, newStatus } = req.body;
    if (!id || !newStatus) {
      return res.status(400).json({ success: false, error: 'User ID and newStatus are required.' });
    }
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, id]);
    res.json({ success: true, message: `Account status updated to ${newStatus}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. DELETE /api/users/:id - Soft Delete User Record
app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_deleted = TRUE, status = $1 WHERE id = $2', ['INACTIVE', id]);
    res.json({ success: true, message: `User ${id} record deleted (Soft Delete).` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST /api/users/:id/restore - Restore Deleted User Record
app.post('/api/users/:id/restore', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE users SET is_deleted = FALSE, status = $1 WHERE id = $2', ['ACTIVE', id]);
    res.json({ success: true, message: `User ${id} record restored successfully.` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. GET /api/products - Get Products
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products WHERE is_deleted = FALSE ORDER BY created_at DESC;');
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. GET /api/categories - Get Categories
app.get('/api/categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY created_at DESC;');
    res.json({ success: true, categories: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 9. GET /api/rfqs - Get RFQs
app.get('/api/rfqs', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rfqs ORDER BY created_at DESC;');
    res.json({ success: true, rfqs: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 10. GET /api/orders - Get Orders
app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC;');
    res.json({ success: true, orders: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 11. GET /api/payments - Get Payments
app.get('/api/payments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM payments ORDER BY created_at DESC;');
    res.json({ success: true, payments: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 12. GET /api/reports/analytics - System Analytics & Summary
app.get('/api/reports/analytics', async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT role, count(*) FROM users WHERE is_deleted = FALSE GROUP BY role;');
    const ordersCount = await pool.query('SELECT count(*), coalesce(sum(total_amount), 0) as gross_revenue FROM orders;');
    const rfqsCount = await pool.query('SELECT count(*) FROM rfqs;');
    const productsCount = await pool.query('SELECT count(*) FROM products WHERE is_deleted = FALSE;');

    res.json({
      success: true,
      analytics: {
        usersByRole: usersCount.rows,
        grossRevenue: ordersCount.rows[0]?.gross_revenue || 18400000,
        totalOrders: ordersCount.rows[0]?.count || 0,
        totalRfqs: rfqsCount.rows[0]?.count || 0,
        totalProducts: productsCount.rows[0]?.count || 0,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 13. GET /api/captain/tasks - Fetch Captain Tasks
app.get('/api/captain/tasks', async (req, res) => {
  try {
    const { captainId } = req.query;
    const query = captainId
      ? 'SELECT * FROM captain_tasks WHERE captain_id = $1 ORDER BY created_at DESC;'
      : 'SELECT * FROM captain_tasks ORDER BY created_at DESC;';
    const params = captainId ? [captainId] : [];
    const result = await pool.query(query, params);
    res.json({ success: true, tasks: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 14. POST /api/captain/tasks - Create Captain Task
app.post('/api/captain/tasks', async (req, res) => {
  try {
    const { captainId, sellerId, title, description, dueDate, priority } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, error: 'Task Title is required.' });
    }
    const taskId = `TSK-${Math.floor(100 + Math.random() * 900)}`;
    await pool.query(
      `INSERT INTO captain_tasks (id, captain_id, seller_id, title, description, due_date, status, priority)
       VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', $7)`,
      [taskId, captainId || 'USR-CAP-201', sellerId, title, description, dueDate || new Date(), priority || 'MEDIUM']
    );
    res.json({ success: true, message: 'Task created successfully!', taskId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 15. PUT /api/captain/tasks/:id - Update Task Status
app.put('/api/captain/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query('UPDATE captain_tasks SET status = $1 WHERE id = $2', [status, id]);
    res.json({ success: true, message: `Task status updated to ${status}` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 16. GET /api/captain/followups - Fetch Seller Follow-up Notes
app.get('/api/captain/followups', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM seller_followups ORDER BY created_at DESC;');
    res.json({ success: true, followups: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 17. POST /api/captain/followups - Add Follow-up Note
app.post('/api/captain/followups', async (req, res) => {
  try {
    const { captainId, sellerId, notes, nextFollowupDate } = req.body;
    if (!notes) {
      return res.status(400).json({ success: false, error: 'Follow-up Note text is required.' });
    }
    const followupId = `FLP-${Math.floor(100 + Math.random() * 900)}`;
    await pool.query(
      `INSERT INTO seller_followups (id, captain_id, seller_id, notes, next_followup_date)
       VALUES ($1, $2, $3, $4, $5)`,
      [followupId, captainId || 'USR-CAP-201', sellerId, notes, nextFollowupDate || new Date()]
    );
    res.json({ success: true, message: 'Follow-up note saved!', followupId });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 18. GET /api/captain/attendance - Fetch Captain Attendance History
app.get('/api/captain/attendance', async (req, res) => {
  try {
    const { captainId } = req.query;
    const query = captainId
      ? 'SELECT * FROM captain_attendance WHERE captain_id = $1 ORDER BY created_at DESC;'
      : 'SELECT * FROM captain_attendance ORDER BY created_at DESC;';
    const params = captainId ? [captainId] : [];
    const result = await pool.query(query, params);
    res.json({ success: true, attendance: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 19. POST /api/captain/punch-in - Captain GPS Punch In
app.post('/api/captain/punch-in', async (req, res) => {
  try {
    const { captainId, location } = req.body;
    const attId = `ATT-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    const result = await pool.query(
      `INSERT INTO captain_attendance (id, captain_id, date, punch_in_time, punch_in_location, status)
       VALUES ($1, $2, CURRENT_DATE, $3, $4, 'PUNCHED_IN') RETURNING *`,
      [attId, captainId || 'USR-CAP-201', now, location || 'GPS Location Captured']
    );
    console.log(`📍 [PostgreSQL DB] Captain ${captainId || 'USR-CAP-201'} Punched In:`, location);
    res.json({ success: true, message: 'Punched In Successfully!', record: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 20. POST /api/captain/punch-out - Captain GPS Punch Out
app.post('/api/captain/punch-out', async (req, res) => {
  try {
    const { id, location, totalHours } = req.body;
    const now = new Date();
    const result = await pool.query(
      `UPDATE captain_attendance 
       SET punch_out_time = $1, punch_out_location = $2, total_hours = $3, status = 'PUNCHED_OUT'
       WHERE id = $4 RETURNING *`,
      [now, location || 'GPS Location Captured', totalHours || '8 hrs', id]
    );
    console.log(`📍 [PostgreSQL DB] Captain Punched Out ID ${id}:`, totalHours);
    res.json({ success: true, message: 'Punched Out Successfully!', record: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 21. GET /api/captain/field-products - Fetch Captain Collected Field Products with Real Captain Name
app.get('/api/captain/field-products', async (req, res) => {
  try {
    const { captainId } = req.query;
    const query = captainId
      ? `SELECT cfp.*, CONCAT(u.first_name, ' ', u.last_name) AS captain_name
         FROM captain_field_products cfp
         LEFT JOIN users u ON cfp.captain_id = u.id
         WHERE cfp.captain_id = $1
         ORDER BY cfp.created_at DESC;`
      : `SELECT cfp.*, CONCAT(u.first_name, ' ', u.last_name) AS captain_name
         FROM captain_field_products cfp
         LEFT JOIN users u ON cfp.captain_id = u.id
         ORDER BY cfp.created_at DESC;`;
    const params = captainId ? [captainId] : [];
    const result = await pool.query(query, params);
    res.json({ success: true, products: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 22. POST /api/captain/field-products - Submit Field Product Collection Entry
app.post('/api/captain/field-products', async (req, res) => {
  try {
    const { id, captainId, name, category, subCategory, price, color, imageUrl, colorImageUrl } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, error: 'Product Name, Category, and Price are required.' });
    }

    const prdId = id || `FPRD-${Math.floor(100 + Math.random() * 900)}`;
    const result = await pool.query(
      `INSERT INTO captain_field_products (id, captain_id, name, category, sub_category, price, color, image_url, color_image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'PENDING')
       ON CONFLICT (id) DO UPDATE SET name = $3, price = $6, color = $7 RETURNING *`,
      [
        prdId,
        captainId || 'USR-CAP-201',
        name.trim(),
        category,
        subCategory || 'General',
        parseFloat(price),
        color || 'Standard',
        imageUrl || null,
        colorImageUrl || null
      ]
    );

    console.log(`🛍️ [PostgreSQL DB] Captain Field Product Submitted: ${name} (ID: ${prdId}, ₹${price})`);
    res.json({ success: true, message: 'Field Product Saved to PostgreSQL DB!', product: result.rows[0] });
  } catch (err) {
    console.error('Error inserting field product:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 23. PUT /api/admin/field-products/:id/status - Admin Approve or Reject Field Product
app.put('/api/admin/field-products/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const result = await pool.query(
      `UPDATE captain_field_products SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    console.log(`🛡️ [PostgreSQL DB] Admin updated Field Product ${id} Status to ${status}`);
    res.json({ success: true, message: `Field product status updated to ${status}`, product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// STATIC FILES & SPA FALLBACK
// ============================================================================
app.use(express.static(path.join(__dirname, '../dist')));

app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    return res.sendFile(path.join(__dirname, '../dist/index.html'));
  }
  next();
});

// Start Server on 0.0.0.0
app.listen(PORT, '0.0.0.0', async () => {
  console.log(`\n===========================================================`);
  console.log(`🚀 Jaxmart UNIFIED SERVER RUNNING ON: http://localhost:${PORT}`);
  console.log(`🔗 Database Engine: PostgreSQL (Port 5432 / captain DB)`);
  console.log(`===========================================================\n`);
  await initializeDbSchema();
});


