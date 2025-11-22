import { Link } from 'react-router-dom';
import { FiEye, FiClock, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';

const PostCard = ({ post }) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card"
    >
      {post.images && post.images.length > 0 && (
        <img
          src={post.images[0]}
          alt={post.title}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />
      )}

      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white line-clamp-2">
            {post.title}
          </h3>
          <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium whitespace-nowrap">
            {post.category}
          </span>
        </div>

        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
          {post.description}
        </p>

        {post.skills && post.skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {post.skills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
              >
                {skill}
              </span>
            ))}
            {post.skills.length > 3 && (
              <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs">
                +{post.skills.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <FiEye className="mr-1" size={14} />
              {post.views || 0}
            </span>
            <span className="flex items-center">
              <FiClock className="mr-1" size={14} />
              {post.deliveryTime}
            </span>
          </div>
          {post.budget && post.budget.max > 0 && (
            <span className="flex items-center font-medium text-primary-600 dark:text-primary-400">
              <FiDollarSign size={14} />
              {post.budget.min}-{post.budget.max}
            </span>
          )}
        </div>

        {post.creator && (
          <Link
            to={`/profile/${post.creator._id}`}
            className="flex items-center space-x-3 pt-3 border-t border-gray-200 dark:border-gray-700"
          >
            <img
              src={post.creator.profileImage || 'https://via.placeholder.com/150'}
              alt={post.creator.name}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
                {post.creator.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(post.createdAt)}
              </p>
            </div>
          </Link>
        )}

        <Link to={`/chat/${post.creator?._id}`}>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full btn-primary mt-4"
          >
            Contact Creator
          </motion.button>
        </Link>
      </div>
    </motion.div>
  );
};

export default PostCard;
