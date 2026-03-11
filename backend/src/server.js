import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import authRoutes from '../src/routes/auth.routes.js';
import categoryRoutes from '../src/routes/category.routes.js';
import communityRoutes from '../src/routes/community.routes.js';
import conversationRoutes from '../src/routes/conversation.routes.js';
import messageRoutes from '../src/routes/message.routes.js';
import presignedUrlRoutes from '../src/routes/presigned-url.routes.js';
import productRoutes from '../src/routes/product.routes.js';
import reportAdminRoutes from '../src/routes/report_admin.routes.js';
import universityRoutes from '../src/routes/university.routes.js';
import userRoutes from '../src/routes/user.routes.js';
import connectDB, { testConnection } from '../src/config/database.js';
import '../src/models/index.js';
import { multerErrorMiddleware } from '../src/middlewares/multer_error.middleware.js';
import ensureCommunityPostSchema from '../src/utils/ensure-community-post-schema.js';

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
router.use('/api/community', communityRoutes);
router.use('/api/presigned-url', presignedUrlRoutes);
router.use('/api/products', productRoutes);
router.use('/api/reports', reportAdminRoutes);
router.use('/api/conversations', conversationRoutes);
router.use('/api/messages', messageRoutes);

app.use(router);

app.use(multerErrorMiddleware);

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);
    }

    console.error('Unhandled error:', err);
    return res.status(500).json({ message: 'Internal server error' });
});

const startServer = async () => {
    try {
        await testConnection();
        if (process.env.NODE_ENV !== 'production') {
            await connectDB.sync();
        }
        await ensureCommunityPostSchema();
        console.log('Database connected');
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
};

startServer();