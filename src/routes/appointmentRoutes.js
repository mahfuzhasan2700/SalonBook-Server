import express from 'express';
import {
  createAppointment,
  getCustomerAppointments,
  cancelCustomerAppointment,
  getAdminAppointments,
  updateAppointmentStatusByAdmin,
} from '../controllers/appointmentController.js';
import { verifyToken, verifyAdmin, verifyCustomer, checkBlocked } from '../middlewares/auth.js';

const router = express.Router();

// Customer routes
router.post('/', verifyToken, checkBlocked, verifyCustomer, createAppointment);
router.get('/my', verifyToken, checkBlocked, verifyCustomer, getCustomerAppointments);
router.patch('/:id/cancel', verifyToken, checkBlocked, verifyCustomer, cancelCustomerAppointment);

// Admin routes
router.get('/admin/all', verifyToken, checkBlocked, verifyAdmin, getAdminAppointments);
router.patch('/admin/:id/status', verifyToken, checkBlocked, verifyAdmin, updateAppointmentStatusByAdmin);

export default router;
