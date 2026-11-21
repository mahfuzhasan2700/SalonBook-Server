import express from 'express';
import {
  createCheckoutSession,
  handleStripeWebhook,
  verifySession,
  getAllTransactions,
} from '../controllers/paymentController.js';
import { verifyToken, verifyAdmin, verifyCustomer, checkBlocked } from '../middlewares/auth.js';

const router = express.Router();

// Stripe Webhook (needs raw body buffer, configured in server/src/index.js)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Customer initiates checkout
router.post('/create-checkout-session', verifyToken, checkBlocked, verifyCustomer, createCheckoutSession);
router.get('/verify-session/:sessionId', verifyToken, checkBlocked, verifySession);

// Admin transactions audit
router.get('/transactions', verifyToken, checkBlocked, verifyAdmin, getAllTransactions);

export default router;
