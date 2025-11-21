
import express from 'express';
import { getProfile, updateProfile, uploadResume } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';

const router = express.Router();

const storage = multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, path.join(process.cwd(), 'uploads', 'resumes'));
		},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		const name = `${req.user.id}_${Date.now()}${ext}`;
		cb(null, name);
	}
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); 


router.get('/count', async (req, res) => {
	try {
		const count = await User.countDocuments();
		res.json({ count });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.get('/me', protect, getProfile);
router.put('/me', protect, updateProfile);
router.post('/me/resume', protect, upload.single('resume'), uploadResume);

export default router;
