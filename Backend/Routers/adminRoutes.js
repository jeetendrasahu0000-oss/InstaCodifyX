// Backend/Routers/adminRoutes.js
import express from 'express';
import { registerAdmin, loginAdmin, getProfile } from '../Controller/adminController.js';
import { protectAdmin, authorizeRoles } from '../Middleware/adminAuthMiddleware.js';

const router = express.Router();

router.post('/register', protectAdmin, authorizeRoles('admin'), registerAdmin);
router.post('/login', loginAdmin);
router.get('/profile', protectAdmin, getProfile);

export default router;