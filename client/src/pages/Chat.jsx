import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { messageAPI, userAPI } from '../utils/api';
import socketService from '../utils/socket';
import ChatBox from '../components/ChatBox';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';



const Chat = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  
  const socketConnected = useRef(false);
  const typingTimeout = useRef(null);
  const isLoadingUser = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user?._id || socketConnected.current) return;

    socketService.connect(user._id);
    socketConnected.current = true;

    socketService.onMessageReceive((message) => {
      setMessages((prev) => {
        const exists = prev.find(m => m._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
      updateConversationWithNewMessage(message);
    });

    socketService.onTypingStart((senderId) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(true);
      }
    });

    socketService.onTypingStop((senderId) => {
      if (selectedUser?._id === senderId) {
        setIsTyping(false);
      }
    });

    socketService.onUserOnline((userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    socketService.onUserOffline((userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    return () => {
      socketService.removeAllListeners();
      socketService.disconnect();
      socketConnected.current = false;
    };
  }, [user?._id, selectedUser]);

  useEffect(() => {
    setIsTyping(false);
  }, [selectedUser]);

  useEffect(() => {
    if (user?._id) {
      fetchConversations();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!userId || !user?._id || isLoadingUser.current) return;

    const timer = setTimeout(() => {
      handleUserFromUrl(userId);
    }, 500);

    return () => clearTimeout(timer);
  }, [userId, user?._id, conversations]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await messageAPI.getAllConversations();
      const convs = response.data.data || [];
      setConversations(convs);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserFromUrl = async (targetUserId) => {
    if (isLoadingUser.current) return;
    
    try {
      isLoadingUser.current = true;

      const existingConv = conversations.find((conv) => conv.user._id === targetUserId);
      
      if (existingConv) {
        handleSelectUser(existingConv.user);
      } else {
        const response = await userAPI.getProfile(targetUserId);
        const userData = response.data.data;
        
        setSelectedUser(userData);
        setMessages([]);
        
        setConversations(prev => [{
          user: userData,
          lastMessage: null,
          unreadCount: 0,
        }, ...prev]);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      toast.error('Failed to load user');
      navigate('/chat');
    } finally {
      isLoadingUser.current = false;
    }
  };

  const handleSelectUser = async (otherUser) => {
    setSelectedUser(otherUser);
    
    try {
      const response = await messageAPI.getConversation(otherUser._id);
      const loadedMessages = response.data.data || [];
      setMessages(loadedMessages);

      await messageAPI.markAsRead(otherUser._id);

      setConversations((prev) =>
        prev.map((conv) =>
          conv.user._id === otherUser._id ? { ...conv, unreadCount: 0 } : conv
        )
      );
    } catch (error) {
      setMessages([]);
    }
  };

  const handleSendMessage = async (content) => {
    if (!selectedUser || !content.trim()) return;

    const tempId = `temp_${Date.now()}`;
    const tempMessage = {
      _id: tempId,
      sender: { _id: user._id, name: user.name, profileImage: user.profileImage },
      receiver: { _id: selectedUser._id },
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const response = await messageAPI.sendMessage({
        receiverId: selectedUser._id,
        content: content.trim(),
      });

      const savedMessage = response.data.data;

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempId ? savedMessage : msg))
      );

      socketService.sendMessage(selectedUser._id, savedMessage);
      updateConversationWithNewMessage(savedMessage);
    } catch (error) {
      toast.error('Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg._id !== tempId));
    }
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations((prev) => {
      const otherUserId =
        (message.sender?._id || message.sender) === user._id
          ? (message.receiver?._id || message.receiver)
          : (message.sender?._id || message.sender);

      const existingConvIndex = prev.findIndex(
        (conv) => conv.user._id === otherUserId
      );

      if (existingConvIndex !== -1) {
        const updated = [...prev];
        updated[existingConvIndex] = {
          ...updated[existingConvIndex],
          lastMessage: message,
        };
        const [conversation] = updated.splice(existingConvIndex, 1);
        return [conversation, ...updated];
      }

      return prev;
    });
  };

  const handleTyping = () => {
    if (!selectedUser) return;

    socketService.startTyping(selectedUser._id, user._id);
    
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }
    
    typingTimeout.current = setTimeout(() => {
      socketService.stopTyping(selectedUser._id, user._id);
    }, 2000);
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatLastMessageTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const messageDate = new Date(date);
    const diffInMs = now - messageDate;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMs / 3600000);
    const diffInDays = Math.floor(diffInMs / 86400000);

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return messageDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const showChatBox = isMobileView && selectedUser;

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-2 sm:py-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* MOBILE RESPONSIVE CONTAINER */}
        <div className="flex h-[calc(100vh-120px)] sm:h-[600px] max-h-[calc(100vh-120px)] sm:max-h-[600px] rounded-none sm:rounded-xl overflow-hidden shadow-lg sm:shadow-2xl">
          
          {/* Conversations List */}
          {(!isMobileView || !showChatBox) && (
            <div className="w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
              <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-3">
                  Messages
                </h2>
                
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="spinner"></div>
                  </div>
                ) : filteredConversations.length === 0 && !selectedUser ? (
                  <div className="text-center text-gray-500 dark:text-gray-400 mt-8 px-4">
                    <p className="text-xs sm:text-sm">No conversations yet</p>
                    <p className="text-xs mt-1 sm:mt-2">
                      Visit creator profiles to start chatting
                    </p>
                  </div>
                ) : (
                  <>
                    {selectedUser && !conversations.find(c => c.user._id === selectedUser._id) && (
                      <div
                        onClick={() => handleSelectUser(selectedUser)}
                        className="p-2 sm:p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 bg-primary-50 dark:bg-primary-900/20"
                      >
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <img
                            src={selectedUser.profileImage || 'https://via.placeholder.com/150'}
                            alt={selectedUser.name}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                              {selectedUser.name}
                            </h3>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              New conversation
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {filteredConversations.map((conversation) => {
                      const isSelected = selectedUser?._id === conversation.user._id;
                      const isOnline = onlineUsers.has(conversation.user._id);

                      return (
                        <motion.div
                          key={conversation.user._id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          onClick={() => handleSelectUser(conversation.user)}
                          className={`p-2 sm:p-3 cursor-pointer border-b border-gray-100 dark:border-gray-700 transition-colors ${
                            isSelected
                              ? 'bg-primary-50 dark:bg-primary-900/20'
                              : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={conversation.user.profileImage || 'https://via.placeholder.com/150'}
                                alt={conversation.user.name}
                                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                              />
                              {isOnline && (
                                <div className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                                  {conversation.user.name}
                                </h3>
                                {conversation.lastMessage && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2 flex-shrink-0">
                                    {formatLastMessageTime(conversation.lastMessage.createdAt)}
                                  </span>
                                )}
                              </div>

                              {conversation.lastMessage && (
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  {(conversation.lastMessage.sender === user._id ||
                                  conversation.lastMessage.sender?._id === user._id)
                                    ? 'You: '
                                    : ''}
                                  {conversation.lastMessage.content}
                                </p>
                              )}

                              {conversation.unreadCount > 0 && (
                                <span className="inline-block mt-1 px-2 py-0.5 bg-primary-600 text-white text-xs rounded-full">
                                  {conversation.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Chat Box */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 min-w-0">
            {selectedUser ? (
              <>
                {isMobileView && (
                  <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        navigate('/chat');
                      }}
                      className="flex items-center space-x-2 text-primary-600 dark:text-primary-400 text-xs sm:text-sm"
                    >
                      <FiArrowLeft size={16} />
                      <span>Back</span>
                    </button>
                  </div>
                )}

                <ChatBox
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                  currentUser={user}
                  otherUser={selectedUser}
                  isTyping={isTyping}
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-300 dark:text-gray-600 mb-2 sm:mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-sm sm:text-lg font-medium mb-1">Select a conversation</p>
                  <p className="text-xs sm:text-sm">
                    Choose from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
