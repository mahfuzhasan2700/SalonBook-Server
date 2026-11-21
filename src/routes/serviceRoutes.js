import express from 'express';
import {
  getAllServices,
  getAdminServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController.js';
import { verifyToken, verifyAdmin, checkBlocked } from '../middlewares/auth.js';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/admin/all', verifyToken, checkBlocked, verifyAdmin, getAdminServices);
router.get('/:id', getServiceById);

// Admin only routes
router.post('/', verifyToken, checkBlocked, verifyAdmin, createService);
router.patch('/:id', verifyToken, checkBlocked, verifyAdmin, updateService);
router.delete('/:id', verifyToken, checkBlocked, verifyAdmin, deleteService);

export default router;
