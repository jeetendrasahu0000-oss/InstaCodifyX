import express from 'express';
import {
  submitSetterRequest,
  getAllSetterRequests,
  approveSetterRequest,
  rejectSetterRequest,
} from '../Controller/Setterrequestcontroller.js';
import { protectAdmin, authorizeRoles } from '../Middleware/adminAuthMiddleware.js';

const router = express.Router();

// Public — problem setter submits request
router.post('/', submitSetterRequest);

// Admin only — view / approve / reject
router.get('/', protectAdmin, authorizeRoles('admin'), getAllSetterRequests);
router.patch('/:id/approve', protectAdmin, authorizeRoles('admin'), approveSetterRequest);
router.patch('/:id/reject', protectAdmin, authorizeRoles('admin'), rejectSetterRequest);

export default router;