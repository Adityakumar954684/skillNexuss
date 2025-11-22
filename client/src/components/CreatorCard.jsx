import { Link, useNavigate } from 'react-router-dom';
import { FiMapPin, FiMail, FiMessageCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const CreatorCard = ({ creator }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleContactClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Navigate to chat with this creator
    navigate(`/chat/${creator._id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="card"
    >
      <Link to={`/profile/${creator._id}`}>
        <div className="flex items-start space-x-4">
          <img
            src={creator.profileImage || 'https://via.placeholder.com/150'}
            alt={creator.name}
            className="w-20 h-20 rounded-full object-cover border-2 border-primary-500"
          />
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400">
              {creator.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <FiMail className="mr-1" size={14} />
              {creator.email}
            </p>
          </div>
        </div>

        {creator.bio && (
          <p className="mt-4 text-gray-600 dark:text-gray-300 line-clamp-2">
            {creator.bio}
          </p>
        )}

        {creator.skills && creator.skills.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {creator.skills.slice(0, 4).map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {creator.skills.length > 4 && (
              <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-medium">
                +{creator.skills.length - 4} more
              </span>
            )}
          </div>
        )}
      </Link>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleContactClick}
        className="mt-4 w-full btn-primary flex items-center justify-center space-x-2"
      >
        <FiMessageCircle />
        <span>Contact Creator</span>
      </motion.button>
    </motion.div>
  );
};

export default CreatorCard;
