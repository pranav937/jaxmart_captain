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
import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;
const app = express();
const PORT = process.env.PORT || 5000;

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
          status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
          keywords JSONB DEFAULT '[]'::jsonb,
          aliases JSONB DEFAULT '[]'::jsonb,
          hsn_code VARCHAR(32),
          suggested_by VARCHAR(64),
          reviewed_by VARCHAR(64),
          reviewed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE categories ADD COLUMN IF NOT EXISTS status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE';
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS keywords JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS aliases JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(32);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS suggested_by VARCHAR(64);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(64);
      ALTER TABLE categories ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;
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
          captain_id VARCHAR(64),
          company_id VARCHAR(64),
          company_name VARCHAR(255),
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

      ALTER TABLE captain_field_products ADD COLUMN IF NOT EXISTS company_id VARCHAR(64);
      ALTER TABLE captain_field_products ADD COLUMN IF NOT EXISTS company_name VARCHAR(255);
    `);

    // 11. Captain Onboarded Company Master & Sub-Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS companies (
          id VARCHAR(64) PRIMARY KEY,
          captain_id VARCHAR(64),
          company_name VARCHAR(255) NOT NULL,
          legal_name VARCHAR(255),
          company_type VARCHAR(100),
          brand_name VARCHAR(100),
          registration_no VARCHAR(100),
          owner_name VARCHAR(255),
          gstin VARCHAR(64),
          pan VARCHAR(32),
          country VARCHAR(100) DEFAULT 'India',
          state VARCHAR(100),
          city VARCHAR(100),
          address TEXT,
          website VARCHAR(255),
          contact_person VARCHAR(255),
          phone VARCHAR(32),
          mobile VARCHAR(32),
          email VARCHAR(255),
          payment_terms VARCHAR(100) DEFAULT '30 Days',
          credit_limit VARCHAR(100) DEFAULT '₹10,00,000',
          rating VARCHAR(10) DEFAULT 'A',
          selling_categories TEXT,
          status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='legal_name') THEN
          ALTER TABLE companies ADD COLUMN legal_name VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='company_type') THEN
          ALTER TABLE companies ADD COLUMN company_type VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='brand_name') THEN
          ALTER TABLE companies ADD COLUMN brand_name VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='registration_no') THEN
          ALTER TABLE companies ADD COLUMN registration_no VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='pan') THEN
          ALTER TABLE companies ADD COLUMN pan VARCHAR(32);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='country') THEN
          ALTER TABLE companies ADD COLUMN country VARCHAR(100) DEFAULT 'India';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='state') THEN
          ALTER TABLE companies ADD COLUMN state VARCHAR(100);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='address') THEN
          ALTER TABLE companies ADD COLUMN address TEXT;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='website') THEN
          ALTER TABLE companies ADD COLUMN website VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='contact_person') THEN
          ALTER TABLE companies ADD COLUMN contact_person VARCHAR(255);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='phone') THEN
          ALTER TABLE companies ADD COLUMN phone VARCHAR(32);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='payment_terms') THEN
          ALTER TABLE companies ADD COLUMN payment_terms VARCHAR(100) DEFAULT '30 Days';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='credit_limit') THEN
          ALTER TABLE companies ADD COLUMN credit_limit VARCHAR(100) DEFAULT '₹10,00,000';
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='companies' AND column_name='rating') THEN
          ALTER TABLE companies ADD COLUMN rating VARCHAR(10) DEFAULT 'A';
        END IF;
      END $$;

      CREATE TABLE IF NOT EXISTS company_addresses (
          id VARCHAR(64) PRIMARY KEY,
          company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
          address_type VARCHAR(50) NOT NULL,
          address_line1 TEXT NOT NULL,
          address_line2 TEXT,
          city VARCHAR(100),
          state VARCHAR(100),
          pincode VARCHAR(20),
          country VARCHAR(100) DEFAULT 'India',
          is_primary BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_contacts (
          id VARCHAR(64) PRIMARY KEY,
          company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          designation VARCHAR(100),
          phone VARCHAR(32),
          email VARCHAR(255),
          is_primary BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_documents (
          id VARCHAR(64) PRIMARY KEY,
          company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
          doc_type VARCHAR(100) NOT NULL,
          doc_number VARCHAR(100),
          file_url TEXT,
          status VARCHAR(32) DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_bank_accounts (
          id VARCHAR(64) PRIMARY KEY,
          company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
          account_name VARCHAR(255) NOT NULL,
          bank_name VARCHAR(255) NOT NULL,
          account_number VARCHAR(100) NOT NULL,
          ifsc_code VARCHAR(32) NOT NULL,
          branch VARCHAR(100),
          account_type VARCHAR(50) DEFAULT 'Current',
          is_primary BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS company_certifications (
          id VARCHAR(64) PRIMARY KEY,
          company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
          cert_name VARCHAR(255) NOT NULL,
          cert_number VARCHAR(100),
          issuing_authority VARCHAR(255),
          valid_till VARCHAR(50),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- 12. Product Master (Product Family) Table
      CREATE TABLE IF NOT EXISTS product_masters (
          id VARCHAR(64) PRIMARY KEY,
          company_id VARCHAR(64) REFERENCES companies(id) ON DELETE CASCADE,
          company_name VARCHAR(255),
          captain_id VARCHAR(64),
          product_name VARCHAR(255) NOT NULL,
          category VARCHAR(100) NOT NULL,
          sub_category VARCHAR(100) NOT NULL,
          product_type VARCHAR(100) NOT NULL,
          description TEXT,
          base_uom VARCHAR(32) NOT NULL DEFAULT 'KG',
          industry VARCHAR(100),
          status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='captain_field_products' AND column_name='product_master_id') THEN
          ALTER TABLE captain_field_products ADD COLUMN product_master_id VARCHAR(64);
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='product_masters' AND column_name='image_url') THEN
          ALTER TABLE product_masters ADD COLUMN image_url TEXT;
        END IF;
      END $$;
    `);

    // Seed baseline accounts into PostgreSQL database if missing
    await client.query(`
      INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted) VALUES
      ('USR-SA-001', 'jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
      ('USR-ADM-101', 'admin@jaxmart.com', '+91 98111 22233', '123456', 'Operations', 'Admin', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', FALSE),
      ('USR-CAP-201', 'captain@jaxmart.com', '+91 91069 99252', '123456', 'Ansh', 'Patel', 'CAPTAIN', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', FALSE)
      ON CONFLICT (id) DO NOTHING;
    `);

    // Seed baseline companies into PostgreSQL database if missing
    await client.query(`
      INSERT INTO companies (id, captain_id, company_name, owner_name, gstin, mobile, email, city, selling_categories, status, legal_name) VALUES
      ('COMP-6018', 'USR-CAP-201', 'pipaliya pvt', 'pipaliya pvt Owner', '24AAAAA0000A1Z5', '9106999252', 'contact@pipaliya.com', 'Ahmedabad', 'Hardware, Steel', 'APPROVED', 'pipaliya pvt'),
      ('COMP-8276', 'USR-CAP-201', 'jaxmart pvt', 'jaxmart pvt Owner', '24AAAAA0000A1Z5', '9106999252', 'contact@jaxmart.com', 'Ahmedabad', 'Industrial Supplies', 'APPROVED', 'jaxmart pvt')
      ON CONFLICT (id) DO NOTHING;
    `);

    client.release();
    console.log('✅ PostgreSQL Database Tables & Baseline Accounts/Companies Seeded!');
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

