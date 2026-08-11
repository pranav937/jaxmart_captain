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
app.use(express.json());

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Jadequest%403009@localhost:5432/captain?schema=public";

const pool = new Pool({
  connectionString: connectionString,
});

// Initialize PostgreSQL Database Tables
async function initializeDbSchema() {
  try {
    const client = await pool.connect();
    console.log('📡 Connecting Server to PostgreSQL database...');

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
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Seed baseline Super Admin & Admin if empty
    const countRes = await client.query('SELECT COUNT(*) FROM users;');
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      console.log('🌱 Seeding PostgreSQL database baseline accounts...');
      await client.query(`
        INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url) VALUES
        ('USR-SA-001', 'Jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
        ('USR-ADM-101', 'jaxmart@gmail.com', '+91 98220 11223', '123456', 'Jaxmart', 'Admin', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150');
      `);
    }

    client.release();
    console.log('✅ PostgreSQL Database Tables Initialized & Ready!');
  } catch (err) {
    console.error('⚠️ PostgreSQL Connection Error:', err.message);
  }
}

// ============================================================================
// CENTRAL REST API ROUTES
// ============================================================================

// 1. GET /api/users - Fetch Users from PostgreSQL
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users ORDER BY created_at DESC;');
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
      createdDate: r.created_at ? new Date(r.created_at).toISOString().split('T')[0] : '2026-08-11',
      lastLogin: 'Active'
    }));
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. POST /api/captain/register - Register Captain into PostgreSQL Database
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
      `INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url)
       VALUES ($1, $2, $3, $4, $5, $6, 'CAPTAIN', 'INACTIVE', $7)`,
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

    console.log(`\n==========================================`);
    console.log(`👨‍✈️ [POSTGRESQL CAPTAIN REGISTERED]: ${name} (${formattedEmail})`);
    console.log(`==========================================\n`);

    res.json({
      success: true,
      message: 'Captain registered successfully in PostgreSQL database! Pending Admin Activation.',
      user: { id: newId, name, email: formattedEmail, role: 'CAPTAIN', status: 'INACTIVE' }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. POST /api/users/status - Update User Status in PostgreSQL (Admin Activation/Deactivation)
app.post('/api/users/status', async (req, res) => {
  try {
    const { id, newStatus } = req.body;
    if (!id || !newStatus) {
      return res.status(400).json({ success: false, error: 'User ID and newStatus are required.' });
    }
    await pool.query('UPDATE users SET status = $1 WHERE id = $2', [newStatus, id]);
    console.log(`🌐 [ADMIN ACTION]: PostgreSQL User ID ${id} status updated to -> ${newStatus}`);
    res.json({ success: true, message: `Status updated to ${newStatus}` });
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
