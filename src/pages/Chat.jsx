// pages/ChatPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, User, Clock, Check, CheckCheck, AlertCircle, Star, Loader2, MessageCircle } from 'lucide-react';
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
  const [userType, setUserType] = useState('customer'); // 'customer' or 'merchant'
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

  // Initialize user from location state, localStorage, cookies, or API
  useEffect(() => {
    const initializeUser = async () => {
      try {
        console.log('🚀 Initializing user for chat...');
        
        // First try to get user from location state
        if (location.state?.user) {
          console.log('✅ User found in location state:', location.state.user);
          setUser(location.state.user);
          setUserType(location.state.userType || 'customer');
          return;
        }

        // Check for tokens in multiple locations
        const tokenSources = {
          localStorage_access_token: localStorage.getItem('access_token'),
          localStorage_authToken: localStorage.getItem('authToken'),
          localStorage_token: localStorage.getItem('token'),
          cookie_authToken: getCookieValue('authToken'),
          cookie_access_token: getCookieValue('access_token'),
          cookie_token: getCookieValue('token')
        };

        console.log('🔍 Token sources check:', tokenSources);

        const userToken = tokenSources.localStorage_access_token || 
                          tokenSources.localStorage_authToken || 
                          tokenSources.localStorage_token ||
                          tokenSources.cookie_authToken ||
                          tokenSources.cookie_access_token ||
                          tokenSources.cookie_token;
        
        console.log('🔍 Token check:', userToken ? `Found (${userToken.substring(0, 20)}...)` : 'Not found');
        
        if (!userToken) {
          console.log('❌ No token found anywhere, redirecting to login');
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
                console.log(`✅ User info found in localStorage.${key}:`, userInfo);
                break;
              }
            }
          } catch (e) {
            console.log(`⚠️ Failed to parse ${key}:`, e.message);
          }
        }

        // If we have valid user info in localStorage, use it
        if (userInfo && (userInfo.id || userInfo.userId)) {
          const userData = {
            id: userInfo.id || userInfo.userId,
            name: `${userInfo.firstName || userInfo.first_name || 'User'} ${userInfo.lastName || userInfo.last_name || ''}`.trim(),
            email: userInfo.email,
            avatar: userInfo.avatar,
            role: userInfo.userType || userInfo.role || 'customer'
          };
          
          console.log('✅ Setting user from localStorage:', userData);
          setUser(userData);
          setUserType(userData.role === 'merchant' ? 'merchant' : 'customer');
          return;
        }

        // If no valid user info in localStorage, try to fetch from API
        console.log('🌐 Fetching user info from API with token...');
        
        try {
          const response = await fetch('http://localhost:4000/api/v1/users/profile', {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Content-Type': 'application/json'
            },
            credentials: 'include'
          });

          console.log('📡 API Response status:', response.status, response.statusText);

          if (response.ok) {
            const apiResult = await response.json();
            console.log('✅ API response:', apiResult);
            
            // Handle different API response structures
            const apiUserData = apiResult.user || apiResult.data || apiResult;
            
            if (apiUserData && (apiUserData.id || apiUserData.userId)) {
              const userData = {
                id: apiUserData.id || apiUserData.userId,
                name: `${apiUserData.firstName || apiUserData.first_name || 'User'} ${apiUserData.lastName || apiUserData.last_name || ''}`.trim(),
                email: apiUserData.email,
                avatar: apiUserData.avatar,
                role: apiUserData.userType || apiUserData.role || 'customer'
              };
              
              console.log('✅ Setting user from API:', userData);
              
              // Update localStorage with fresh user data
              localStorage.setItem('userInfo', JSON.stringify(apiUserData));
              
              setUser(userData);
              setUserType(userData.role === 'merchant' ? 'merchant' : 'customer');
              return;
            } else {
              console.log('❌ Invalid user data from API:', apiUserData);
            }
          } else {
            const errorText = await response.text().catch(() => 'Unknown error');
            console.log('❌ API request failed:', response.status, response.statusText, errorText);
            
            // If API fails with 401/403, token is invalid
            if (response.status === 401 || response.status === 403) {
              console.log('🔐 Token appears to be invalid, clearing storage');
              ['access_token', 'authToken', 'token', 'userInfo', 'user', 'userData'].forEach(key => {
                localStorage.removeItem(key);
              });
              // Clear cookies
              document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
              document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
          }
        } catch (apiError) {
          console.error('🌐 API fetch error:', apiError);
        }

        // If we get here, we couldn't get valid user data
        console.log('❌ Could not get valid user data, redirecting to login');
        navigate('/accounts/sign-in', { 
          state: { from: { pathname: location.pathname } }
        });

      } catch (error) {
        console.error('💥 Error initializing user:', error);
        navigate('/accounts/sign-in', {
          state: { from: { pathname: location.pathname } }
        });
      }
    };

    initializeUser();
  }, [location, navigate]);

  // Initialize socket
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

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (messageData) => {
      setMessages(prev => [...prev, messageData]);
      
      // Update chat list
      setChats(prev => prev.map(chat => {
        if (chat.id === messageData.conversationId) {
          return {
            ...chat,
            lastMessage: messageData.text,
            lastMessageTime: 'now',
            unreadCount: messageData.sender === (userType === 'merchant' ? 'user' : 'merchant') 
              ? chat.unreadCount + 1 
              : chat.unreadCount
          };
        }
        return chat;
      }));

      scrollToBottom();
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    };

    const handleMessagesRead = ({ readBy }) => {
      setMessages(prev => prev.map(msg => 
        msg.sender === userType ? { ...msg, status: 'read' } : msg
      ));
    };

    on('new_message', handleNewMessage);
    on('message_status_update', handleMessageStatusUpdate);
    on('messages_read', handleMessagesRead);

    return () => {
      off('new_message', handleNewMessage);
      off('message_status_update', handleMessageStatusUpdate);
      off('messages_read', handleMessagesRead);
    };
  }, [socket, on, off, userType]);

  // Load chats on mount
  useEffect(() => {
    if (user) {
      loadChats();
      
      // Handle initial chat selection from location state
      if (location.state?.selectedConversation) {
        setSelectedChat(location.state.selectedConversation);
        loadMessages(location.state.selectedConversation.id);
      } else if (location.state?.newConversationId) {
        // Handle new conversation
        const newChatId = location.state.newConversationId;
        loadMessages(newChatId);
        // The chat will be in the list after loadChats completes
      }
    }
  }, [user, location.state]);

  // Load chats from API
  const loadChats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Ensure chatService has the correct token
      const currentToken = chatService.getAuthToken();
      console.log('🔧 ChatService token for API call:', currentToken ? `Found (${currentToken.substring(0, 20)}...)` : 'Not found');
      
      if (!currentToken) {
        console.log('❌ No token available for chat service');
        setError('Authentication token not available');
        return;
      }
      
      const response = userType === 'merchant' 
        ? await chatService.getConversations('merchant')
        : await chatService.getConversations('customer');
        
      console.log('📡 Chat API response:', response);
        
      if (response.success) {
        setChats(response.data);
        
        // Auto-select the first chat if none selected
        if (!selectedChat && response.data.length > 0) {
          const firstChat = response.data[0];
          setSelectedChat(firstChat);
          loadMessages(firstChat.id);
        }
      } else {
        setError(response.message || 'Failed to load chats');
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
      setError('Failed to load chats: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected chat
  const loadMessages = async (chatId) => {
    try {
      setError(null);
      const response = await chatService.getMessages(chatId);
      
      if (response.success) {
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
    // Leave previous conversation
    if (selectedChat) {
      leaveConversation(selectedChat.id);
    }

    setSelectedChat(chat);
    joinConversation(chat.id);
    loadMessages(chat.id);
    markAsRead(chat.id);
  };

  // Mark messages as read
  const markAsRead = async (chatId) => {
    try {
      await chatService.markMessagesAsRead(chatId);
      
      // Reset unread count in UI
      setChats(prev => prev.map(chat =>
        chat.id === chatId
          ? { ...chat, unreadCount: 0 }
          : chat
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || sendingMessage) return;

    const messageText = message.trim();
    
    try {
      setSendingMessage(true);
      setError(null);
      setMessage('');

      const response = await chatService.sendMessage(
        selectedChat.id,
        messageText,
        'text'
      );

      if (response.success) {
        // Message will be added via socket event
        console.log('Message sent successfully');
        
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
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      setMessage(messageText); // Restore message on error
    } finally {
      setSendingMessage(false);
    }
  };

  // Handle message input changes
  const handleMessageChange = (e) => {
    setMessage(e.target.value);

    // Handle typing indicators
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
    const searchableText = userType === 'merchant' 
      ? chat.customer?.name?.toLowerCase() || ''
      : chat.store?.name?.toLowerCase() || '';
    return searchableText.includes(searchTerm.toLowerCase());
  });

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Quick response templates (for merchants)
  const quickResponses = userType === 'merchant' ? [
    "Thank you for your message! I'll help you right away.",
    "Your order is being processed and will be ready soon.",
    "We have that item in stock. Would you like me to reserve it for you?",
    "I'll check on that for you and get back to you shortly.",
    "Is there anything else I can help you with today?"
  ] : [
    "Thank you!",
    "That sounds great!",
    "Can you tell me more about this?",
    "What are your store hours?",
    "Do you have this item in stock?"
  ];

  const handleQuickResponse = (response) => {
    setMessage(response);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Calculate total unread messages
  const totalUnreadCount = chats.reduce((total, chat) => total + (chat.unreadCount || 0), 0);

  // Get typing users for current chat
  const typingUsers = selectedChat ? getTypingUsers(selectedChat.id) : [];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading chats...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // No user data
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center" style={{ height: 'calc(100vh - 200px)' }}>
          <div className="text-center">
            <p className="text-gray-600">Loading user data...</p>
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
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userType === 'merchant' ? 'Customer Chat' : 'Messages'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {userType === 'merchant' ? 'Manage customer conversations' : 'Chat with stores'}
                    {isConnected && <span className="ml-2 text-green-600">● Connected</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                {totalUnreadCount > 0 && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {totalUnreadCount} unread message{totalUnreadCount > 1 ? 's' : ''}
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
              </div>
            )}
          </div>

          <div className="flex" style={{ height: 'calc(100vh - 280px)' }}>
            {/* Chat List Sidebar */}
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
                    placeholder={userType === 'merchant' ? 'Search customers...' : 'Search stores...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                {filteredChats.length === 0 ? (
                  <div className="flex items-center justify-center h-32 text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="font-medium">No conversations found</p>
                      <p className="text-sm">
                        {userType === 'merchant' 
                          ? 'Customer conversations will appear here'
                          : 'Start chatting with stores!'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  filteredChats.map((chat) => {
                    const entity = userType === 'merchant' ? chat.customer : chat.store;
                    const entityName = entity?.name || 'Unknown';
                    const entityAvatar = entity?.avatar || entity?.logo_url;
                    
                    return (
                      <div
                        key={chat.id}
                        onClick={() => handleChatSelect(chat)}
                        className={`flex items-start p-4 hover:bg-white cursor-pointer transition-colors border-b border-gray-100 ${selectedChat?.id === chat.id ? 'bg-white border-r-2 border-blue-500' : ''
                          }`}
                      >
                        <div className="relative">
                          <img
                            src={entityAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entityName)}&background=random`}
                            alt={entityName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isUserOnline(entity?.id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                          {userType === 'merchant' && entity?.priority === 'vip' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Star className="w-2 h-2 text-yellow-800" />
                            </div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-semibold text-gray-900 truncate">{entityName}</h3>
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
                              {userType === 'merchant' ? (
                                <>
                                  <span>Customer since {entity?.customerSince || 'Unknown'}</span>
                                  <span>{entity?.orderCount || 0} orders</span>
                                </>
                              ) : (
                                <>
                                  <span>{entity?.category || 'Store'}</span>
                                  {entity?.online && <span className="text-green-500">● Online</span>}
                                </>
                              )}
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
                  {/* Chat Header */}
                  <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      <button
                        onClick={handleBackToSidebar}
                        className="lg:hidden mr-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <div className="relative">
                        {(() => {
                          const entity = userType === 'merchant' ? selectedChat.customer : selectedChat.store;
                          const entityAvatar = entity?.avatar || entity?.logo_url;
                          const entityName = entity?.name || 'Unknown';
                          
                          return (
                            <>
                              <img
                                src={entityAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(entityName)}&background=random`}
                                alt={entityName}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                              {userType === 'merchant' && entity?.priority === 'vip' && (
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <Star className="w-2 h-2 text-yellow-800" />
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      <div className="ml-3">
                        {(() => {
                          const entity = userType === 'merchant' ? selectedChat.customer : selectedChat.store;
                          const entityName = entity?.name || 'Unknown';
                          
                          return (
                            <>
                              <div className="flex items-center space-x-2">
                                <h2 className="font-semibold text-gray-900">{entityName}</h2>
                                {userType === 'merchant' && entity?.priority === 'vip' && (
                                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">VIP</span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {isUserOnline(entity?.id) ? 'Online' : 'Last seen recently'}
                                {userType === 'merchant' && (
                                  <span> • {entity?.orderCount || 0} orders</span>
                                )}
                                {userType === 'customer' && entity?.category && (
                                  <span> • {entity.category}</span>
                                )}
                              </p>
                            </>
                          );
                        })()}
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
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          (userType === 'merchant' && msg.sender === 'merchant') || 
                          (userType === 'customer' && msg.sender === 'user')
                            ? 'justify-end' 
                            : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            (userType === 'merchant' && msg.sender === 'merchant') || 
                            (userType === 'customer' && msg.sender === 'user')
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm border'
                            }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            (userType === 'merchant' && msg.sender === 'merchant') || 
                            (userType === 'customer' && msg.sender === 'user')
                              ? 'text-blue-100' 
                              : 'text-gray-500'
                            }`}>
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{msg.timestamp}</span>
                            {((userType === 'merchant' && msg.sender === 'merchant') || 
                              (userType === 'customer' && msg.sender === 'user')) && (
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
                      </div>
                    ))}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Responses */}
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
                          placeholder="Type a message..."
                          rows={1}
                          disabled={sendingMessage}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:bg-gray-100"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || sendingMessage}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                      >
                        {sendingMessage ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Send className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Welcome Screen - Only visible on desktop when no chat selected */
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <MessageCircle className="w-12 h-12 text-blue-500" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                      {userType === 'merchant' ? 'Customer Support Chat' : 'Your Messages'}
                    </h2>
                    <p className="text-gray-600 max-w-md">
                      {userType === 'merchant' 
                        ? 'Select a customer from the sidebar to start chatting. Provide excellent customer service and support to grow your business.'
                        : 'Select a conversation from the sidebar to start chatting with stores. Get instant support and updates on your orders.'
                      }
                    </p>
                    <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-500">
                      <div className="flex items-center justify-center space-x-2">
                        <AlertCircle className="w-4 h-4 text-orange-500" />
                        <span>{totalUnreadCount} unread</span>
                      </div>
                      <div className="flex items-center justify-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                        <span>{chats.length} {chats.length === 1 ? 'chat' : 'chats'}</span>
                      </div>
                    </div>
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