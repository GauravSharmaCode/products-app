import express, { request } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import { sql } from '../backend/config/db.js';
import logger from './utils/logger.js';
import productRoutes from '../backend/routes/productRoutes.js';
import arcjet from '@arcjet/node';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// middleware to parse request body into JSON
app.use(express.json());

// middleware to remove CORS errors from the server
app.use(cors());

// security middleware to set various HTTP headers to help protect your app
app.use(helmet());
app.use(morgan('dev'));

// appy arcjet middleware for rate limiting to all routes with 10 requests per minute
app.use (async (req, res, next)=> {
    try{
        const decision = await arcjet.protect(req, {
            requested:1 // number of requests
        })

        if (decision.isDenied()){
            if (decision.isRateLimited()){
                res.status(429).send('Too many requests');
                logger.error('Rate limited', 'arcjetMiddleware');
            } else if (decision.reason.isBot()){
                res.status(403).send('Bots are not allowed');
                logger.error('Bot detected', 'arcjetMiddleware');
            } else {
                res.status(403).send('Forbidden');
                logger.error('Forbidden request', 'arcjetMiddleware');
            }
        }
        // check for spoofed bots
        if (decision.isAllowed() && decision.reason.isBot()){
            res.status(403).send('Spoofed Bots are also not allowed');
            logger.warn('Spoofed Bot detected', 'arcjetMiddleware');
        }

        next();
    } catch (error){
        logger.apiError(error, 'arcjetMiddleware');
        res.status(500).send('Internal Server Error');
    }
})

// import product routes
app.use('/api/products', productRoutes);

app.get('/', (req, res) => {
    res.send('Server is ready');
});

async function initDB(){
    try {
        const query = sql`CREATE TABLE IF NOT EXISTS products (
            id serial PRIMARY KEY,
            name VARCHAR (100) NOT NULL,
            image VARCHAR (255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC (10, 2) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            is_deleted INTEGER DEFAULT 0
        )`;

        logger.queryStart(query);
        await query;
        logger.querySuccess('Products table created or verified');
    } catch (err) {
        logger.queryError(err, 'initDB');
        throw err;
    }
}

initDB().then(() => {
    logger.info(`DB initialized at ${new Date()}`);
    app.listen(PORT, () => {
        logger.info(`Server is running on http://localhost:${PORT}`);
    });
}).catch((err) => {
    logger.error(err, 'server initialization');
    process.exit(1);
});