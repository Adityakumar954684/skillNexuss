import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiUsers, FiTrendingUp, FiZap } from 'react-icons/fi';
import { userAPI, postAPI } from '../utils/api';
import CreatorCard from '../components/CreatorCard';
import PostCard from '../components/PostCard';
import toast from 'react-hot-toast';

const Home = () => {
  const navigate = useNavigate();
  const [creators, setCreators] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [creatorsRes, postsRes] = await Promise.all([
        userAPI.getAllCreators({ limit: 6 }),
        postAPI.getAllPosts({ limit: 6 }),
      ]);

      setCreators(creatorsRes.data.data || []);
      setPosts(postsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(() => {
    if (searchTerm.trim()) {
      navigate(`/projects?search=${encodeURIComponent(searchTerm)}`);
    }
  }, [searchTerm, navigate]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }, [handleSearch]);

  // Animation variants - memoized for performance
  const fadeInUp = useMemo(() => ({
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }), []);

  const staggerContainer = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }), []);

  // Features data - memoized to prevent recreation
  const features = useMemo(() => [
    {
      icon: <FiUsers size={32} />,
      title: 'Verified Creators',
      description: 'Connect with talented, verified professionals ready to bring your vision to life.',
    },
    {
      icon: <FiZap size={32} />,
      title: 'Real-Time Chat',
      description: 'Communicate instantly with creators through our integrated messaging system.',
    },
    {
      icon: <FiTrendingUp size={32} />,
      title: 'Quality Work',
      description: 'Browse portfolios and reviews to find the perfect match for your project.',
    },
  ], []);

  // How it works steps - memoized
  const steps = useMemo(() => [
    {
      step: '01',
      title: 'Create Your Profile',
      description: 'Sign up as a creator or client and set up your profile with your skills and requirements.',
    },
    {
      step: '02',
      title: 'Browse & Connect',
      description: 'Search for creators or post your project. Connect instantly through our messaging system.',
    },
    {
      step: '03',
      title: 'Collaborate & Build',
      description: 'Work together to bring your project to life. Share ideas, files, and feedback in real-time.',
    },
  ], []);

  // Testimonials - memoized
  const testimonials = useMemo(() => [
    {
      name: 'Sarah Johnson',
      role: 'Web Developer',
      comment: 'SkillNexus helped me find amazing clients and grow my freelance business. The platform is intuitive and the chat feature is fantastic!',
      avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=0ea5e9&color=fff',
    },
    {
      name: 'Michael Chen',
      role: 'Startup Founder',
      comment: 'Found the perfect designer for my project within hours. The quality of creators on this platform is outstanding!',
      avatar: 'https://ui-avatars.com/api/?name=Michael+Chen&background=0ea5e9&color=fff',
    },
    {
      name: 'Emma Davis',
      role: 'Content Creator',
      comment: 'Best platform for connecting with clients. Easy to use, professional, and the support team is always helpful.',
      avatar: 'https://ui-avatars.com/api/?name=Emma+Davis&background=0ea5e9&color=fff',
    },
  ], []);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5" aria-hidden="true">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.15) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp} 
              className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 rounded-full text-primary-700 dark:text-primary-300 text-sm font-medium mb-6"
            >
              <FiZap size={16} />
              <span>Welcome to SkillNexus</span>
            </motion.div>

            {/* Main Heading */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight"
            >
              Connect with Talented{' '}
              <span className="bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
                Creators
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
            >
              Find skilled professionals for your next project. From web development to design, video editing to content creation. Start building your dream team today.
            </motion.p>

            {/* Search Bar */}
            <motion.div variants={fadeInUp} className="max-w-2xl mx-auto mb-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search for skills, creators, or projects..."
                  className="input-field flex-1 text-base"
                  aria-label="Search for skills, creators, or projects"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSearch}
                  className="btn-primary flex items-center justify-center space-x-2 whitespace-nowrap"
                  aria-label="Search"
                >
                  <FiSearch aria-hidden="true" />
                  <span>Search</span>
                </motion.button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary px-8 py-3 text-base w-full sm:w-auto"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link to="/projects">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-secondary px-8 py-3 text-base w-full sm:w-auto"
                >
                  Browse Projects
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              variants={fadeInUp}
              className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto"
            >
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  1000+
                </div>
                <div className="text-gray-600 dark:text-gray-400">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  500+
                </div>
                <div className="text-gray-600 dark:text-gray-400">Projects Completed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  98%
                </div>
                <div className="text-gray-600 dark:text-gray-400">Client Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="section-title">
              Why Choose SkillNexus?
            </motion.h2>
            <motion.p variants={fadeInUp} className="section-subtitle">
              The all-in-one platform connecting creators and clients
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="card text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="section-title">Featured Creators</h2>
              <p className="section-subtitle">Discover talented professionals ready to bring your ideas to life</p>
            </div>
            <Link
              to="/projects"
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : creators.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {creators.slice(0, 6).map((creator) => (
                <motion.div key={creator._id} variants={fadeInUp}>
                  <CreatorCard creator={creator} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>No creators found. Be the first to join!</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Projects Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h2 className="section-title">Recent Projects</h2>
              <p className="section-subtitle">Browse the latest work posted by creators</p>
            </div>
            <Link
              to="/projects"
              className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium transition-colors"
            >
              <span>View All</span>
              <FiArrowRight />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="spinner"></div>
            </div>
          ) : posts.length > 0 ? (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
              variants={staggerContainer}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {posts.slice(0, 6).map((post) => (
                <motion.div key={post._id} variants={fadeInUp}>
                  <PostCard post={post} />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400 py-12">
              <p>No projects available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="section-title">
              How It Works
            </motion.h2>
            <motion.p variants={fadeInUp} className="section-subtitle">
              Get started in three simple steps
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map((item, index) => (
              <motion.div key={index} variants={fadeInUp} className="relative">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-md hover:shadow-xl transition-shadow duration-300">
                  <div className="text-5xl font-bold text-primary-100 dark:text-primary-900 mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {item.description}
                  </p>
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2" aria-hidden="true">
                    <FiArrowRight className="text-primary-300 dark:text-primary-700" size={32} />
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join thousands of creators and clients connecting on SkillNexus. Build amazing projects together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-primary-600 font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 w-full sm:w-auto"
                >
                  Sign Up as Creator
                </motion.button>
              </Link>
              <Link to="/register">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white hover:text-primary-600 transition-all duration-200 w-full sm:w-auto"
                >
                  Sign Up as Client
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.h2 variants={fadeInUp} className="section-title">
              What Our Users Say
            </motion.h2>
            <motion.p variants={fadeInUp} className="section-subtitle">
              Success stories from creators and clients
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="card"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={testimonial.avatar}
                    alt={`${testimonial.name}'s avatar`}
                    className="w-12 h-12 rounded-full"
                    loading="lazy"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  "{testimonial.comment}"
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
