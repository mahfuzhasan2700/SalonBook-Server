import express from 'express';
import { registerUser, loginUser, googleAuth, getMe, updateProfile } from '../controllers/authController.js';
import { verifyToken, checkBlocked } from '../middlewares/auth.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);
router.get('/me', verifyToken, checkBlocked, getMe);
router.patch('/profile', verifyToken, checkBlocked, updateProfile);

export default router;
