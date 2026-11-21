import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database on server start (for local)
connectDB().catch((err) => console.error('[Initial DB connection error]:', err.message));

// Middleware to ensure DB connection is ready for serverless requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection failed. Please ensure MongoDB Atlas is reachable.',
    });
  }
});

// Flexible CORS for Localhost & Vercel Domains
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      if (!origin) return callback(null, true);
      // Allow localhost and any .vercel.app domain
      if (
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://127.0.0.1') ||
        origin.endsWith('.vercel.app') ||
        origin === process.env.CLIENT_URL
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for production deployment
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Note: Stripe Webhook requires raw body for signature verification
// Handled directly inside paymentRoutes with express.raw
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular JSON body parser for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SalonBook REST API Server is operational on Vercel.',
    version: '1.0.0',
    documentation: 'https://github.com/mahfuzhasan2700/SalonBook-Server#readme',
  });
});

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on path: ${req.originalUrl}`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[Server Error]:`, err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

// Only listen on port in non-serverless local environments
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[SalonBook Server] Listening on port ${PORT}`);
  });
}

export default app;
