// pages/ChatPage.jsx - FIXED: Customer↔Store Communication Interface
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, User, Clock, Check, CheckCheck, AlertCircle, Star, Loader2, MessageCircle, Store } from 'lucide-react';
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
  const messagesEndRef = useRef(null);

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
          const response = await fetch('http://localhost:4000/api/v1/users/profile', {
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

  // FIXED: Socket event handlers for customer↔store communication
  useEffect(() => {
    if (!socket || !user) return;

    console.log('🔌 Setting up CUSTOMER socket handlers for store communication');

    // FIXED: Handle store messages (messages FROM stores TO this customer)
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
    };

    // FIXED: Handle general new messages but filter for store messages
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

  // Load customer↔store chats
  useEffect(() => {
    if (user) {
      loadChats();
      
      if (location.state?.selectedConversation) {
        setSelectedChat(location.state.selectedConversation);
        loadMessages(location.state.selectedConversation.id);
      } else if (location.state?.newConversationId) {
        const newChatId = location.state.newConversationId;
        loadMessages(newChatId);
      }
    }
  }, [user, location.state]);

  // Load customer's chats with stores
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
        
        // Auto-select chat if specified
        if (!selectedChat && location.state?.newConversationId) {
          const newChat = response.data.find(chat => chat.id === location.state.newConversationId);
          if (newChat) {
            setSelectedChat(newChat);
            loadMessages(newChat.id);
          }
        } else if (!selectedChat && response.data.length > 0) {
          const firstChat = response.data[0];
          setSelectedChat(firstChat);
          loadMessages(firstChat.id);
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
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // FIXED: Send message to store
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
      handleSendMessage();
    }
  };

  // Customer quick responses for stores
  const quickResponses = [
    "Thank you!",
    "That sounds great!",
    "Can you tell me more about this?",
    "What are your store hours?",
    "Do you have this item in stock?",
    "What's the price for this service?",
    "Is this available today?",
    "Can I visit your store?",
    "Do you offer delivery?",
    "Thank you for your help!"
  ];

  const handleQuickResponse = (response) => {
    setMessage(response);
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="text-center">
            <p className="text-gray-600">Loading customer data...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden rounded-lg" style={{ height: 'calc(100vh - 200px)' }}>
          {/* Header */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Store Messages</h2>
                  <p className="text-sm text-gray-500">
                    Chat with your favorite stores
                    {isConnected && <span className="ml-2 text-green-600">● Connected</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {totalUnreadCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {totalUnreadCount} unread from stores
                    </span>
                  </div>
                )}
                <button
                  onClick={loadChats}
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Refresh
                </button>
              </div>
            </div>
            {error && (
              <div className="mt-2 p-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
                {error}
                <button 
                  onClick={() => setError(null)}
                  className="ml-2 text-red-800 hover:text-red-900"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="flex" style={{ height: 'calc(100vh - 280px)' }}>
            {/* Store Chat List Sidebar */}
            <div className={`${selectedChat
                ? 'hidden lg:flex'
                : 'flex'
              } w-full lg:w-80 flex-col bg-gray-50 border-r border-gray-200`}>
              
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
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <Store className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">No store conversations found</p>
                      <p className="text-sm">Start chatting with stores!</p>
                    </div>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const store = chat.store;
                    const storeName = store?.name || 'Unknown Store';
                    const storeAvatar = store?.avatar || store?.logo_url;
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={`flex items-start p-4 hover:bg-white cursor-pointer transition-colors border-b border-gray-100 ${selectedChat?.id === chat.id ? 'bg-white border-r-2 border-blue-500' : ''
                          }`}
                      >
                        <div className="relative">
                          <img
                            src={storeAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(storeName)}&background=2563eb&color=ffffff`}
                            alt={storeName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isUserOnline(store?.merchant_id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-gray-900 truncate">{storeName}</h3>
                              <Store className="w-3 h-3 text-blue-500" />
                            </div>
                            <div className="flex items-center space-x-1">
                              <span className="text-xs text-gray-500">{chat.lastMessageTime}</span>
                              {chat.unreadCount > 0 && (
                                <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                  {chat.unreadCount}
                                </span>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 truncate mb-2">{chat.lastMessage}</p>
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center space-x-3">
                              <span>{store?.category || 'Store'}</span>
                              {isUserOnline(store?.merchant_id) && <span className="text-green-500">● Store Online</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${selectedChat
                ? 'flex w-full'
                : 'hidden lg:flex lg:flex-1'
              } flex-col`}>
              {selectedChat ? (
                <>
                  {/* Store Chat Header */}
                  <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={handleBackToSidebar}
                        className="lg:hidden mr-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="relative">
                        <img
                          src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                          alt={selectedChat.store?.name || 'Store'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 rounded-full border-2 border-white">
                          <Store className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="flex items-center space-x-2">
                          <h2 className="font-semibold text-gray-900">{selectedChat.store?.name || 'Store'}</h2>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">Store</span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {isUserOnline(selectedChat.store?.merchant_id) ? 'Store is Online' : 'Store will respond soon'}
                          {selectedChat.store?.category && (
                            <span> • {selectedChat.store.category}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Phone className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Video className="w-5 h-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                    {messages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Store className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                          <p className="text-lg font-medium mb-2">Start chatting with {selectedChat.store?.name || 'this store'}</p>
                          <p className="text-sm">Ask about products, services, store hours, or anything else!</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${
                            // FIXED: Customer messages align right, store messages align left
                            msg.sender === 'user' || msg.sender === 'customer'
                              ? 'justify-end' 
                              : 'justify-start'
                          }`}
                        >
                          <div className="flex items-end space-x-2 max-w-xs md:max-w-md lg:max-w-lg">
                            {/* Store avatar for store messages */}
                            {(msg.sender === 'store') && (
                              <img
                                src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                                alt="Store"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                // FIXED: Customer messages blue, store messages white with store branding
                                msg.sender === 'user' || msg.sender === 'customer'
                                  ? 'bg-blue-500 text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 rounded-bl-sm border border-blue-200 shadow-sm'
                                }`}
                            >
                              {/* Store name for store messages */}
                              {msg.sender === 'store' && (
                                <div className="flex items-center gap-1 mb-1">
                                  <Store className="w-3 h-3 text-blue-500" />
                                  <span className="text-xs font-medium text-blue-600">{selectedChat.store?.name || 'Store'}</span>
                                </div>
                              )}
                              
                              <p className="text-sm">{msg.text}</p>
                              <div className={`flex items-center justify-end mt-1 space-x-1 ${
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
                              <img
                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                alt="You"
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                          </div>
                        </div>
                      ))
                    )}

                    {/* Typing indicator for store */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="flex items-center space-x-2">
                          <img
                            src={selectedChat.store?.avatar || selectedChat.store?.logo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedChat.store?.name || 'Store')}&background=2563eb&color=ffffff`}
                            alt="Store"
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="bg-gray-200 px-4 py-2 rounded-lg">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Responses for customers */}
                  <div className="bg-white p-3 border-t border-gray-100">
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {quickResponses.map((response, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickResponse(response)}
                          className="flex-shrink-0 px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded-full transition-colors whitespace-nowrap"
                        >
                          {response}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="bg-white p-4 border-t border-gray-200">
                    <div className="flex items-end space-x-2">
                      <div className="flex-1 relative">
                        <textarea
                          value={message}
                          onChange={handleMessageChange}
                          onKeyPress={handleKeyPress}
                          placeholder={`Message ${selectedChat.store?.name || 'store'}...`}
                          rows={1}
                          disabled={sendingMessage || !isConnected}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:bg-gray-100"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendingMessage || !isConnected}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                        title={!isConnected ? 'Connecting...' : 'Send to store'}
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                    {!isConnected && (
                      <p className="text-xs text-orange-500 mt-1">Connecting to chat server...</p>
                    )}
                  </div>
                </>
              ) : (
                /* Welcome Screen */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Store className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Store Messages</h2>
                    <p className="text-gray-600 max-w-md mb-6">
                      Select a store conversation from the sidebar to start chatting. Get instant support, ask questions, and stay updated on your orders.
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>{totalUnreadCount} unread</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <Store className="w-4 h-4 text-blue-500" />
                        <span>{chats.length} store{chats.length === 1 ? '' : 's'}</span>
                      </div>
                    </div>
                    
                    {chats.length === 0 && (
                      <div className="mt-6">
                        <button
                          onClick={() => navigate('/stores')}
                          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Browse Stores
                        </button>
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