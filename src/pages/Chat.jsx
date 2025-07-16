import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Store, Clock, Check, CheckCheck, Users, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import chatService from '../services/chatService';
import useSocket from '../hooks/useSocket';
import authService from '../services/authService'; // Now correctly importing

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
  const messagesEndRef = useRef(null);

  // Initialize user (now using your actual authService)
  useEffect(() => {
    const initializeUser = async () => {
      console.log('🔍 Starting user initialization with authService...');
      
      try {
        // Check if user is authenticated using your authService
        if (!authService.isAuthenticated()) {
          console.log('❌ User not authenticated');
          setError('Please log in to access chat');
          setLoading(false);
          return;
        }

        console.log('✅ User is authenticated, fetching user data...');

        // Get current user data from your authService
        const userResponse = await authService.getCurrentUser();
        console.log('User response:', userResponse);

        if (userResponse.success && userResponse.data) {
          const userData = userResponse.data.user || userResponse.data;
          
          const chatUser = {
            id: userData.id,
            name: userData.name || `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'User',
            role: userData.userType || userData.role || 'customer',
            email: userData.email || 'user@example.com',
            avatar: userData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.firstName || 'User')}&background=random`
          };
          
          console.log('🎉 User data prepared for chat:', chatUser);
          setUser(chatUser);
        } else {
          console.log('❌ Failed to get user data:', userResponse);
          setError(userResponse.message || 'Failed to load user data');
        }
        
      } catch (error) {
        console.error('💥 User initialization error:', error);
        setError('Failed to initialize user. Please log in again.');
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

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
    };

    const handleMessageStatusUpdate = ({ messageId, status }) => {
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status } : msg
      ));
    };

    const handleMessagesRead = ({ readBy }) => {
      setMessages(prev => prev.map(msg => 
        msg.sender === 'customer' ? { ...msg, status: 'read' } : msg
      ));
    };

    const handleNewConversation = ({ conversationId, store, message }) => {
      // Reload conversations to show new one
      loadConversations();
    };

    on('new_message', handleNewMessage);
    on('message_status_update', handleMessageStatusUpdate);
    on('messages_read', handleMessagesRead);
    on('new_conversation', handleNewConversation);

    return () => {
      off('new_message', handleNewMessage);
      off('message_status_update', handleMessageStatusUpdate);
      off('messages_read', handleMessagesRead);
      off('new_conversation', handleNewConversation);
    };
  }, [socket, on, off]);

  // Load conversations when user is available
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load conversations from API
  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await chatService.getConversations('customer');
      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  // Load messages for selected conversation
  const loadMessages = async (conversationId) => {
    try {
      setError(null);
      const response = await chatService.getMessages(conversationId);
      
      if (response.success) {
        setMessages(response.data);
        scrollToBottom();
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  // Send message
  const handleSendMessage = async () => {
    if (!message.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageText = message.trim();
    setMessage('');

    try {
      setError(null);
      
      const response = await chatService.sendMessage(
        selectedConversation.id,
        messageText,
        'text'
      );

      if (response.success) {
        // Message will be added via socket event
        console.log('Message sent successfully');
        
        // Update conversation list
        setConversations(prev => prev.map(conv =>
          conv.id === selectedConversation.id
            ? {
              ...conv,
              lastMessage: messageText,
              lastMessageTime: 'now'
            }
            : conv
        ));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
      setMessage(messageText); // Restore message on error
    } finally {
      setSending(false);
    }
  };

  // Start new conversation
  const startConversation = async (storeId, initialMessage = '') => {
    try {
      setError(null);
      
      const response = await chatService.startConversation(storeId, initialMessage);
      
      if (response.success) {
        await loadConversations();
        
        // Select the new conversation
        const newConv = conversations.find(c => c.id === response.data.conversationId);
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
    // Leave previous conversation room
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
    }

    setSelectedConversation(conversation);
    
    // Join new conversation room
    joinConversation(conversation.id);

    // Load messages
    loadMessages(conversation.id);

    // Mark messages as read
    markAsRead(conversation.id);
  };

  // Mark messages as read
  const markAsRead = async (conversationId) => {
    try {
      await chatService.markMessagesAsRead(conversationId);
      
      // Reset unread count in UI
      setConversations(prev => prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleBackToSidebar = () => {
    if (selectedConversation) {
      leaveConversation(selectedConversation.id);
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
    }
  };

  const handleMessageChange = (e) => {
    setMessage(e.target.value);
    
    // Handle typing indicators
    if (selectedConversation) {
      handleTyping(selectedConversation.id);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.store?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.store?.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get typing users for current conversation
  const typingUsers = selectedConversation ? getTypingUsers(selectedConversation.id) : [];

  if (loading && !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4" />
            <p className="text-gray-600">Loading chat...</p>
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
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Chat</h1>
                <p className="text-gray-600">
                  Connect and chat with your favorite stores
                  {isConnected && <span className="ml-2 text-green-600">● Connected</span>}
                </p>
              </div>
              <button
                onClick={loadConversations}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
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
                  {loading ? (
                    <div className="flex items-center justify-center h-32">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                    </div>
                  ) : filteredConversations.length === 0 ? (
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
                            src={conversation.store?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation.store?.name || 'Store')}&background=random`}
                            alt={conversation.store?.name || 'Store'}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          {isUserOnline(conversation.store?.id) && (
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 truncate">{conversation.store?.name || 'Store'}</h3>
                            <span className="text-xs text-gray-500">{conversation.lastMessageTime}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-gray-600 truncate">{conversation.lastMessage || 'No messages'}</p>
                            {conversation.unreadCount > 0 && (
                              <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center mt-1">
                            <Store className="w-3 h-3 text-gray-400 mr-1" />
                            <span className="text-xs text-gray-400">{conversation.store?.category || 'General'}</span>
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
                          src={selectedConversation.store?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedConversation.store?.name || 'Store')}&background=random`}
                          alt={selectedConversation.store?.name || 'Store'}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="ml-3">
                          <h2 className="font-semibold text-gray-900">{selectedConversation.store?.name || 'Store'}</h2>
                          <p className="text-sm text-gray-500">
                            {isUserOnline(selectedConversation.store?.id) ? 'Online' : 'Last seen recently'}
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
                      {typingUsers.length > 0 && (
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
                            onChange={handleMessageChange}
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
                            <Loader2 className="w-5 h-5 animate-spin" />
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