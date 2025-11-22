import User from '../models/User.js';
import { uploadToCloudinary } from '../utils/uploadCloudinary.js';

/**
 * @desc    Get user profile by ID
 * @route   GET /api/users/:id
 * @access  Public
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update fields
    user.name = req.body.name || user.name;
    user.bio = req.body.bio || user.bio;
    user.skills = req.body.skills || user.skills;
    user.portfolio = req.body.portfolio || user.portfolio;
    
    if (req.body.contactInfo) {
      user.contactInfo = {
        ...user.contactInfo,
        ...req.body.contactInfo,
      };
    }

    // Handle profile image upload
    if (req.body.profileImage && req.body.profileImage.startsWith('data:image')) {
      const uploadResult = await uploadToCloudinary(req.body.profileImage, 'skillnexus/profiles');
      if (uploadResult.success) {
        user.profileImage = uploadResult.url;
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get all creators
 * @route   GET /api/users/creators
 * @access  Public
 */
export const getAllCreators = async (req, res) => {
  try {
    const { search, skills } = req.query;
    
    let query = { role: 'creator', isActive: true };

    // Search by name or bio
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',');
      query.skills = { $in: skillsArray };
    }

    const creators = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: creators.length,
      data: creators,
    });
  } catch (error) {
    console.error('Get creators error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
