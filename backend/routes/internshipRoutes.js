import express from "express";
import { createInternship, getInternships, getInternship, deleteInternship } from "../controllers/internshipController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
import { applyToInternship } from "../controllers/applicationController.js";
import { getApplicationsForInternship } from "../controllers/applicationController.js";

const router = express.Router();

router.get('/', getInternships);
router.get('/my/list', protect, async (req, res) => {
	try {
		const list = await (await import('../models/Internship.js')).default.find({ postedBy: req.user.id });
		res.json(list);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});
router.post('/:id/apply', protect, authorize('student'), applyToInternship);
router.get('/:id/applications', protect, authorize('employer'), getApplicationsForInternship);
router.get('/:id', getInternship);
router.put('/:id', protect, authorize('employer'), async (req, res, next) => {
	try {
		const { updateInternship } = await import('../controllers/internshipController.js');
		return updateInternship(req, res, next);
	} catch (err) {
		next(err);
	}
});
router.post('/', protect, authorize('employer'), createInternship);
router.delete('/:id', protect, deleteInternship);

export default router;
