import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import Routes
import adminRoutes from './routes/adminRoutes.js';
import adventureRoutes from './routes/adventureRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS
const origins = process.env.FRONTEND_ORIGINS ? process.env.FRONTEND_ORIGINS.split(',') : [
    'http://localhost:3000',
    'https://bookmyadventure.co.in'
];

app.use(cors({
    origin: ["http://localhost:3000", "https://bookmyadventure.co.in"],
    credentials: true,
    methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Cookie', 'Access-Control-Allow-Credentials', 'Access-Control-Allow-Origin', 'Accept', 'Origin', 'X-Requested-With'],
    exposedHeaders: ['set-cookie']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome To Book My Adventure.' });
});

// Mount Routers
app.use('/admin', adminRoutes);
app.use('/api/adventures', adventureRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/banners', bannerRoutes);


// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
