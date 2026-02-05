import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from '../src/routes/auth.routes.js';
import categoryRoutes from '../src/routes/category.routes.js';
import conversationRoutes from '../src/routes/conversation.routes.js';
import messageRoutes from '../src/routes/message.routes.js';
import productRoutes from '../src/routes/product.routes.js';
import universityRoutes from '../src/routes/university.routes.js';
import userRoutes from '../src/routes/user.routes.js';
import { testConnection } from '../src/config/database.js';

dotenv.config();

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 4001

// middleware
app.use(cors());
app.use(express.json());

// routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/universities', universityRoutes);
router.use('/api/categories', categoryRoutes);
router.use('/api/products', productRoutes);
router.use('/api/conversations', conversationRoutes);
router.use('/api/messages', messageRoutes);

const startServer = async () => {
    try {
        await testConnection();
        console.log('Database connected');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

startServer();