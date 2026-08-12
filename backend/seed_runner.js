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
      ('USR-SA-001', 'Jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
      ('USR-SA-002', 'superadmin@jaxmart.com', '+91 99999 88888', '123456', 'Main', 'SuperAdmin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE),
      ('USR-ADM-101', 'jaxmart@gmail.com', '+91 98220 11223', '123456', 'Jaxmart', 'Admin', 'ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', FALSE),
      ('USR-CAP-201', 'amit.captain@jaxmart.com', '+91 97112 33445', '123456', 'Amit', 'Verma', 'CAPTAIN', 'ACTIVE', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', FALSE),
      ('USR-SEL-301', 'contact@abctraders.in', '+91 91234 56789', '123456', 'Rajesh', 'Mehta', 'SELLER', 'ACTIVE', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', FALSE),
      ('USR-CUST-401', 'customer@reliancestores.com', '+91 98111 22334', '123456', 'Sanjay', 'Patel', 'CUSTOMER', 'ACTIVE', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', FALSE)
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

    // 3. Products
    await client.query(`
      INSERT INTO products (id, name, sku, category_id, seller_id, price, stock, status, is_deleted) VALUES
      ('PRD-101', 'Heavy Duty Angle Grinder 850W', 'SKU-TOOL-001', 'CAT-001', 'USR-SEL-301', 3499.00, 120, 'APPROVED', FALSE),
      ('PRD-102', 'Industrial Circuit Breaker 63A 4P', 'SKU-ELEC-002', 'CAT-002', 'USR-SEL-301', 1250.00, 450, 'APPROVED', FALSE),
      ('PRD-103', 'Steel Toe Executive Safety Boots', 'SKU-SAFE-003', 'CAT-003', 'USR-SEL-301', 1899.00, 200, 'APPROVED', FALSE)
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. RFQs
    await client.query(`
      INSERT INTO rfqs (id, rfq_number, customer_name, seller_id, product_name, quantity, status, notes) VALUES
      ('RFQ-501', 'RFQ-2026-001', 'Reliance Industrial Infra', 'USR-SEL-301', 'Heavy Duty Angle Grinder 850W', 50, 'QUOTED', 'Urgent bulk requirement for plant expansion')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Orders
    await client.query(`
      INSERT INTO orders (id, order_number, customer_name, seller_id, total_amount, payment_status, order_status) VALUES
      ('ORD-701', 'ORD-2026-8801', 'Reliance Industrial Infra', 'USR-SEL-301', 165000.00, 'PAID', 'DELIVERED')
      ON CONFLICT (id) DO NOTHING;
    `);

    // 6. Payments
    await client.query(`
      INSERT INTO payments (id, payment_number, order_id, amount, payment_method, status, transaction_ref) VALUES
      ('PAY-801', 'PAY-2026-9901', 'ORD-701', 165000.00, 'BANK_TRANSFER', 'COMPLETED', 'TXN-HDFC-998811')
      ON CONFLICT (id) DO NOTHING;
    `);

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
