import express from 'express';
import {
  getAdminStats,
  getCustomerStats,
  getAllUsers,
  toggleBlockUser,
} from '../controllers/adminController.js';
import { verifyToken, verifyAdmin, verifyCustomer, checkBlocked } from '../middlewares/auth.js';

const router = express.Router();

// Admin stats & user management
router.get('/stats', verifyToken, checkBlocked, verifyAdmin, getAdminStats);
router.get('/users', verifyToken, checkBlocked, verifyAdmin, getAllUsers);
router.patch('/users/:id/block', verifyToken, checkBlocked, verifyAdmin, toggleBlockUser);

// Customer stats
router.get('/customer-stats', verifyToken, checkBlocked, verifyCustomer, getCustomerStats);

export default router;
