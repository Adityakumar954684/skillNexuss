import { useState, useEffect, useRef } from 'react';
import { FiSend, FiMoreVertical, FiTrash2, FiX } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const ChatBox = ({ messages, onSendMessage, onTyping, onDeleteMessage, onClearChat, currentUser, otherUser, isTyping }) => {
  const [newMessage, setNewMessage] = useState('');
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const prevMessagesLength = useRef(messages.length);
  const hasInitiallyLoaded = useRef(false);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end'
      });
    }
  };

  useEffect(() => {
    if (messages.length === 0) return;

    if (!hasInitiallyLoaded.current) {
      hasInitiallyLoaded.current = true;
      prevMessagesLength.current = messages.length;
      return;
    }

    if (messages.length > prevMessagesLength.current) {
      const lastMessage = messages[messages.length - 1];
      const isSentByCurrentUser = (lastMessage?.sender?._id || lastMessage?.sender) === currentUser._id;
      
      if (isSentByCurrentUser) {
        setTimeout(() => scrollToBottom(), 100);
      }
    }
    
    prevMessagesLength.current = messages.length;
  }, [messages, currentUser._id]);

  useEffect(() => {
    hasInitiallyLoaded.current = false;
    prevMessagesLength.current = 0;
  }, [otherUser?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const trimmedMessage = newMessage.trim();
    
    if (!trimmedMessage || !otherUser) return;
    
    onSendMessage(trimmedMessage);
    setNewMessage('');
    
    setTimeout(() => scrollToBottom(), 50);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setNewMessage(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const handleDeleteMessage = (messageId) => {
    if (onDeleteMessage) {
      onDeleteMessage(messageId);
    }
    setSelectedMessageId(null);
  };

  const handleClearAllMessages = () => {
    if (onClearChat && window.confirm('Are you sure you want to clear all messages? This action cannot be undone.')) {
      onClearChat(otherUser._id);
      setShowDeleteMenu(false);
    }
  };

  const formatTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isSenderMessage = (message) => {
    const senderId = message.sender?._id || message.sender;
    return senderId === currentUser._id;
  };

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Chat Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-2 py-2 sm:px-3 sm:py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <img
              src={otherUser?.profileImage || 'https://via.placeholder.com/150'}
              alt={otherUser?.name || 'User'}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-white truncate">
                {otherUser?.name || 'Unknown User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {isTyping ? 'Typing...' : 'Online'}
              </p>
            </div>
          </div>

          {/* Chat Options Menu */}
          <div className="relative">
            <button
              onClick={() => setShowDeleteMenu(!showDeleteMenu)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              aria-label="Chat options"
            >
              <FiMoreVertical size={18} className="text-gray-600 dark:text-gray-400" />
            </button>

            <AnimatePresence>
              {showDeleteMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                >
                  <button
                    onClick={handleClearAllMessages}
                    className="w-full px-4 py-3 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 rounded-lg transition-colors"
                  >
                    <FiTrash2 size={16} />
                    <span>Clear All Messages</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-2 sm:px-4 sm:py-3 space-y-2 bg-gray-50 dark:bg-gray-900"
        style={{ minHeight: 0 }}
        onClick={() => setSelectedMessageId(null)}
      >
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
            <p className="text-xs sm:text-sm">No messages yet</p>
            <p className="text-xs mt-1">Start the conversation!</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isSender = isSenderMessage(message);
            const isSelected = selectedMessageId === message._id;
            
            return (
              <motion.div
                key={message._id || `msg-${index}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${isSender ? 'justify-end' : 'justify-start'} group`}
              >
                <div className="relative">
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isSender) {
                        setSelectedMessageId(isSelected ? null : message._id);
                      }
                    }}
                    className={`max-w-[80%] sm:max-w-xs lg:max-w-sm px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg cursor-pointer ${
                      isSender
                        ? 'bg-primary-600 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    } ${isSelected ? 'ring-2 ring-primary-400' : ''}`}
                  >
                    <p className="text-xs sm:text-sm break-words">{message.content}</p>
                    <p
                      className={`text-xs mt-0.5 ${
                        isSender ? 'text-primary-200' : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>

                  {/* Delete Button - Only for sender's messages */}
                  {isSender && isSelected && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Delete this message?')) {
                          handleDeleteMessage(message._id);
                        }
                      }}
                      className="absolute -bottom-8 right-0 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1 shadow-lg transition-colors"
                    >
                      <FiTrash2 size={12} />
                      Delete
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 px-3 py-2 rounded-lg">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-2 py-2 sm:px-3 sm:py-3">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-stretch gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={handleChange}
              onKeyPress={handleKeyPress}
              placeholder="Type message..."
              autoComplete="off"
              className="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="flex-shrink-0 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg px-3 sm:px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiSend size={18} className="sm:mr-0" />
              <span className="hidden sm:inline ml-1 text-sm">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
