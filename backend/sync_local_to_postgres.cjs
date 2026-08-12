const { Pool } = require('pg');

const connectionString = 'postgresql://postgres:Jadequest%403009@localhost:5432/captain';
const pool = new Pool({ connectionString });

async function syncAllRecordsToPostgres() {
  try {
    console.log('🔄 Syncing All Field Products & Attendance Records to PostgreSQL DB...');

    // 1. Seed Captain Field Products into PostgreSQL DB
    const productsToSeed = [
      {
        id: 'FPRD-628',
        captainId: 'USR-CAP-201',
        name: 'cloth',
        category: 'Electrical & Electronics',
        subCategory: 'Circuit Breakers',
        price: 480.00,
        color: 'Yellow',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        colorImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        status: 'APPROVED'
      },
      {
        id: 'FPRD-447',
        captainId: 'USR-CAP-201',
        name: 'abc',
        category: 'Electrical & Electronics',
        subCategory: 'Circuit Breakers',
        price: 78.00,
        color: 'Silver',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        colorImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        status: 'PENDING'
      },
      {
        id: 'FPRD-101',
        captainId: 'USR-CAP-201',
        name: 'Industrial Power Angle Grinder 850W',
        category: 'Industrial Hardware',
        subCategory: 'Power Tools',
        price: 3499.00,
        color: 'Red',
        imageUrl: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400',
        colorImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=400',
        status: 'PENDING'
      }
    ];

    for (const p of productsToSeed) {
      await pool.query(`
        INSERT INTO captain_field_products (id, captain_id, name, category, sub_category, price, color, image_url, color_image_url, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET 
          name = EXCLUDED.name,
          price = EXCLUDED.price,
          status = EXCLUDED.status;
      `, [p.id, p.captainId, p.name, p.category, p.subCategory, p.price, p.color, p.imageUrl, p.colorImageUrl, p.status]);
    }
    console.log('✅ Seeded All 3 Captain Field Products into PostgreSQL DB!');

    // 2. Seed Baseline Attendance Record into PostgreSQL DB
    const now = new Date();
    await pool.query(`
      INSERT INTO captain_attendance (id, captain_id, date, punch_in_time, punch_in_location, status)
      VALUES ($1, $2, CURRENT_DATE, $3, $4, 'PUNCHED_IN')
      ON CONFLICT (id) DO NOTHING;
    `, ['ATT-2026-001', 'USR-CAP-201', now, 'Lat: 23.0225, Lng: 72.5714 - SG Highway, Ahmedabad, Gujarat']);
    console.log('✅ Seeded Attendance Record into PostgreSQL DB!');

    // 3. Verify final DB row counts
    const fpRes = await pool.query('SELECT count(*) FROM captain_field_products;');
    const attRes = await pool.query('SELECT count(*) FROM captain_attendance;');
    const usersRes = await pool.query('SELECT count(*) FROM users;');

    console.log('\n=====================================================');
    console.log('🎉 POSTGRESQL DB SYNC COMPLETE!');
    console.log(`- captain_field_products Rows: ${fpRes.rows[0].count}`);
    console.log(`- captain_attendance Rows: ${attRes.rows[0].count}`);
    console.log(`- users Rows: ${usersRes.rows[0].count}`);
    console.log('=====================================================');

    pool.end();
  } catch (err) {
    console.error('⚠️ DB Sync error:', err);
    pool.end();
  }
}

syncAllRecordsToPostgres();
