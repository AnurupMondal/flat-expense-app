const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'flat_expense_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function checkComplaintsInDB() {
    try {
        console.log('Connecting to database...');

        // Check if complaints table exists and has data
        const complaintsResult = await pool.query('SELECT * FROM complaints ORDER BY created_at DESC;');
        console.log('Complaints in database:', complaintsResult.rows.length);
        console.log('First few complaints:', complaintsResult.rows.slice(0, 3));

        // Check users table to see what user IDs exist
        const usersResult = await pool.query('SELECT id, email, name, role FROM users;');
        console.log('Users in database:', usersResult.rows.length);
        console.log('Users:', usersResult.rows);

        pool.end();
    } catch (error) {
        console.error('Database check failed:', error);
        pool.end();
    }
}

checkComplaintsInDB();
