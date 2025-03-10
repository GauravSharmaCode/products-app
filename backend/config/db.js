import postgres from 'postgres';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

// Log connection details (masked for security)
logger.debug('Attempting database connection...');

const sql = postgres(process.env.DB_CONNECTION_STRING, {
    ssl: {
        require: true,
        rejectUnauthorized: false
    }
});

// Test connection
// sql`SELECT 1`
//     .then(() => logger.info('Database connection successful'))
//     .catch(err => {
//         logger.error('Database connection failed:', {
//             error: err.message,
//             code: err.code
//         });
//     });

export { sql };