// ============================================================================
// DYNAMIC AI CATEGORY REST API ENDPOINTS
// ============================================================================

// GET /api/categories/tree - Fetch category hierarchy
app.get('/api/categories/tree', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categories ORDER BY created_at ASC');
    const categories = result.rows;
    const tree = [];
    const map = {};
    categories.forEach(c => {
      map[c.id] = { ...c, subCategories: [] };
    });
    categories.forEach(c => {
      if (c.parent_id && map[c.parent_id]) {
        map[c.parent_id].subCategories.push(map[c.id]);
      } else {
        tree.push(map[c.id]);
      }
    });
    res.json({ success: true, tree, raw: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories/suggest - Suggest category path for product name
app.post('/api/categories/suggest', async (req, res) => {
  try {
    const { productName } = req.body;
    if (!productName) return res.status(400).json({ success: false, error: 'productName is required' });

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ success: false, error: 'Gemini API Key missing in environment' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      generationConfig: {
        temperature: 0.0,
      }
    });

    // Fetch existing categories to give AI context
    const existingRes = await pool.query('SELECT id, name, parent_id FROM categories');

    // Build full paths for context
    const cats = existingRes.rows;
    const catMap = new Map(cats.map(c => [c.id, c]));
    const paths = [];

    for (const c of cats) {
      let path = c.name;
      let current = c;
      while (current.parent_id && catMap.has(current.parent_id)) {
        current = catMap.get(current.parent_id);
        path = current.name + ' > ' + path;
      }
      paths.push(path);
    }

    const existingCats = paths.sort().join('\n');

    const prompt = `You are a B2B marketplace category expert (like IndiaMART).
User is trying to onboard a product: "${productName}"
Your job is to determine the best category hierarchy (up to 4 levels).
Level 1: Broad Industry
Level 2: Sub Industry
Level 3: Product Category
Level 4: Micro Category (MCAT)

CRITICAL INSTRUCTION FOR CONSISTENCY:
Here are the existing category paths currently in the database:
${existingCats || '(Database is currently empty)'}

You MUST reuse these EXACT existing category names if the product fits into them. Do NOT invent new synonyms (e.g., if "Building & Construction" exists, do not output "Construction Materials"). Only suggest brand new categories if none of the existing ones fit.

If the product name is highly ambiguous (e.g. just "soda" could mean baking soda or drinking soda, "red box" could mean anything), you MUST ask a clarifying question.

Return ONLY a valid JSON object in this format:
{
  "isAmbiguous": boolean,
  "clarifyingQuestion": "your question here if ambiguous, otherwise null",
  "suggestedPath": ["Level 1", "Level 2", "Level 3", "Level 4"] (only if not ambiguous),
  "confidence": number (0.0 to 1.0)
}
Do not return any markdown formatting around the JSON, just the raw JSON object.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();

    let aiResponse;
    try {
      aiResponse = JSON.parse(text);
    } catch (e) {
      console.error("AI JSON Parse Error:", text);
      return res.status(500).json({ success: false, error: 'Failed to parse AI response' });
    }

    if (aiResponse.isAmbiguous && aiResponse.clarifyingQuestion) {
      return res.json({
        success: true,
        isAmbiguous: true,
        clarifyingQuestion: aiResponse.clarifyingQuestion
      });
    }

    const suggestedPathNames = aiResponse.suggestedPath || [];

    // Check which exist in DB
    const pathNodes = [];
    let currentParentId = null;

    for (const name of suggestedPathNames) {
      let query = 'SELECT id, name FROM categories WHERE name ILIKE $1';
      let params = [name];
      if (currentParentId) {
        query += ' AND parent_id = $2';
        params.push(currentParentId);
      } else {
        query += ' AND parent_id IS NULL';
      }
      const existing = await pool.query(query, params);
      if (existing.rows.length > 0) {
        pathNodes.push({ name, id: existing.rows[0].id, exists: true });
        currentParentId = existing.rows[0].id;
      } else {
        pathNodes.push({ name, id: null, exists: false });
      }
    }

    res.json({
      success: true,
      isAmbiguous: false,
      suggestedPath: pathNodes,
      confidence: aiResponse.confidence || 0.9
    });
  } catch (err) {
    console.error("Suggest API Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/categories/create-path - Auto-create missing categories
app.post('/api/categories/create-path', async (req, res) => {
  try {
    const { path, suggestedBy } = req.body;
    if (!path || !Array.isArray(path)) return res.status(400).json({ success: false, error: 'path array is required' });

    let currentParentId = null;
    const finalPath = [];

    for (let i = 0; i < path.length; i++) {
      const node = path[i];
      if (node.exists && node.id) {
        currentParentId = node.id;
        finalPath.push(node);
      } else {
        const id = 'CAT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        const slug = node.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

        await pool.query(
          `INSERT INTO categories (id, name, slug, parent_id, status, suggested_by) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [id, node.name, slug, currentParentId, 'PENDING_REVIEW', suggestedBy || 'SYSTEM']
        );

        console.log(`🛡️ [PostgreSQL DB] Auto-created Category: ${node.name} (${id})`);
        currentParentId = id;
        finalPath.push({ name: node.name, id, exists: true, newlyCreated: true });
      }
    }

    res.json({ success: true, finalPath, categoryId: currentParentId });
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
    const { id, captainId, companyId, companyName, name, category, subCategory, price, color, imageUrl, colorImageUrl } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ success: false, error: 'Product Name, Category, and Price are required.' });
    }

    const prdId = id || `FPRD-${Math.floor(100 + Math.random() * 900)}`;
    const result = await pool.query(
      `INSERT INTO captain_field_products (id, captain_id, company_id, company_name, name, category, sub_category, price, color, image_url, color_image_url, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'PENDING')
       ON CONFLICT (id) DO UPDATE SET name = $5, price = $8, color = $9 RETURNING *`,
      [
        prdId,
        captainId || 'USR-CAP-201',
        companyId || null,
        companyName || null,
        name.trim(),
        category,
        subCategory || 'General',
        parseFloat(price),
        color || 'Standard',
        imageUrl || null,
        colorImageUrl || null
      ]
    );

    console.log(`🛍️ [PostgreSQL DB] Captain Field Product Submitted: ${name} under Company ${companyName || 'General'} (ID: ${prdId}, ₹${price})`);
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

