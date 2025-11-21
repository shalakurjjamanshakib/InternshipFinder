import express from 'express';
import { getMyApplications } from '../controllers/applicationController.js';
import { protect } from '../middleware/authMiddleware.js';
import { getApplicationsForEmployer, updateApplicationStatus } from '../controllers/applicationController.js';
import { authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyApplications);
router.get('/received', protect, authorize('employer'), getApplicationsForEmployer);
router.put('/:id/status', protect, authorize('employer'), updateApplicationStatus);

export default router;
