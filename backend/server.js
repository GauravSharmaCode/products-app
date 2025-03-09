import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql } from '../backend/config/db.js';
import winston from 'winston';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Configure logging
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

// middleware to parse request body into JSON
app.use(express.json());

// middleware to remove CORS errors from the server
app.use(cors());

// security middleware to set various HTTP headers to help protect your app
app.use(helmet());
app.use(morgan('dev'));

// app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Server is ready');
});

async function initDB(){
    try {
        await sql`CREATE TABLE IF NOT EXISTS products (
            id serial PRIMARY KEY,
            name VARCHAR (100) NOT NULL,
            image VARCHAR (255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC (10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`;
        logger.info(`Table created at ${new Date()}`);
    } catch (err) {
        logger.error(err);
    }
}

// logger.debug(`PGHOST: ${process.env.PGHOST}`);
// logger.debug(`PGDATABASE: ${process.env.PGDATABASE}`);
// logger.debug(`PGUSER: ${process.env.PGUSER}`);
// logger.debug(`PGPASSWORD: ${process.env.PGPASSWORD}`);
// logger.debug(`PGPORT: ${process.env.PGPORT}`);

initDB().then(() => {
    logger.info(`DB initialized at ${new Date()}`);
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    logger.error(err);
});