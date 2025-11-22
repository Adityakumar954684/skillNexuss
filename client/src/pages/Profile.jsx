import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI, postAPI } from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiEdit2,
  FiSave,
  FiX,
  FiMail,
  FiPhone,
  FiGlobe,
  FiGithub,
  FiLinkedin,
  FiMapPin,
  FiCamera,
  FiMessageCircle,
} from 'react-icons/fi';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const Profile = () => {
  const { userId } = useParams();
  const { user: currentUser, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    skills: [],
    portfolio: '',
    phone: '',
    website: '',
    linkedin: '',
    github: '',
    profileImage: '',
  });

  const [skillInput, setSkillInput] = useState('');
  const [imagePreview, setImagePreview] = useState('');

  const isOwnProfile = currentUser?._id === userId;

  useEffect(() => {
    fetchProfileData();
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        userAPI.getProfile(userId),
        postAPI.getPostsByCreator(userId),
      ]);

      const userData = profileRes.data.data;
      setProfileUser(userData);
      setUserPosts(postsRes.data.data || []);

      // Initialize form data
      setFormData({
        name: userData.name || '',
        bio: userData.bio || '',
        skills: userData.skills || [],
        portfolio: userData.portfolio || '',
        phone: userData.contactInfo?.phone || '',
        website: userData.contactInfo?.website || '',
        linkedin: userData.contactInfo?.linkedin || '',
        github: userData.contactInfo?.github || '',
        profileImage: userData.profileImage || '',
      });
      setImagePreview(userData.profileImage || '');
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    // Validate file type
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and WEBP images are allowed');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        profileImage: reader.result,
      }));
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove),
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      const updateData = {
        name: formData.name,
        bio: formData.bio,
        skills: formData.skills,
        portfolio: formData.portfolio,
        contactInfo: {
          phone: formData.phone,
          website: formData.website,
          linkedin: formData.linkedin,
          github: formData.github,
        },
      };

      // Add profile image if changed
      if (formData.profileImage !== profileUser.profileImage) {
        updateData.profileImage = formData.profileImage;
      }

      const response = await userAPI.updateProfile(updateData);
      const updatedData = response.data.data;

      setProfileUser(updatedData);
      updateUser(updatedData);
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      name: profileUser.name || '',
      bio: profileUser.bio || '',
      skills: profileUser.skills || [],
      portfolio: profileUser.portfolio || '',
      phone: profileUser.contactInfo?.phone || '',
      website: profileUser.contactInfo?.website || '',
      linkedin: profileUser.contactInfo?.linkedin || '',
      github: profileUser.contactInfo?.github || '',
      profileImage: profileUser.profileImage || '',
    });
    setImagePreview(profileUser.profileImage || '');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User not found
          </h2>
          <button onClick={() => navigate('/')} className="btn-primary">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {/* Profile Image & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
              {/* Profile Image */}
              <div className="relative">
                <img
                  src={imagePreview || 'https://via.placeholder.com/150'}
                  alt={formData.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-primary-500"
                />
                {isEditing && (
                  <label
                    htmlFor="profile-image"
                    className="absolute bottom-0 right-0 p-2 bg-primary-600 text-white rounded-full cursor-pointer hover:bg-primary-700 transition-colors"
                  >
                    <FiCamera size={20} />
                    <input
                      id="profile-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1 text-center sm:text-left">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field text-2xl font-bold mb-2"
                    placeholder="Your Name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {profileUser.name}
                  </h1>
                )}

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-gray-600 dark:text-gray-400 mb-4">
                  <span className="flex items-center">
                    <FiMail className="mr-2" size={16} />
                    {profileUser.email}
                  </span>
                  <span className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium capitalize">
                    {profileUser.role}
                  </span>
                </div>

                {isEditing ? (
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="input-field resize-none w-full"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  profileUser.bio && (
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {profileUser.bio}
                    </p>
                  )
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              {isOwnProfile ? (
                isEditing ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleSave}
                      disabled={saving}
                      className="btn-primary flex items-center space-x-2 flex-1 sm:flex-initial"
                    >
                      {saving ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <FiSave />
                          <span>Save</span>
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCancel}
                      className="btn-secondary flex items-center space-x-2"
                    >
                      <FiX />
                      <span>Cancel</span>
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsEditing(true)}
                    className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
                  >
                    <FiEdit2 />
                    <span>Edit Profile</span>
                  </motion.button>
                )
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/chat/${userId}`)}
                  className="btn-primary flex items-center space-x-2 w-full sm:w-auto"
                >
                  <FiMessageCircle />
                  <span>Message</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Skills */}
          {(profileUser.skills?.length > 0 || isEditing) && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Skills
              </h3>
              {isEditing ? (
                <div>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
                      placeholder="Add a skill..."
                      className="input-field flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleAddSkill}
                      className="btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills.map((skill, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-2 px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="hover:text-primary-900 dark:hover:text-primary-100"
                        >
                          <FiX size={16} />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileUser.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isEditing ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 8900"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://yourwebsite.com"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      LinkedIn
                    </label>
                    <div className="relative">
                      <FiLinkedin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleChange}
                        placeholder="https://linkedin.com/in/username"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      GitHub
                    </label>
                    <div className="relative">
                      <FiGithub className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="url"
                        name="github"
                        value={formData.github}
                        onChange={handleChange}
                        placeholder="https://github.com/username"
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Portfolio URL
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleChange}
                      placeholder="https://portfolio.com"
                      className="input-field"
                    />
                  </div>
                </>
              ) : (
                <>
                  {profileUser.contactInfo?.phone && (
                    <a
                      href={`tel:${profileUser.contactInfo.phone}`}
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <FiPhone className="mr-2" />
                      {profileUser.contactInfo.phone}
                    </a>
                  )}
                  {profileUser.contactInfo?.website && (
                    <a
                      href={profileUser.contactInfo.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <FiGlobe className="mr-2" />
                      Website
                    </a>
                  )}
                  {profileUser.contactInfo?.linkedin && (
                    <a
                      href={profileUser.contactInfo.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <FiLinkedin className="mr-2" />
                      LinkedIn
                    </a>
                  )}
                  {profileUser.contactInfo?.github && (
                    <a
                      href={profileUser.contactInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <FiGithub className="mr-2" />
                      GitHub
                    </a>
                  )}
                  {profileUser.portfolio && (
                    <a
                      href={profileUser.portfolio}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      <FiGlobe className="mr-2" />
                      Portfolio
                    </a>
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* User Posts */}
        {profileUser.role === 'creator' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {isOwnProfile ? 'My Posts' : 'Posts'}{' '}
              <span className="text-gray-500">({userPosts.length})</span>
            </h2>

            {userPosts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {userPosts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <PostCard post={post} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {isOwnProfile ? "You haven't created any posts yet" : 'No posts available'}
                </p>
                {isOwnProfile && (
                  <button
                    onClick={() => navigate('/create-post')}
                    className="btn-primary"
                  >
                    Create Your First Post
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
