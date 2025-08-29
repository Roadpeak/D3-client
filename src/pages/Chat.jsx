// pages/ChatPage.jsx - Updated with NO auto-selection
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, ArrowLeft, User, Clock, Check, CheckCheck, AlertCircle, Star, Loader2, MessageCircle, Store, Paperclip, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import chatService from '../services/chatService';
import useSocket from '../hooks/useSocket';

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
  const [user, setUser] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Enhanced cookie reading function
  const getCookieValue = (name) => {
    if (typeof document === 'undefined') return '';
    
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === name) return decodeURIComponent(value);
    }
    return '';
  };

  // Initialize customer user
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('🚀 Initializing CUSTOMER for store chat...');
        
        if (location.state?.user) {
          console.log('✅ Customer found in location state');
          const userData = {
            ...location.state.user,
            userType: 'customer',
            role: 'customer'
          };
          setUser(userData);
          return;
        }

        const tokenSources = {
          localStorage_access_token: localStorage.getItem('access_token'),
          localStorage_authToken: localStorage.getItem('authToken'),
          localStorage_token: localStorage.getItem('token'),
          cookie_authToken: getCookieValue('authToken'),
          cookie_access_token: getCookieValue('access_token'),
          cookie_token: getCookieValue('token')
        };

        const userToken = tokenSources.localStorage_access_token || 
                          tokenSources.localStorage_authToken || 
                          tokenSources.localStorage_token ||
                          tokenSources.cookie_authToken ||
                          tokenSources.cookie_access_token ||
                          tokenSources.cookie_token;
        
        if (!userToken) {
          console.log('❌ No token found, redirecting to login');
          navigate('/accounts/sign-in', { 
            state: { from: { pathname: location.pathname } }
          });
          return;
        }

        // Try to get user info from localStorage first
        let userInfo = null;
        const possibleKeys = ['userInfo', 'user', 'userData', 'currentUser'];
        
        for (const key of possibleKeys) {
          try {
            const stored = localStorage.getItem(key);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (parsed && (parsed.id || parsed.userId)) {
                userInfo = parsed;
                console.log(`✅ Customer info found in localStorage.${key}`);
                break;
              }
            }
          } catch (e) {
            console.log(`⚠️ Failed to parse ${key}:`, e.message);
          }
        }

        if (userInfo && (userInfo.id || userInfo.userId)) {
          const userData = {
            id: userInfo.id || userInfo.userId,
            name: `${userInfo.firstName || userInfo.first_name || 'Customer'} ${userInfo.lastName || userInfo.last_name || ''}`.trim(),
            email: userInfo.email,
            avatar: userInfo.avatar,
            userType: 'customer',
            role: 'customer'
          };
          
          console.log('✅ Customer user set from localStorage:', userData);
          setUser(userData);
          return;
        }

        // Fetch from API as fallback
        try {
          const response = await fetch('${process.env.REACT_APP_API_BASE_URL}/api/v1/users/profile', {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          if (response.ok) {
            const apiResult = await response.json();
            const apiUserData = apiResult.user || apiResult.data || apiResult;
            
            if (apiUserData && (apiUserData.id || apiUserData.userId)) {
              const userData = {
                id: apiUserData.id || apiUserData.userId,
                name: `${apiUserData.firstName || apiUserData.first_name || 'Customer'} ${apiUserData.lastName || apiUserData.last_name || ''}`.trim(),
                email: apiUserData.email,
                avatar: apiUserData.avatar,
                userType: 'customer',
                role: 'customer'
              };
              
              console.log('✅ Customer user set from API:', userData);
              localStorage.setItem('userInfo', JSON.stringify(apiUserData));
              setUser(userData);
              return;
            }
          }
        } catch (apiError) {
          console.error('🌐 API fetch error:', apiError);
        }

        console.log('❌ Could not get valid customer data, redirecting to login');
        navigate('/accounts/sign-in', { 
          state: { from: { pathname: location.pathname } }
        });

      } catch (error) {
        console.error('💥 Error initializing customer:', error);
        navigate('/accounts/sign-in', {
          state: { from: { pathname: location.pathname } }
        });
      }
    };

    initializeUser();
  }, [location, navigate]);

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

  // FIXED: Load customer↔store chats WITHOUT auto-selection
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
        // Find the conversation in the list after it's loaded
        loadMessages(newChatId);
      }
      // REMOVED: Auto-selection of first chat when no specific chat is provided
    }
  }, [user, location.state]);

  // FIXED: Load customer's chats with stores WITHOUT auto-selection
  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const currentToken = chatService.getAuthToken();
      console.log('🔧 ChatService token for customer API call:', currentToken ? `Found (${currentToken.substring(0, 20)}...)` : 'Not found');
      
      if (!currentToken) {
        console.log('❌ No token available for chat service');
        setError('Authentication token not available');
        return;
      }
      
      console.log('📋 Loading CUSTOMER↔STORE conversations...');
      const response = await chatService.getConversations('customer');
        
      console.log('📡 Customer↔store chat API response:', response);
        
      if (response.success) {
        setChats(response.data);
        
        // FIXED: Only auto-select if specifically requested via navigation state
        if (location.state?.newConversationId) {
          const newChat = response.data.find(chat => chat.id === location.state.newConversationId);
          if (newChat) {
            console.log('📌 Auto-selecting new conversation:', newChat.id);
            setSelectedChat(newChat);
            loadMessages(newChat.id);
          }
        }
        // REMOVED: Auto-selection of first chat
        // No longer auto-selects first chat - user must manually select
        
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

    // Dispatch event to update navbar count when messages are read
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

      // Dispatch event to update navbar count
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
        
        // Add the message to the customer's view immediately
        const newMessage = {
          id: response.data.id || `temp-${Date.now()}`,
          text: messageText,
          sender: 'user', // Customer sender type
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
        
        // Update chat list
        setChats(prev => prev.map(chat =>
          chat.id === selectedChat.id
            ? {
              ...chat,
              lastMessage: messageText,
              lastMessageTime: 'now'
            }
            : chat
        ));

        // Dispatch event to update navbar count
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
      // Handle image sending logic here
      console.log('Sending image:', selectedImage);
      // You'll need to implement image upload in your chatService
      // For now, we'll just remove the selected image
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

  const filteredChats = chats.filter(chat => {
    const storeName = chat.store?.name?.toLowerCase() || '';
    return storeName.includes(searchTerm.toLowerCase());
  });

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

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading your store conversations...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading customer data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      {/* Main Chat Container - Constrained width like navbar */}
      <div className="flex-1 w-full">
        <div className="max-w-7xl mx-auto h-full bg-white shadow-sm">
          {/* Main chat layout - Constrained width */}
          <div className="flex w-full" style={{ height: 'calc(100vh - 120px)' }}>
            {/* Store Chat List Sidebar - Fixed width */}
            <div className={`${selectedChat
                ? 'hidden xl:flex'
                : 'flex'
              } w-full xl:w-80 flex-col bg-gray-50 border-r border-gray-200`}>
              
              {/* Search */}
              <div className="p-4 bg-white border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search stores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Store Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500">
                    <div className="text-center px-4">
                      <Store className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p className="font-medium mb-1">No store conversations found</p>
                      <p className="text-sm">Start chatting with stores!</p>
                      <button
                        onClick={() => navigate('/stores')}
                        className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        Browse Stores
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredChats.map((chat) => {
                      const store = chat.store;
                      const storeName = store?.name || 'Unknown Store';
                      const storeAvatar = store?.avatar || store?.logo_url;
                      
                      return (
                        <div
                          key={chat.id}
                          onClick={() => handleChatSelect(chat)}
                          className={`flex items-start p-4 hover:bg-white cursor-pointer transition-all duration-200 ${
                            selectedChat?.id === chat.id 
                              ? 'bg-white border-r-4 border-blue-500 shadow-sm' 
                              : 'hover:shadow-sm'
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <img
                              src={storeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=2563eb&color=ffffff`}
                              alt={storeName}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                              <Store className="w-2 h-2 text-white" />
                            </div>
                            {isUserOnline(store?.merchant_id) && (
                              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex items-center gap-2 min-w-0">
                                <h3 className="font-semibold text-gray-900 truncate text-sm">{storeName}</h3>
                                {chat.unreadCount > 0 && (
                                  <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5 flex-shrink-0">
                                    {chat.unreadCount}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-gray-500 flex-shrink-0">{chat.lastMessageTime}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 truncate mb-2 leading-tight">{chat.lastMessage}</p>
                            
                            <div className="flex items-center justify-between text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <span>{store?.category || 'Store'}</span>
                              </span>
                              {isUserOnline(store?.merchant_id) && (
                                <span className="text-green-500 flex items-center gap-1">
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
              } flex-1 flex-col bg-white`}>
              {selectedChat ? (
                <>
                  {/* Store Chat Header - Removed action buttons */}
                  <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center">
                      <button
                        onClick={handleBackToSidebar}
                        className="xl:hidden mr-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="relative flex-shrink-0">
                        <img
                          src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                          alt={selectedChat.store?.name || 'Store'}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Store className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-center space-x-3">
                          <h2 className="text-lg font-semibold text-gray-900">{selectedChat.store?.name || 'Store'}</h2>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Store</span>
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          {isUserOnline(selectedChat.store?.merchant_id) ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              Store is Online
                            </span>
                          ) : (
                            'Store will respond soon'
                          )}
                          {selectedChat.store?.category && (
                            <span className="text-gray-400">• {selectedChat.store.category}</span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center max-w-md">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Store className="w-8 h-8 text-blue-500" />
                          </div>
                          <h3 className="text-lg font-medium mb-2 text-gray-900">Start chatting with {selectedChat.store?.name || 'this store'}</h3>
                          <p className="text-sm text-gray-600 mb-4">Ask about products, services, store hours, or anything else!</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg, index) => (
                          <div
                            key={msg.id}
                            className={`flex ${
                              // Customer messages align right, store messages align left
                              msg.sender === 'user' || msg.sender === 'customer'
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
                                className={`px-4 py-3 rounded-2xl max-w-full ${
                                  msg.sender === 'user' || msg.sender === 'customer'
                                    ? 'bg-blue-500 text-white rounded-br-md'
                                    : 'bg-white text-gray-900 rounded-bl-md border border-gray-200 shadow-sm'
                                }`}
                              >
                                {/* Store name for store messages */}
                                {msg.sender === 'store' && (
                                  <div className="flex items-center gap-2 mb-2">
                                    <Store className="w-3 h-3 text-blue-500" />
                                    <span className="text-xs font-medium text-blue-600">{selectedChat.store?.name || 'Store'}</span>
                                  </div>
                                )}
                                
                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.text}</p>
                                
                                <div className={`flex items-center justify-end mt-2 space-x-1 ${
                                  msg.sender === 'user' || msg.sender === 'customer'
                                    ? 'text-blue-100' 
                                    : 'text-gray-500'
                                }`}>
                                  <Clock className="w-3 h-3" />
                                  <span className="text-xs">{msg.timestamp}</span>
                                  {(msg.sender === 'user' || msg.sender === 'customer') && (
                                    <div className="ml-1">
                                      {msg.status === 'read' ? (
                                        <CheckCheck className="w-3 h-3 text-blue-200" />
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
                              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl rounded-bl-md shadow-sm">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* WhatsApp-style Message Input */}
                  <div className="bg-white px-8 py-6 border-t border-gray-200 flex-shrink-0">
                    {/* Image Preview Area */}
                    {imagePreview && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-sm font-medium text-gray-700">Image to send:</span>
                          <button
                            onClick={removeSelectedImage}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="max-w-sm max-h-48 rounded-lg border border-gray-300 shadow-sm"
                        />
                      </div>
                    )}
                    
                    {/* WhatsApp-style Input Container */}
                    <div className="flex items-end gap-3">
                      {/* Input with integrated attach button */}
                      <div className="flex-1 relative bg-white border border-gray-300 rounded-3xl flex items-center">
                        {/* Attach Button - Inside input like WhatsApp */}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                          title="Attach image"
                        >
                          <Paperclip className="w-5 h-5" />
                        </button>
                        
                        {/* Text Input */}
                        <textarea
                          value={message}
                          onChange={handleMessageChange}
                          onKeyPress={handleKeyPress}
                          placeholder={`Chat with ${selectedChat.store?.name || 'store'}...`}
                          rows={1}
                          disabled={sendingMessage || !isConnected}
                          className="flex-1 px-2 py-3 bg-transparent border-none focus:outline-none resize-none max-h-32 disabled:cursor-not-allowed placeholder-gray-500"
                          style={{ minHeight: '48px' }}
                        />
                      </div>
                      
                      {/* Send Button */}
                      <button
                        onClick={selectedImage ? handleSendWithImage : handleSendMessage}
                        disabled={(!message.trim() && !selectedImage) || sendingMessage || !isConnected}
                        className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
                        title={!isConnected ? 'Connecting...' : 'Send message'}
                        style={{ minHeight: '48px', minWidth: '48px' }}
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    
                    {/* Connection Status */}
                    {!isConnected && (
                      <div className="mt-3">
                        <p className="text-xs text-orange-600 flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Connecting to chat server...
                        </p>
                      </div>
                    )}
                    
                    {/* Hidden File Input */}
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
                /* FIXED: Enhanced Welcome Screen - Always shows when no chat selected */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center max-w-lg px-8">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageCircle className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to Store Chat</h2>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                      Connect with stores to ask questions, get support, and stay updated on your orders. Select a conversation from the sidebar to start chatting.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-6 mb-8">
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{totalUnreadCount}</div>
                          <div className="text-sm text-gray-500">Unread Messages</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center space-y-2">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Store className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-semibold text-gray-900">{chats.length}</div>
                          <div className="text-sm text-gray-500">Store Conversations</div>
                        </div>
                      </div>
                    </div>
                    
                    {chats.length === 0 ? (
                      <div>
                        <p className="text-gray-500 mb-4">You haven't started any conversations with stores yet.</p>
                        <button
                          onClick={() => navigate('/stores')}
                          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                        >
                          Browse Stores to Start Chatting
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-gray-500 mb-4">Select a store conversation from the sidebar to continue chatting.</p>
                        {totalUnreadCount > 0 && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
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
      
      <Footer />
    </div>
  );
};

export default ChatPage;