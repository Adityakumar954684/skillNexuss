import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getAllCreators,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/creators', getAllCreators);
router.get('/:id', getUserProfile);
router.put('/profile', protect, updateProfile);

export default router;
