const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgresql://postgres:Jadequest%403009@localhost:5432/captain';
const pool = new Pool({ connectionString });

async function checkAndSeed() {
  try {
    console.log('Connecting to PostgreSQL database captain...');
    const tablesRes = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`);
    console.log('Existing tables in public schema:', tablesRes.rows.map(r => r.table_name));

    // Execute full pgadmin_schema.sql to create captain_field_products and captain_attendance
    const sqlPath = path.join(__dirname, 'pgadmin_schema.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing pgadmin_schema.sql to ensure all 17 tables are created in PostgreSQL DB...');
    await pool.query(sqlContent);

    const afterRes = await pool.query(`SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`);
    console.log('✅ UPDATED TABLES IN POSTGRESQL DB:', afterRes.rows.map(r => r.table_name));

    const productsCount = await pool.query('SELECT count(*) FROM captain_field_products;');
    console.log('Total Captain Field Products in DB:', productsCount.rows[0].count);

    const attendanceCount = await pool.query('SELECT count(*) FROM captain_attendance;');
    console.log('Total Captain Attendance Records in DB:', attendanceCount.rows[0].count);

    pool.end();
  } catch (err) {
    console.error('Error running SQL script:', err);
    pool.end();
  }
}

checkAndSeed();
