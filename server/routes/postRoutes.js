import express from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getPostsByCreator,
  updatePost,
  deletePost,
} from '../controllers/postController.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/:id', getPostById);
router.get('/creator/:creatorId', getPostsByCreator);
router.post('/', protect, restrictTo('creator'), createPost);
router.put('/:id', protect, restrictTo('creator'), updatePost);
router.delete('/:id', protect, restrictTo('creator'), deletePost);

export default router;
