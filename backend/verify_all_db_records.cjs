const { Pool } = require('pg');

const connectionString = 'postgresql://postgres:Jadequest%403009@localhost:5432/captain';
const pool = new Pool({ connectionString });

async function verifyAllTablesAndRecords() {
  try {
    console.log('=====================================================');
    console.log('🔍 POSTGRESQL DATABASE "captain" - FULL AUDIT REPORT');
    console.log('=====================================================');

    // 1. Fetch all public tables
    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    const tableNames = tablesRes.rows.map(r => r.table_name);
    console.log(`✅ Total Tables Found in PostgreSQL DB: ${tableNames.length}\n`);

    const summaryReport = [];

    for (const table of tableNames) {
      try {
        const countRes = await pool.query(`SELECT COUNT(*) FROM "${table}";`);
        const count = countRes.rows[0].count;
        summaryReport.push({ table, count: parseInt(count, 10) });
      } catch (err) {
        summaryReport.push({ table, count: 'Error: ' + err.message });
      }
    }

    console.table(summaryReport);

    // 2. Fetch sample rows from key tables
    console.log('\n--- 👥 USERS TABLE SUMMARY ---');
    const usersRes = await pool.query(`SELECT id, email, first_name, last_name, role, status FROM users ORDER BY created_at DESC LIMIT 5;`);
    console.table(usersRes.rows);

    console.log('\n--- 🛍️ CAPTAIN FIELD PRODUCTS TABLE SUMMARY ---');
    const productsRes = await pool.query(`SELECT id, captain_id, name, category, price, color, status, created_at FROM captain_field_products ORDER BY created_at DESC;`);
    console.table(productsRes.rows);

    console.log('\n--- 📍 CAPTAIN ATTENDANCE LOGS TABLE SUMMARY ---');
    const attendanceRes = await pool.query(`SELECT id, captain_id, date, punch_in_time, punch_out_time, total_hours, status FROM captain_attendance ORDER BY created_at DESC;`);
    console.table(attendanceRes.rows);

    pool.end();
  } catch (err) {
    console.error('⚠️ Database verification error:', err);
    pool.end();
  }
}

verifyAllTablesAndRecords();
