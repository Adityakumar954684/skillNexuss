import Post from '../models/Post.js';
import { uploadToCloudinary } from '../utils/uploadCloudinary.js';

/**
 * @desc    Create a new post
 * @route   POST /api/posts
 * @access  Private (Creator only)
 */
export const createPost = async (req, res) => {
  try {
    const { title, description, skills, category, budget, deliveryTime } = req.body;

    // Validation
    if (!title || !description || !skills || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    // Handle image uploads
    let imageUrls = [];
    if (req.body.images && Array.isArray(req.body.images)) {
      for (const image of req.body.images) {
        if (image.startsWith('data:image')) {
          const uploadResult = await uploadToCloudinary(image, 'skillnexus/posts');
          if (uploadResult.success) {
            imageUrls.push(uploadResult.url);
          }
        }
      }
    }

    const post = await Post.create({
      creator: req.user._id,
      title,
      description,
      skills: Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim()),
      category,
      images: imageUrls,
      budget: budget || { min: 0, max: 0 },
      deliveryTime: deliveryTime || 'Negotiable',
    });

    const populatedPost = await Post.findById(post._id).populate('creator', 'name email profileImage skills');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: populatedPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get all posts with filters
 * @route   GET /api/posts
 * @access  Public
 */
export const getAllPosts = async (req, res) => {
  try {
    const { search, category, skills, sort } = req.query;
    
    let query = { isActive: true };

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'views') {
      sortOption = { views: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    const posts = await Post.find(query)
      .populate('creator', 'name email profileImage skills bio')
      .sort(sortOption);

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
export const getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('creator', 'name email profileImage skills bio contactInfo');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Increment views
    post.views += 1;
    await post.save();

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get posts by creator
 * @route   GET /api/posts/creator/:creatorId
 * @access  Public
 */
export const getPostsByCreator = async (req, res) => {
  try {
    const posts = await Post.find({ 
      creator: req.params.creatorId,
      isActive: true 
    })
      .populate('creator', 'name email profileImage')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts,
    });
  } catch (error) {
    console.error('Get creator posts error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Update post
 * @route   PUT /api/posts/:id
 * @access  Private (Creator only - own posts)
 */
export const updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the creator of the post
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this post',
      });
    }

    // Update fields
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('creator', 'name email profileImage');

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost,
    });
  } catch (error) {
    console.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Delete post
 * @route   DELETE /api/posts/:id
 * @access  Private (Creator only - own posts)
 */
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if user is the creator of the post
    if (post.creator.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
