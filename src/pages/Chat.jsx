import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Store, Clock, Check, CheckCheck, Users, AlertCircle } from 'lucide-react';
import io from 'socket.io-client';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StoreChatInterface = () => {
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typing, setTyping] = useState(new Map());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // API base URL - adjust according to your backend
  const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';
  const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:4000';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('authToken');
  };

  // API headers with authentication
  const getHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getAuthToken()}`
  });

  // Initialize user and socket connection
  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get user info from token or API
        const token = getAuthToken();
        if (!token) {
          setError('Please log in to access chat');
          setLoading(false);
          return;
        }

        // Mock user data - replace with actual user fetch
        const userData = {
          id: 'user123',
          name: 'John Doe',
          role: 'customer',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
        };
        setUser(userData);

        // Initialize socket connection
        const socketInstance = io(SOCKET_URL, {
          auth: { token }
        });

        socketInstance.on('connect', () => {
          console.log('Connected to socket server');
          socketInstance.emit('user_join', userData);
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from socket server');
        });

        socketInstance.on('new_message', (messageData) => {
          handleNewMessage(messageData);
        });

        socketInstance.on('user_online', (userId) => {
          setOnlineUsers(prev => new Set([...prev, userId]));
        });

        socketInstance.on('user_offline', (userId) => {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(userId);
            return newSet;
          });
        });

        socketInstance.on('typing_start', ({ userId, conversationId }) => {
          setTyping(prev => new Map(prev.set(`${conversationId}-${userId}`, true)));
        });

        socketInstance.on('typing_stop', ({ userId, conversationId }) => {
          setTyping(prev => {
            const newMap = new Map(prev);
            newMap.delete(`${conversationId}-${userId}`);
            return newMap;
          });
        });

        socketInstance.on('message_status_update', ({ messageId, status }) => {
          updateMessageStatus(messageId, status);
        });

        setSocket(socketInstance);

        // Load conversations
        await loadConversations();

      } catch (error) {
        console.error('Initialization error:', error);
        setError('Failed to initialize chat');
      } finally {
        setLoading(false);
      }
    };

    initializeApp();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load conversations');
      }

      const data = await response.json();
      if (data.success) {
        setConversations(data.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations/${conversationId}/messages`, {
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error('Failed to load messages');
      }

      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  // Handle new message from socket
  const handleNewMessage = useCallback((messageData) => {
    setMessages(prev => [...prev, messageData]);
    
    // Update conversation list
    setConversations(prev => prev.map(conv => {
      if (conv.id === messageData.conversationId) {
        return {
          ...conv,
          lastMessage: messageData.text,
          lastMessageTime: messageData.timestamp,
          unreadCount: messageData.sender === 'store' ? conv.unreadCount + 1 : conv.unreadCount
        };
      }
      return conv;
    }));

    scrollToBottom();
  }, []);

  // Update message status
  const updateMessageStatus = (messageId, status) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, status } : msg
    ));
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageText = message.trim();
    setMessage('');

    // Stop typing indicator
    if (socket) {
      socket.emit('typing_stop', {
        conversationId: selectedConversation.id,
        userId: user.id
      });
    }

    try {
      const response = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: messageText,
          messageType: 'text'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      if (data.success) {
        // Message will be added via socket event
        console.log('Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (!socket || !selectedConversation) return;

    socket.emit('typing_start', {
      conversationId: selectedConversation.id,
      userId: user.id
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing_stop', {
        conversationId: selectedConversation.id,
        userId: user.id
      });
    }, 2000);
  };

  // Start new conversation
  const startConversation = async (storeId, initialMessage = '') => {
    try {
      const response = await fetch(`${API_BASE}/chat/conversations`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          storeId,
          initialMessage
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start conversation');
      }

      const data = await response.json();
      if (data.success) {
        await loadConversations();
        // Select the new conversation
        const newConv = conversations.find(c => c.id === data.data.conversationId);
        if (newConv) {
          handleConversationSelect(newConv);
        }
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      setError('Failed to start conversation');
    }
  };

  // Handle conversation selection
  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    
    if (socket) {
      // Leave previous conversation room
      if (selectedConversation) {
        socket.emit('leave_conversation', selectedConversation.id);
      }
      // Join new conversation room
      socket.emit('join_conversation', conversation.id);
    }

    // Load messages
    loadMessages(conversation.id);
  };

  const handleBackToSidebar = () => {
    if (socket && selectedConversation) {
      socket.emit('leave_conversation', selectedConversation.id);
    }
    setSelectedConversation(null);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else {
      handleTyping();
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isStoreOnline = (storeId) => {
    return onlineUsers.has(storeId);
  };

  const getTypingUsers = () => {
    if (!selectedConversation) return [];
    const typingKey = `${selectedConversation.id}-`;
    return Array.from(typing.keys())
      .filter(key => key.startsWith(typingKey) && !key.endsWith(user.id))
      .map(key => key.replace(typingKey, ''));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading chat...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      
      <div className="flex-1">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Chat</h1>
            <p className="text-gray-600">Connect and chat with your favorite stores</p>
            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
            <div className="flex h-full">
              {/* Sidebar */}
              <div className={`${
                selectedConversation 
                  ? 'hidden md:flex' 
                  : 'flex'
              } w-full md:w-80 flex-col bg-white border-r border-gray-200`}>
                {/* Search Header */}
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search stores..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                {/* Conversation List */}
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No conversations yet</p>
                      <p className="text-sm">Start shopping to chat with stores!</p>
                    </div>
                  ) : (
                    filteredConversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationSelect(conversation)}
                        className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                          selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={conversation.store.avatar}
                            alt={conversation.store.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isStoreOnline(conversation.store.id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">{conversation.store.name}</h3>
                            <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                            {conversation.unreadCount > 0 && (
                              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Store className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">{conversation.store.category}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`${
                selectedConversation 
                  ? 'flex w-full' 
                  : 'hidden md:flex md:flex-1'
              } flex-col`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                      <div className="flex items-center">
                        <button
                          onClick={handleBackToSidebar}
                          className="md:hidden mr-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <img
                          src={selectedConversation.store.avatar}
                          alt={selectedConversation.store.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <h2 className="font-semibold text-gray-900">{selectedConversation.store.name}</h2>
                          <p className="text-sm text-gray-500">
                            {isStoreOnline(selectedConversation.store.id) ? 'Online' : 'Last seen recently'}
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
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                              msg.sender === 'customer'
                                ? 'bg-blue-500 text-white rounded-br-sm'
                                : 'bg-white text-gray-900 rounded-bl-sm border'
                            }`}
                          >
                            <p className="text-sm">{msg.text}</p>
                            <div className={`flex items-center justify-end mt-1 space-x-1 ${
                              msg.sender === 'customer' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              <Clock className="w-3 h-3" />
                              <span className="text-xs">{msg.timestamp}</span>
                              {msg.sender === 'customer' && (
                                <div className="ml-1">
                                  {msg.status === 'read' ? (
                                    <CheckCheck className="w-3 h-3 text-blue-200" />
                                  ) : msg.status === 'delivered' ? (
                                    <CheckCheck className="w-3 h-3" />
                                  ) : (
                                    <Check className="w-3 h-3" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Typing Indicator */}
                      {getTypingUsers().length > 0 && (
                        <div className="flex justify-start">
                          <div className="bg-gray-200 rounded-lg px-4 py-2">
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

                    {/* Message Input */}
                    <div className="bg-white p-4 border-t border-gray-200">
                      <div className="flex items-end space-x-2">
                        <div className="flex-1 relative">
                          <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            rows={1}
                            disabled={sending}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32 disabled:bg-gray-100"
                          />
                        </div>
                        <button
                          onClick={handleSendMessage}
                          disabled={!message.trim() || sending}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          {sending ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Send className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Welcome Screen */
                  <div className="flex-1 flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Store className="w-12 h-12 text-blue-500" />
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Welcome to Store Chat</h2>
                      <p className="text-gray-600 max-w-md">
                        Select a store from the sidebar to start chatting. Get instant support, track orders, and communicate directly with your favorite stores.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default StoreChatInterface;