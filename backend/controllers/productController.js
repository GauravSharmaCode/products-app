import { sql } from '../config/db.js';
import logger from '../utils/logger.js';
import asyncHandler from 'express-async-handler';

export const getProducts = asyncHandler(async (req, res) => {
    try {
        const query = sql`
            SELECT * FROM products 
            WHERE is_deleted = 0 
            ORDER BY created_at DESC`;
        
        logger.queryStart(query);
        const products = await query;
        logger.querySuccess(`Found ${products.length} products`);
        res.status(200).json({ success: true, data: products });
    } catch (err) {
        logger.queryError(err, 'getProducts');
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export const createProduct = asyncHandler(async (req, res) => {
    const { name, price, image, description } = req.body;
    try {
        const query = sql`
            INSERT INTO products (
                name, price, image, description, created_at, updated_at, is_deleted
            ) VALUES (
                ${name}, ${price}, ${image}, ${description}, NOW(), NOW(), 0
            ) RETURNING *`;
        
        logger.queryStart(query);
        const newProduct = await query;
        logger.querySuccess(`Created product with ID: ${newProduct[0].id}`);
        res.status(201).json({ success: true, data: newProduct[0] });
    } catch (err) {
        logger.queryError(err, 'createProduct');
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

export const getProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const query = sql`
            SELECT * FROM products 
            WHERE id = ${id} AND is_deleted = 0`;
        
        logger.info(`Executing query: ${query.strings.join(' ')} with params: [${id}]`);
        const product = await query;
        
        if (!product.length) {
            logger.info(`Query executed successfully. No product found with ID: ${id}`);
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        
        logger.info(`Query executed successfully. Found product with ID: ${id}`);
        res.status(200).json({ success: true, data: product[0] });
    } catch (err) {
        logger.error(`Error in getProduct function: ${err.stack}`);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

export const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, price, image, description } = req.body;
    
    try {
        const selectQuery = sql`
            SELECT * FROM products 
            WHERE id = ${id} AND is_deleted = 0`;

        logger.queryStart(selectQuery);
        const existingProduct = await selectQuery;

        if (!existingProduct.length) {
            logger.querySuccess(`No product found with ID: ${id}`);
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        const updateQuery = sql`
            UPDATE products 
            SET name = ${name || existingProduct[0].name},
                price = ${price || existingProduct[0].price},
                image = ${image || existingProduct[0].image},
                description = ${description || existingProduct[0].description},
                updated_at = NOW()
            WHERE id = ${id} AND is_deleted = 0
            RETURNING *`;

        logger.queryStart(updateQuery);
        const updatedProduct = await updateQuery;
        logger.querySuccess(`Updated product with ID: ${updatedProduct[0].id}`);
        res.status(200).json({ success: true, data: updatedProduct[0] });
    } catch (err) {
        logger.queryError(err, 'updateProduct');
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});

export const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await sql`
            UPDATE products 
            SET is_deleted = 1,
                updated_at = NOW()
            WHERE id = ${id} AND is_deleted = 0
            RETURNING *`;

        if (!deletedProduct.length) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        logger.info(`Product deleted successfully: ${JSON.stringify(deletedProduct[0])}`);
        res.status(200).json({ success: true, data: deletedProduct[0] });
    } catch (err) {
        logger.error(`Error in deleteProduct function: ${err.stack}`);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
});
