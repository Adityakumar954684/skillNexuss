import Message from '../models/Message.js';

/**
 * Generate unique conversation ID between two users
 */
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('-');
};

/**
 * @desc    Send a message
 * @route   POST /api/messages
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;

    if (!receiverId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Receiver and content are required',
      });
    }

    const conversationId = getConversationId(req.user._id.toString(), receiverId);

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
      conversationId,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage');

    res.status(201).json({
      success: true,
      data: populatedMessage,
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get conversation between two users
 * @route   GET /api/messages/:userId
 * @access  Private
 */
export const getConversation = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const conversationId = getConversationId(req.user._id.toString(), otherUserId);

    const messages = await Message.find({ conversationId })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Get all conversations for current user
 * @route   GET /api/messages/conversations
 * @access  Private
 */
export const getAllConversations = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    // Get all unique conversation partners
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'name profileImage')
      .populate('receiver', 'name profileImage')
      .sort({ createdAt: -1 });

    // Extract unique conversations with last message
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUser = message.sender._id.toString() === userId 
        ? message.receiver 
        : message.sender;
      
      const otherUserId = otherUser._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount: 0,
        });
      }

      // Count unread messages
      if (
        message.receiver._id.toString() === userId &&
        !message.isRead
      ) {
        conversationsMap.get(otherUserId).unreadCount++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      data: conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};

/**
 * @desc    Mark messages as read
 * @route   PUT /api/messages/read/:userId
 * @access  Private
 */
export const markMessagesAsRead = async (req, res) => {
  try {
    const otherUserId = req.params.userId;
    const conversationId = getConversationId(req.user._id.toString(), otherUserId);

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error',
    });
  }
};
