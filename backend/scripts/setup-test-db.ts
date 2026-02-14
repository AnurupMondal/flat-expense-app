import { Client } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test', override: true });

async function setupTestDb() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL is not set');
        process.exit(1);
    }

    console.log(`Setting up test database at ${connectionString.split('@')[1] || connectionString}...`);

    const client = new Client({
        connectionString,
    });

    try {
        await client.connect();
        console.log('Connected to test database');

        // Reset schema
        console.log('Dropping and recreating public schema...');
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

        // Read SQL files
        const initDir = path.resolve(__dirname, '../../database/init');
        const files = ['01-schema.sql', '03-admin-assignments.sql', '04-community-board.sql'];

        for (const file of files) {
            const filePath = path.join(initDir, file);
            if (!fs.existsSync(filePath)) {
                console.warn(`Warning: File ${filePath} not found, skipping.`);
                continue;
            }
            const sql = fs.readFileSync(filePath, 'utf8');
            console.log(`Executing ${file}...`);
            await client.query(sql);
        }

        console.log('Test database setup complete');
    } catch (err) {
        console.error('Error setting up test database:', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

setupTestDb();
