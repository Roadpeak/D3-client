// pages/ChatPage.jsx - Updated with dark mode support
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, ArrowLeft, User, Clock, Check, CheckCheck, AlertCircle, Star, Loader2, MessageCircle, Store, Paperclip, X } from 'lucide-react';
import chatService from '../services/chatService';
import useSocket from '../hooks/useSocket';
import authService from '../services/authService';
import VerificationBadge from '../components/VerificationBadge';
import { useAuth } from '../utils/context/AuthContext';

const ChatPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Use AuthContext for user - ProtectedRoute already verified auth
  const { user: authUser, loading: authLoading } = useAuth();

  // Transform authUser to chat user format - memoized to prevent infinite re-renders
  const user = useMemo(() => {
    if (!authUser) return null;
    return {
      id: authUser.id,
      name: `${authUser.firstName || ''} ${authUser.lastName || ''}`.trim() || 'Customer',
      email: authUser.email,
      avatar: authUser.avatar,
      userType: 'customer',
      role: 'customer'
    };
  }, [authUser?.id, authUser?.firstName, authUser?.lastName, authUser?.email, authUser?.avatar]);

  // Initialize socket for customer
  const {
    socket,
    isConnected,
    joinConversation,
    leaveConversation,
    handleTyping,
    on,
    off,
    isUserOnline,
    getTypingUsers
  } = useSocket(user);

  // Socket event handlers for customer↔store communication
  useEffect(() => {
    if (!socket || !user) return;

    console.log('🔌 Setting up CUSTOMER socket handlers for store communication');

    // Handle store messages (messages FROM stores TO this customer)
    const handleStoreToCustomerMessage = (messageData) => {
      console.log('📨 Customer received store message:', messageData);

      // Only add message if it's FROM a store AND for the current conversation
      if ((messageData.sender === 'store' || messageData.sender_type === 'store') &&
        selectedChat &&
        messageData.conversationId === selectedChat.id) {

        console.log('✅ Adding store message to customer chat');
        setMessages(prev => [...prev, messageData]);
        scrollToBottom();
      }

      // Update chat list with new message info
      setChats(prev => prev.map(chat => {
        if (chat.id === messageData.conversationId) {
          return {
            ...chat,
            lastMessage: messageData.text || messageData.content,
            lastMessageTime: 'now',
            unreadCount: (chat.unreadCount || 0) + 1
          };
        }
        return chat;
      }));

      // Dispatch event to update navbar count
      window.dispatchEvent(new CustomEvent('messageReceived'));
    };

    // Handle general new messages but filter for store messages
    const handleNewMessage = (messageData) => {
      console.log('📨 Customer received general message:', messageData);

      // Only handle messages FROM stores TO this customer
      if ((messageData.sender === 'store' || messageData.sender_type === 'store') &&
        (messageData.recipient_type === 'customer' || messageData.type === 'store_to_customer')) {

        if (selectedChat && messageData.conversationId === selectedChat.id) {
          console.log('✅ Adding store message to customer chat');
          setMessages(prev => [...prev, messageData]);
          scrollToBottom();
        }

        // Update chat list
        setChats(prev => prev.map(chat => {
          if (chat.id === messageData.conversationId) {
            return {
              ...chat,
              lastMessage: messageData.text || messageData.content,
              lastMessageTime: 'now',
              unreadCount: (chat.unreadCount || 0) + 1
            };
          }
          return chat;
        }));

        // Dispatch event to update navbar count
        window.dispatchEvent(new CustomEvent('messageReceived'));
      } else {
        console.log('⚠️ Ignoring message not from store to customer');
      }
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      console.log('📝 Customer received message status update:', messageId, status);
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, status } : msg
      ));
    };

    const handleMessagesRead = ({ readBy }) => {
      console.log('📖 Messages read by store:', readBy);
      // Update status for messages sent by this customer
      setMessages(prev => prev.map(msg =>
        msg.sender === 'user' || msg.sender === 'customer' ? { ...msg, status: 'read' } : msg
      ));
    };

    // Subscribe to customer↔store events
    const unsubscribers = [
      on('new_store_to_customer_message', handleStoreToCustomerMessage),
      on('new_message', handleNewMessage),
      on('message_status_update', handleMessageStatusUpdate),
      on('messages_read', handleMessagesRead)
    ];

    return () => {
      console.log('🧹 Cleaning up customer socket handlers');
      unsubscribers.forEach(unsub => unsub && unsub());
    };
  }, [socket, on, off, selectedChat, user]);

  // Load customer↔store chats WITHOUT auto-selection
  useEffect(() => {
    if (user) {
      loadChats();

      // ONLY auto-select if there's a specific conversation passed via navigation state
      if (location.state?.selectedConversation) {
        console.log('📌 Auto-selecting conversation from navigation state');
        setSelectedChat(location.state.selectedConversation);
        loadMessages(location.state.selectedConversation.id);
      } else if (location.state?.newConversationId) {
        console.log('📌 Auto-selecting new conversation from navigation state');
        const newChatId = location.state.newConversationId;
        loadMessages(newChatId);
      }
    }
  }, [user, location.state]);

  // Load customer's chats with stores WITHOUT auto-selection
  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user is logged in using localStorage flag
      // Actual auth token is in HttpOnly cookie and sent automatically via credentials: 'include'
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      console.log('🔧 User logged in status:', isLoggedIn);

      if (!isLoggedIn) {
        console.log('❌ User not logged in');
        setError('Please log in to view your chats');
        return;
      }

      console.log('📋 Loading CUSTOMER↔STORE conversations...');
      const response = await chatService.getConversations('customer');

      console.log('📡 Customer↔store chat API response:', response);

      if (response.success) {
        console.log('✅ Setting chats with data:', response.data);
        console.log('✅ Number of chats:', response.data?.length || 0);
        setChats(response.data || []);

        if (location.state?.newConversationId) {
          const newChat = response.data.find(chat => chat.id === location.state.newConversationId);
          if (newChat) {
            console.log('📌 Auto-selecting new conversation:', newChat.id);
            setSelectedChat(newChat);
            loadMessages(newChat.id);
          }
        }

      } else {
        setError(response.message || 'Failed to load chats');
      }
    } catch (error) {
      console.error('Failed to load customer↔store chats:', error);
      setError('Failed to load chats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected customer↔store chat
  const loadMessages = async (chatId) => {
    try {
      setError(null);
      console.log('📨 Loading customer↔store messages for chat:', chatId);
      const response = await chatService.getMessages(chatId);

      if (response.success) {
        console.log('✅ Loaded customer↔store messages:', response.data.length);
        setMessages(response.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
      setError('Failed to load messages');
    }
  };

  // Handle chat selection
  const handleChatSelect = (chat) => {
    console.log('👆 Customer selecting store chat:', chat.id);

    if (selectedChat) {
      leaveConversation(selectedChat.id);
    }

    setSelectedChat(chat);
    joinConversation(chat.id);
    loadMessages(chat.id);
    markAsRead(chat.id);

    window.dispatchEvent(new CustomEvent('chatUpdated'));
  };

  // Mark store messages as read
  const markAsRead = async (chatId) => {
    try {
      await chatService.markMessagesAsRead(chatId);

      setChats(prev => prev.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      ));

      window.dispatchEvent(new CustomEvent('chatUpdated'));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Image handling functions
  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send message to store
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || sendingMessage) return;

    const messageText = message.trim();

    try {
      setSendingMessage(true);
      setError(null);
      setMessage('');

      console.log('📤 Customer sending message to store:', {
        chatId: selectedChat.id,
        storeName: selectedChat.store?.name,
        content: messageText,
        messageType: 'customer_to_store'
      });

      const response = await chatService.sendMessage(
        selectedChat.id,
        messageText,
        'text'
      );

      if (response.success) {
        console.log('✅ Customer message to store sent successfully');

        const newMessage = {
          id: response.data.id || `temp-${Date.now()}`,
          text: messageText,
          sender: 'user',
          senderInfo: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          },
          timestamp: 'now',
          status: 'sent',
          messageType: 'text'
        };

        setMessages(prev => [...prev, newMessage]);
        scrollToBottom();

        setChats(prev => prev.map(chat =>
          chat.id === selectedChat.id
            ? {
              ...chat,
              lastMessage: messageText,
              lastMessageTime: 'now'
            }
            : chat
        ));

        window.dispatchEvent(new CustomEvent('chatUpdated'));
      } else {
        throw new Error(response.message || 'Failed to send message');
      }
    } catch (error) {
      console.error('❌ Failed to send customer message to store:', error);
      setError('Failed to send message');
      setMessage(messageText);
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle sending with image
  const handleSendWithImage = async () => {
    if (selectedImage) {
      console.log('Sending image:', selectedImage);
      removeSelectedImage();
    }
    if (message.trim()) {
      await handleSendMessage();
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    if (selectedChat) {
      handleTyping(selectedChat.id);
    }
  };

  const handleBackToSidebar = () => {
    if (selectedChat) {
      leaveConversation(selectedChat.id);
    }
    setSelectedChat(null);
    setMessages([]);
  };

  const handleViewStore = (storeId) => {
    if (storeId) {
      navigate(`/store/${storeId}`);
    }
  };

  const filteredChats = chats.filter(chat => {
    const storeName = chat.store?.name?.toLowerCase() || '';
    return storeName.includes(searchTerm.toLowerCase());
  });

  // Debug: Log filtered chats on each render
  console.log('🔍 Chat render - chats:', chats.length, 'filtered:', filteredChats.length, 'searchTerm:', searchTerm);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      selectedImage ? handleSendWithImage() : handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const totalUnreadCount = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
  const typingUsers = selectedChat ? getTypingUsers(selectedChat.id) : [];

  // Skeleton Components
  const ChatListItemSkeleton = () => (
    <div className="flex items-start p-4 animate-pulse">
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded-full" />
      </div>
      <div className="ml-3 flex-1">
        <div className="flex items-start justify-between mb-1">
          <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-3 w-10 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  const PageSkeleton = () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto h-full bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          <div className="flex w-full" style={{ height: 'calc(100vh - 60px)' }}>
            {/* Sidebar Skeleton */}
            <div className="flex w-full xl:w-80 flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
              {/* Search Skeleton */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="h-10 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
              </div>
              {/* Chat List Skeleton */}
              <div className="flex-1 overflow-hidden">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <ChatListItemSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Chat Area Skeleton - Hidden on mobile */}
            <div className="hidden xl:flex flex-1 flex-col bg-white dark:bg-gray-800">
              <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-center max-w-lg px-8 animate-pulse">
                  {/* Icon placeholder */}
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
                  {/* Title placeholder */}
                  <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-3" />
                  {/* Description placeholder */}
                  <div className="space-y-2 mb-8">
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mx-auto" />
                  </div>
                  {/* Stats placeholder */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full" />
                      <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state - show skeleton while auth is loading OR chats are loading
  if (authLoading || loading) {
    return <PageSkeleton />;
  }

  // If no user after auth loading is done, ProtectedRoute should have redirected
  // This is a fallback - should not normally happen
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">Authentication required...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col transition-colors duration-200">
      {/* Main Chat Container */}
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto h-full bg-white dark:bg-gray-800 shadow-sm transition-colors duration-200">
          <div className="flex w-full" style={{ height: 'calc(100vh - 60px)' }}>
            {/* Store Chat List Sidebar */}
            <div className={`${selectedChat
              ? 'hidden xl:flex'
              : 'flex'
              } w-full xl:w-80 flex-col bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transition-colors duration-200`}>

              {/* Search */}
              <div className="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors duration-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
                  />
                </div>
              </div>

              {/* Store Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500 dark:text-gray-400">
                    <div className="text-center px-4">
                      <Store className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                      <p className="font-medium mb-1">No store conversations found</p>
                      <p className="text-sm">Start chatting with stores!</p>
                      <button
                        onClick={() => navigate('/stores')}
                        className="mt-3 px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-sm"
                      >
                        Browse Stores
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredChats.map((chat) => {
                      const store = chat.store;
                      const storeName = store?.name || 'Unknown Store';
                      const storeAvatar = store?.avatar || store?.logo_url;

                      return (
                        <div
                          key={chat.id}
                          onClick={() => handleChatSelect(chat)}
                          className={`flex items-start p-4 hover:bg-white dark:hover:bg-gray-800 cursor-pointer transition-all duration-200 ${selectedChat?.id === chat.id
                            ? 'bg-white dark:bg-gray-800 border-r-4 border-blue-500 dark:border-blue-400 shadow-sm'
                            : 'hover:shadow-sm'
                            }`}
                        >
                          <div
                            className="relative flex-shrink-0 cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewStore(store?.id);
                            }}
                            title="View store profile"
                          >
                            <img
                              src={storeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=2563eb&color=ffffff`}
                              alt={storeName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 dark:bg-blue-600 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                              <Store className="w-2 h-2 text-white" />
                            </div>
                            {isUserOnline(store?.merchant_id) && (
                              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                            )}
                          </div>

                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm flex-shrink min-w-0">{storeName}</h3>
                                <div className="flex-shrink-0">
                                  <VerificationBadge size="sm" />
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 flex-shrink-0">
                                {chat.unreadCount > 0 && (
                                  <span className="bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                                    {chat.unreadCount}
                                  </span>
                                )}
                                <span className="text-xs text-gray-500 dark:text-gray-400">{chat.lastMessageTime}</span>
                              </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-1.5 leading-tight">{chat.lastMessage}</p>

                            <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                              <span className="truncate">{store?.category || 'Store'}</span>
                              {isUserOnline(store?.merchant_id) && (
                                <span className="text-green-500 dark:text-green-400 flex items-center gap-1 flex-shrink-0 ml-2">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  Online
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedChat
              ? 'flex'
              : 'hidden xl:flex'
              } flex-1 flex-col bg-white dark:bg-gray-800 transition-colors duration-200`}>
              {selectedChat ? (
                <>
                  {/* Store Chat Header */}
                  <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3 flex-shrink-0 transition-colors duration-200">
                    <button
                      onClick={handleBackToSidebar}
                      className="xl:hidden flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </button>

                    <div
                      className="relative flex-shrink-0 cursor-pointer"
                      onClick={() => handleViewStore(selectedChat.store?.id)}
                      title="View store profile"
                    >
                      <img
                        src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                        alt={selectedChat.store?.name || 'Store'}
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 dark:bg-blue-600 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <Store className="w-2 sm:w-2.5 h-2 sm:h-2.5 text-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">{selectedChat.store?.name || 'Store'}</h2>
                        <div className="flex-shrink-0">
                          <VerificationBadge size="sm" />
                        </div>
                        <span className="hidden sm:inline-block px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium rounded-full flex-shrink-0">Store</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {isUserOnline(selectedChat.store?.merchant_id) ? (
                          <span className="text-green-600 dark:text-green-400 flex items-center gap-1 flex-shrink-0">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="hidden sm:inline">Store is Online</span>
                            <span className="sm:hidden">Online</span>
                          </span>
                        ) : (
                          <span className="truncate">Store will respond soon</span>
                        )}
                        {selectedChat.store?.category && (
                          <span className="text-gray-400 dark:text-gray-500 hidden sm:inline flex-shrink-0">• {selectedChat.store.category}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center max-w-md">
                          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Store className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-medium mb-2 text-gray-900 dark:text-gray-100">Start chatting with {selectedChat.store?.name || 'this store'}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Ask about products, services, store hours, or anything else!</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, index) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender === 'user' || msg.sender === 'customer'
                                ? 'justify-end'
                                : 'justify-start'
                              }`}
                          >
                            <div className="flex items-end space-x-3 max-w-md lg:max-w-lg xl:max-w-xl">
                              {/* Store avatar for store messages */}
                              {(msg.sender === 'store') && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                                    alt="Store"
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                </div>
                              )}

                              <div
                                className={`px-4 py-3 rounded-2xl max-w-full ${msg.sender === 'user' || msg.sender === 'customer'
                                  ? 'bg-blue-500 dark:bg-blue-600 text-white rounded-br-md'
                                  : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700 shadow-sm'
                                  }`}
                              >
                                {/* Store name for store messages */}
                                {msg.sender === 'store' && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Store className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{selectedChat.store?.name || 'Store'}</span>
                                  </div>
                                )}

                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>

                                <div className={`flex items-center justify-end mt-2 space-x-1 ${msg.sender === 'user' || msg.sender === 'customer'
                                  ? 'text-blue-100 dark:text-blue-200'
                                  : 'text-gray-500 dark:text-gray-400'
                                  }`}>
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs">{msg.timestamp}</span>
                                  {(msg.sender === 'user' || msg.sender === 'customer') && (
                                    <div className="ml-1">
                                      {msg.status === 'read' ? (
                                        <CheckCheck className="w-3 h-3 text-blue-200 dark:text-blue-300" />
                                      ) : (
                                        <Check className="w-3 h-3" />
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Customer avatar for customer messages */}
                              {(msg.sender === 'user' || msg.sender === 'customer') && (
                                <div className="flex-shrink-0">
                                  <img
                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                    alt="You"
                                    className="w-8 h-8 rounded-full object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}

                        {/* Typing indicator for store */}
                        {typingUsers.length > 0 && (
                          <div className="flex justify-start">
                            <div className="flex items-end space-x-3">
                              <img
                                src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                                alt="Store"
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="bg-white dark:bg-gray-800 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 mb-16 lg:mb-0 transition-colors duration-200">
                    {/* Image Preview Area */}
                    {imagePreview && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Image to send:</span>
                          <button
                            onClick={removeSelectedImage}
                            className="text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-full sm:max-w-sm max-h-40 sm:max-h-48 rounded-lg border border-gray-300 dark:border-gray-600 shadow-sm"
                        />
                      </div>
                    )}

                    {/* Input Container */}
                    <div className="flex items-end gap-2 sm:gap-3">
                      <div className="flex-1 min-w-0 relative bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-2xl sm:rounded-3xl flex items-center transition-colors duration-200">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-shrink-0 p-2 sm:p-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                          title="Attach image"
                        >
                          <Paperclip className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>

                        <textarea
                          value={message}
                          onChange={handleMessageChange}
                          onKeyPress={handleKeyPress}
                          placeholder="Type a message..."
                          rows={1}
                          disabled={sendingMessage || !isConnected}
                          className="flex-1 min-w-0 px-1 sm:px-2 py-2.5 sm:py-3 bg-transparent border-none focus:outline-none resize-none max-h-32 disabled:cursor-not-allowed placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                          style={{ minHeight: '40px' }}
                        />
                      </div>

                      <button
                        onClick={selectedImage ? handleSendWithImage : handleSendMessage}
                        disabled={(!message.trim() && !selectedImage) || sendingMessage || !isConnected}
                        className="flex-shrink-0 p-2.5 sm:p-3 bg-blue-500 dark:bg-blue-600 text-white rounded-full hover:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        title={!isConnected ? 'Connecting...' : 'Send message'}
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                        )}
                      </button>
                    </div>

                    {/* Connection Status */}
                    {!isConnected && (
                      <div className="mt-2">
                        <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Connecting to chat server...
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </div>
                </>
              ) : (
                /* Welcome Screen */
                <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
                  <div className="text-center max-w-lg px-8">
                    <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-12 h-12 text-blue-500 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-3">Welcome to Store Chat</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                      Connect with stores to ask questions, get support, and stay updated on your orders. Select a conversation from the sidebar to start chatting.
                    </p>

                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-orange-500 dark:text-orange-400" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalUnreadCount}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Unread Messages</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{chats.length}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">Store Conversations</div>
                        </div>
                      </div>
                    </div>

                    {chats.length === 0 ? (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't started any conversations with stores yet.</p>
                        <button
                          onClick={() => navigate('/stores')}
                          className="px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors font-medium"
                        >
                          Browse Stores to Start Chatting
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">Select a store conversation from the sidebar to continue chatting.</p>
                        {totalUnreadCount > 0 && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">You have {totalUnreadCount} unread message{totalUnreadCount !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;