// 24. GET /api/captain/companies - Fetch Captain Onboarded Companies
app.get('/api/captain/companies', async (req, res) => {
  try {
    const { captainId } = req.query;
    const query = captainId
      ? `SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) AS captain_name
         FROM companies c
         LEFT JOIN users u ON c.captain_id = u.id
         WHERE c.captain_id = $1
         ORDER BY c.created_at DESC;`
      : `SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) AS captain_name
         FROM companies c
         LEFT JOIN users u ON c.captain_id = u.id
         ORDER BY c.created_at DESC;`;
    const params = captainId ? [captainId] : [];
    const result = await pool.query(query, params);

    // Map database snake_case to frontend camelCase
    const formatted = result.rows.map(r => ({
      id: r.id,
      captainId: r.captain_id,
      captainName: r.captain_name || 'Captain',
      companyName: r.company_name,
      legalName: r.legal_name || r.company_name,
      companyType: r.company_type || 'Manufacturer',
      brandName: r.brand_name || '',
      registrationNo: r.registration_no || '',
      ownerName: r.owner_name || r.contact_person || '',
      gstin: r.gstin || '',
      pan: r.pan || '',
      country: r.country || 'India',
      state: r.state || '',
      city: r.city || '',
      address: r.address || '',
      website: r.website || '',
      contactPerson: r.contact_person || r.owner_name || '',
      phone: r.phone || r.mobile || '',
      mobile: r.mobile || r.phone || '',
      email: r.email || '',
      paymentTerms: r.payment_terms || '30 Days',
      creditLimit: r.credit_limit || '₹10,00,000',
      rating: r.rating || 'A',
      sellingCategories: r.selling_categories || 'General',
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    }));

    res.json({ success: true, companies: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 24b. GET /api/captain/companies/:id - Fetch Single Master Company with all Sub-tables
app.get('/api/captain/companies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cmpRes = await pool.query(
      `SELECT c.*, CONCAT(u.first_name, ' ', u.last_name) AS captain_name
       FROM companies c
       LEFT JOIN users u ON c.captain_id = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (cmpRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Company not found' });
    }

    const r = cmpRes.rows[0];

    const [addrsRes, contactsRes, docsRes, bankRes, certsRes] = await Promise.all([
      pool.query(`SELECT * FROM company_addresses WHERE company_id = $1 ORDER BY created_at ASC`, [id]),
      pool.query(`SELECT * FROM company_contacts WHERE company_id = $1 ORDER BY created_at ASC`, [id]),
      pool.query(`SELECT * FROM company_documents WHERE company_id = $1 ORDER BY created_at ASC`, [id]),
      pool.query(`SELECT * FROM company_bank_accounts WHERE company_id = $1 ORDER BY created_at ASC`, [id]),
      pool.query(`SELECT * FROM company_certifications WHERE company_id = $1 ORDER BY created_at ASC`, [id])
    ]);

    const companyDetail = {
      id: r.id,
      captainId: r.captain_id,
      captainName: r.captain_name || 'Captain',
      companyName: r.company_name,
      legalName: r.legal_name || r.company_name,
      companyType: r.company_type || 'Manufacturer',
      brandName: r.brand_name || '',
      registrationNo: r.registration_no || '',
      ownerName: r.owner_name || r.contact_person || '',
      gstin: r.gstin || '',
      pan: r.pan || '',
      country: r.country || 'India',
      state: r.state || '',
      city: r.city || '',
      address: r.address || '',
      website: r.website || '',
      contactPerson: r.contact_person || r.owner_name || '',
      phone: r.phone || r.mobile || '',
      mobile: r.mobile || r.phone || '',
      email: r.email || '',
      paymentTerms: r.payment_terms || '30 Days',
      creditLimit: r.credit_limit || '₹10,00,000',
      rating: r.rating || 'A',
      sellingCategories: r.selling_categories || 'General',
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      addresses: addrsRes.rows.map(a => ({
        id: a.id,
        addressType: a.address_type,
        addressLine1: a.address_line1,
        addressLine2: a.address_line2,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
        country: a.country,
        isPrimary: a.is_primary
      })),
      contacts: contactsRes.rows.map(ct => ({
        id: ct.id,
        name: ct.name,
        designation: ct.designation,
        phone: ct.phone,
        email: ct.email,
        isPrimary: ct.is_primary
      })),
      documents: docsRes.rows.map(d => ({
        id: d.id,
        docType: d.doc_type,
        docNumber: d.doc_number,
        fileUrl: d.file_url,
        status: d.status
      })),
      bankAccounts: bankRes.rows.map(b => ({
        id: b.id,
        accountName: b.account_name,
        bankName: b.bank_name,
        accountNumber: b.account_number,
        ifscCode: b.ifsc_code,
        branch: b.branch,
        accountType: b.account_type,
        isPrimary: b.is_primary
      })),
      certifications: certsRes.rows.map(cert => ({
        id: cert.id,
        certName: cert.cert_name,
        certNumber: cert.cert_number,
        issuingAuthority: cert.issuing_authority,
        validTill: cert.valid_till
      }))
    };

    res.json({ success: true, company: companyDetail });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 25. POST /api/captain/companies - Onboard Master Company & Sub-tables
app.post('/api/captain/companies', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const {
      id,
      captainId,
      companyName,
      legalName,
      companyType,
      brandName,
      registrationNo,
      ownerName,
      gstin,
      pan,
      country,
      state,
      city,
      address,
      website,
      contactPerson,
      phone,
      mobile,
      email,
      paymentTerms,
      creditLimit,
      rating,
      sellingCategories,
      addresses,
      contacts,
      documents,
      bankAccounts,
      certifications
    } = req.body;

    if (!companyName) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, error: 'Company Name is required.' });
    }

    const cmpId = id || `COMP-${Math.floor(1000 + Math.random() * 9000)}`;

    const insertResult = await client.query(
      `INSERT INTO companies (
        id, captain_id, company_name, legal_name, company_type, brand_name, registration_no,
        owner_name, gstin, pan, country, state, city, address, website, contact_person,
        phone, mobile, email, payment_terms, credit_limit, rating, selling_categories, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, 'PENDING')
       ON CONFLICT (id) DO UPDATE SET
        company_name = EXCLUDED.company_name,
        legal_name = EXCLUDED.legal_name,
        company_type = EXCLUDED.company_type,
        brand_name = EXCLUDED.brand_name,
        registration_no = EXCLUDED.registration_no,
        owner_name = EXCLUDED.owner_name,
        gstin = EXCLUDED.gstin,
        pan = EXCLUDED.pan,
        country = EXCLUDED.country,
        state = EXCLUDED.state,
        city = EXCLUDED.city,
        address = EXCLUDED.address,
        website = EXCLUDED.website,
        contact_person = EXCLUDED.contact_person,
        phone = EXCLUDED.phone,
        mobile = EXCLUDED.mobile,
        email = EXCLUDED.email,
        payment_terms = EXCLUDED.payment_terms,
        credit_limit = EXCLUDED.credit_limit,
        rating = EXCLUDED.rating,
        selling_categories = EXCLUDED.selling_categories
       RETURNING *`,
      [
        cmpId,
        captainId || 'USR-CAP-201',
        companyName.trim(),
        legalName || companyName.trim(),
        companyType || 'Manufacturer',
        brandName || '',
        registrationNo || '',
        ownerName || contactPerson || '',
        gstin || '',
        pan || '',
        country || 'India',
        state || 'Gujarat',
        city || 'Ahmedabad',
        address || '',
        website || '',
        contactPerson || ownerName || '',
        phone || mobile || '',
        mobile || phone || '',
        email || '',
        paymentTerms || '30 Days',
        creditLimit || '₹10,00,000',
        rating || 'A',
        sellingCategories || 'General Hardware'
      ]
    );

    // Insert Company Addresses
    if (Array.isArray(addresses) && addresses.length > 0) {
      for (const addr of addresses) {
        if (!addr.addressLine1) continue;
        const addrId = addr.id || `ADDR-${Math.floor(100 + Math.random() * 900)}`;
        await client.query(
          `INSERT INTO company_addresses (id, company_id, address_type, address_line1, address_line2, city, state, pincode, country, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            addrId,
            cmpId,
            addr.addressType || 'Registered',
            addr.addressLine1,
            addr.addressLine2 || '',
            addr.city || city || '',
            addr.state || state || '',
            addr.pincode || '',
            addr.country || country || 'India',
            addr.isPrimary || false
          ]
        );
      }
    }

    // Insert Company Contacts
    if (Array.isArray(contacts) && contacts.length > 0) {
      for (const ct of contacts) {
        if (!ct.name) continue;
        const ctId = ct.id || `CNT-${Math.floor(100 + Math.random() * 900)}`;
        await client.query(
          `INSERT INTO company_contacts (id, company_id, name, designation, phone, email, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            ctId,
            cmpId,
            ct.name,
            ct.designation || 'Manager',
            ct.phone || '',
            ct.email || '',
            ct.isPrimary || false
          ]
        );
      }
    }

    // Insert Company Documents
    if (Array.isArray(documents) && documents.length > 0) {
      for (const doc of documents) {
        if (!doc.docType) continue;
        const docId = doc.id || `DOC-${Math.floor(100 + Math.random() * 900)}`;
        await client.query(
          `INSERT INTO company_documents (id, company_id, doc_type, doc_number, file_url, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            docId,
            cmpId,
            doc.docType,
            doc.docNumber || '',
            doc.fileUrl || '',
            doc.status || 'PENDING'
          ]
        );
      }
    }

    // Insert Company Bank Accounts
    if (Array.isArray(bankAccounts) && bankAccounts.length > 0) {
      for (const bank of bankAccounts) {
        if (!bank.accountNumber) continue;
        const bankId = bank.id || `BNK-${Math.floor(100 + Math.random() * 900)}`;
        await client.query(
          `INSERT INTO company_bank_accounts (id, company_id, account_name, bank_name, account_number, ifsc_code, branch, account_type, is_primary)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            bankId,
            cmpId,
            bank.accountName || companyName,
            bank.bankName,
            bank.accountNumber,
            bank.ifscCode,
            bank.branch || '',
            bank.accountType || 'Current',
            bank.isPrimary || false
          ]
        );
      }
    }

    // Insert Company Certifications
    if (Array.isArray(certifications) && certifications.length > 0) {
      for (const cert of certifications) {
        if (!cert.certName) continue;
        const certId = cert.id || `CRT-${Math.floor(100 + Math.random() * 900)}`;
        await client.query(
          `INSERT INTO company_certifications (id, company_id, cert_name, cert_number, issuing_authority, valid_till)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            certId,
            cmpId,
            cert.certName,
            cert.certNumber || '',
            cert.issuingAuthority || '',
            cert.validTill || ''
          ]
        );
      }
    }

    await client.query('COMMIT');
    console.log(`🏢 [PostgreSQL DB] Captain Master Company Onboarded: ${companyName} (${cmpId}) with sub-tables!`);

    res.json({
      success: true,
      message: 'Master Company Profile Onboarded Successfully & Sent for Admin Approval!',
      company: insertResult.rows[0]
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error onboarding master company:', err.message);
    res.status(500).json({ success: false, error: err.message });
  } finally {
    client.release();
  }
});


// 26. PUT /api/admin/companies/:id/status - Admin Approve or Reject Company Onboarding
app.put('/api/admin/companies/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const result = await pool.query(
      `UPDATE companies SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    console.log(`🛡️ [PostgreSQL DB] Admin updated Company ${id} Status to ${status}`);
    res.json({ success: true, message: `Company status updated to ${status}`, company: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ============================================================================
// PRODUCT MASTER (PRODUCT FAMILY) REST API ENDPOINTS
// ============================================================================

// 27. GET /api/captain/product-masters - Fetch Product Families
app.get('/api/captain/product-masters', async (req, res) => {
  try {
    const { captainId, companyId } = req.query;
    let query = `
      SELECT pm.*, 
             CONCAT(u.first_name, ' ', u.last_name) AS captain_name,
             c.company_name AS fetched_company_name,
             (SELECT COUNT(*) FROM captain_field_products cfp WHERE cfp.product_master_id = pm.id) AS skus_count
      FROM product_masters pm
      LEFT JOIN users u ON pm.captain_id = u.id
      LEFT JOIN companies c ON pm.company_id = c.id
    `;

    const conditions = [];
    const params = [];

    if (captainId) {
      params.push(captainId);
      conditions.push(`pm.captain_id = $${params.length}`);
    }
    if (companyId) {
      params.push(companyId);
      conditions.push(`pm.company_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY pm.created_at DESC;`;

    const result = await pool.query(query, params);

    const formatted = result.rows.map(r => ({
      id: r.id,
      companyId: r.company_id,
      companyName: (r.company_name && r.company_name !== 'Company') ? r.company_name : (r.fetched_company_name || r.company_name || 'General Company'),
      captainId: r.captain_id,
      captainName: r.captain_name || 'Captain',
      productName: r.product_name,
      category: r.category,
      subCategory: r.sub_category,
      productType: r.product_type,
      description: r.description || '',
      baseUom: r.base_uom || 'KG',
      industry: r.industry || 'Construction',
      status: r.status,
      createdAt: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      skusCount: parseInt(r.skus_count || '0', 10)
    }));

    res.json({ success: true, productMasters: formatted });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 28. POST /api/captain/product-masters - Onboard Product Master (Product Family)
app.post('/api/captain/product-masters', async (req, res) => {
  try {
    const {
      companyId,
      companyName,
      captainId,
      productName,
      category,
      subCategory,
      productType,
      description,
      baseUom,
      industry,
      imageUrl
    } = req.body;

    if (!productName || !category || !companyId) {
      return res.status(400).json({ success: false, error: 'Company, Product Name, and Category are required.' });
    }

    const pmId = `PROD-${Math.floor(100000 + Math.random() * 900000)}`;

    const result = await pool.query(
      `INSERT INTO product_masters (
        id, company_id, company_name, captain_id, product_name, category, sub_category, product_type, description, base_uom, industry, image_url, status
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'PENDING')
       RETURNING *`,
      [
        pmId,
        companyId,
        companyName || 'Company',
        captainId || 'USR-CAP-201',
        productName.trim(),
        category,
        subCategory || category,
        productType || 'Standard',
        description || '',
        baseUom || 'KG',
        industry || 'General Industry',
        imageUrl || null
      ]
    );

    console.log(`📦 [PostgreSQL DB] Product Master Family Onboarded: ${productName} (ID: ${pmId}) under Company ${companyName}`);

    res.json({
      success: true,
      message: `Product Master "${productName}" created successfully & sent for Admin Approval!`,
      productMaster: result.rows[0]
    });
  } catch (err) {
    console.error('Error creating product master:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 29. PUT /api/admin/product-masters/:id/status - Admin Approve/Reject Product Master
app.put('/api/admin/product-masters/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'PENDING'
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required.' });
    }

    const result = await pool.query(
      `UPDATE product_masters SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    console.log(`🛡️ [PostgreSQL DB] Admin updated Product Master ${id} Status to ${status}`);
    res.json({ success: true, message: `Product Master status updated to ${status}`, productMaster: result.rows[0] });
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


