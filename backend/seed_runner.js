import pg from 'pg';

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL || "postgresql://postgres:Jadequest%403009@localhost:5432/captain?schema=public";

const pool = new Pool({ connectionString });

async function runSeed() {
  try {
    const client = await pool.connect();
    console.log('🚀 Seeding PostgreSQL database `captain` with all initial sample accounts & records...');

    // 0. DDL Table Creation
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

      CREATE TABLE IF NOT EXISTS categories (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          slug VARCHAR(100) NOT NULL UNIQUE,
          parent_id VARCHAR(64),
          description TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

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

    // 1. Users Table Seed
    await client.query(`
      INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted) VALUES
      ('USR-SA-001', 'Jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 2. Categories
    await client.query(`
      INSERT INTO categories (id, name, slug, description) VALUES
      ('CAT-001', 'Industrial Hardware', 'industrial-hardware', 'Heavy duty industrial tools and machinery'),
      ('CAT-002', 'Electrical & Electronics', 'electrical-electronics', 'Circuit breakers, cables, switches & industrial electronics'),
      ('CAT-003', 'Safety Gear & PPE', 'safety-ppe', 'Helmets, safety goggles, gloves and boots')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Categories Only
    console.log('✅ Baseline seed runner completed with 0 fake products.');

    const usersCount = await client.query('SELECT count(*) FROM users;');
    console.log(`✅ Seeding Complete! Total users now in PostgreSQL DB: ${usersCount.rows[0].count}`);

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding Error:', err.message);
    process.exit(1);
  }
}

runSeed();
