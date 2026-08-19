const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Jadequest%403009@localhost:5432/captain';
const pool = new Pool({ connectionString });

async function cleanup() {
  const client = await pool.connect();
  try {
    console.log('🧹 Starting Database Cleanup...');

    await client.query('DELETE FROM captain_field_products;');
    await client.query('DELETE FROM products;');
    await client.query('DELETE FROM product_masters;');
    if ((await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'sku_masters';")).rows.length > 0) {
      await client.query('DELETE FROM sku_masters;');
    }
    await client.query('DELETE FROM payments;');
    await client.query('DELETE FROM orders;');
    await client.query('DELETE FROM rfqs;');
    if ((await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'quotations';")).rows.length > 0) {
      await client.query('DELETE FROM quotations;');
    }
    console.log('✅ All Products, RFQs, Orders, and Payments deleted from database.');

    // 2. Delete captain-related records (attendance, tasks, followups)
    await client.query('DELETE FROM captain_attendance;');
    if ((await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'captain_tasks';")).rows.length > 0) {
      await client.query('DELETE FROM captain_tasks;');
    }
    if ((await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'seller_followups';")).rows.length > 0) {
      await client.query('DELETE FROM seller_followups;');
    }
    if ((await client.query("SELECT 1 FROM information_schema.tables WHERE table_name = 'captain_profiles';")).rows.length > 0) {
      await client.query('DELETE FROM captain_profiles;');
    }
    console.log('✅ Captain activity logs/attendance deleted.');

    // 3. Delete all users except single Super Admin USR-SA-001 (Jax@gmail.com)
    await client.query(`DELETE FROM users WHERE id != 'USR-SA-001';`);

    // Ensure USR-SA-001 Super Admin exists and is active
    await client.query(`
      INSERT INTO users (id, email, mobile, password_hash, first_name, last_name, role, status, avatar_url, is_deleted)
      VALUES ('USR-SA-001', 'Jax@gmail.com', '+91 98765 43210', '123456', 'Super', 'Admin', 'SUPER_ADMIN', 'ACTIVE', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', FALSE)
      ON CONFLICT (id) DO UPDATE SET 
        role = 'SUPER_ADMIN',
        status = 'ACTIVE',
        is_deleted = FALSE;
    `);

    console.log('✅ Deleted all Admins & Captains. Only 1 Super Admin (Jax@gmail.com) remains.');

    // Verify
    const usersCount = await client.query('SELECT id, email, first_name, last_name, role, status FROM users;');
    console.log('\n--- 👥 USERS TABLE AFTER CLEANUP ---');
    console.table(usersCount.rows);

    const prdCount = await client.query('SELECT count(*) FROM products;');
    const fieldPrdCount = await client.query('SELECT count(*) FROM captain_field_products;');
    console.log(`\n--- 🛍️ PRODUCTS COUNT AFTER CLEANUP ---`);
    console.log(`products: ${prdCount.rows[0].count}, captain_field_products: ${fieldPrdCount.rows[0].count}`);

    client.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Cleanup failed:', err);
    client.release();
    process.exit(1);
  }
}

cleanup();
