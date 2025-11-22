import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    skills: {
      type: [String],
      required: [true, 'At least one skill is required'],
      validate: {
        validator: function(v) {
          return v && v.length > 0;
        },
        message: 'At least one skill must be provided',
      },
    },
    category: {
      type: String,
      enum: ['Web Development', 'Mobile Development', 'Design', 'Video Editing', 'Content Writing', 'Digital Marketing', 'Other'],
      required: [true, 'Category is required'],
    },
    images: {
      type: [String],
      default: [],
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    deliveryTime: {
      type: String,
      default: 'Negotiable',
    },
    views: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
postSchema.index({ creator: 1 });
postSchema.index({ category: 1 });
postSchema.index({ skills: 1 });
postSchema.index({ createdAt: -1 });

const Post = mongoose.model('Post', postSchema);

export default Post;
