import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Store, Clock, Check, CheckCheck } from 'lucide-react';
// Import your navbar and footer components
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const StoreChatInterface = () => {
  const [selectedStore, setSelectedStore] = useState(null);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  // Sample stores data
  const stores = [
    {
      id: 1,
      name: "TechHub Electronics",
      avatar: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=64&h=64&fit=crop&crop=face",
      lastMessage: "Your order has been confirmed!",
      lastMessageTime: "2 min ago",
      unreadCount: 2,
      online: true,
      category: "Electronics"
    },
    {
      id: 2,
      name: "Fashion Forward",
      avatar: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=64&h=64&fit=crop&crop=center",
      lastMessage: "New arrivals are here!",
      lastMessageTime: "15 min ago",
      unreadCount: 0,
      online: false,
      category: "Fashion"
    },
    {
      id: 3,
      name: "Grocery Plus",
      avatar: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=64&h=64&fit=crop&crop=center",
      lastMessage: "Thank you for your purchase",
      lastMessageTime: "1 hour ago",
      unreadCount: 1,
      online: true,
      category: "Grocery"
    },
    {
      id: 4,
      name: "Book Corner",
      avatar: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=64&h=64&fit=crop&crop=center",
      lastMessage: "Your reserved book is ready",
      lastMessageTime: "3 hours ago",
      unreadCount: 0,
      online: false,
      category: "Books"
    }
  ];

  // Sample messages for selected store
  const messages = selectedStore ? [
    {
      id: 1,
      text: "Hello! Welcome to our store. How can I help you today?",
      sender: "store",
      timestamp: "10:30 AM",
      status: "delivered"
    },
    {
      id: 2,
      text: "Hi! I'm looking for a new smartphone. Do you have the latest iPhone in stock?",
      sender: "user",
      timestamp: "10:32 AM",
      status: "read"
    },
    {
      id: 3,
      text: "Yes, we have the iPhone 15 Pro in all colors. Would you like to know about our current offers?",
      sender: "store",
      timestamp: "10:33 AM",
      status: "delivered"
    },
    {
      id: 4,
      text: "That sounds great! What's the price and do you offer any warranty?",
      sender: "user",
      timestamp: "10:35 AM",
      status: "read"
    },
    {
      id: 5,
      text: "The price is $999 with a 2-year warranty included. We also offer a 30-day return policy.",
      sender: "store",
      timestamp: "10:36 AM",
      status: "delivered"
    }
  ] : [];

  const handleStoreSelect = (store) => {
    setSelectedStore(store);
  };

  const handleBackToSidebar = () => {
    setSelectedStore(null);
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (message.trim() && selectedStore) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', message, 'to store:', selectedStore.name);
      setMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Chat</h1>
          <p className="text-gray-600">Connect and chat with your favorite stores</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '600px' }}>
          <div className="flex h-full">
            {/* Sidebar - Hidden on mobile when chat is selected */}
            <div className={`${
              selectedStore 
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

              {/* Store List */}
              <div className="flex-1 overflow-y-auto">
                {filteredStores.map((store) => (
                  <div
                    key={store.id}
                    onClick={() => handleStoreSelect(store)}
                    className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 ${
                      selectedStore?.id === store.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={store.avatar}
                        alt={store.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      {store.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="ml-3 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-gray-900 truncate">{store.name}</h3>
                        <span className="text-xs text-gray-500">{store.lastMessageTime}</span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-sm text-gray-600 truncate">{store.lastMessage}</p>
                        {store.unreadCount > 0 && (
                          <span className="ml-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                            {store.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center mt-1">
                        <Store className="w-3 h-3 text-gray-400 mr-1" />
                        <span className="text-xs text-gray-400">{store.category}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className={`${
              selectedStore 
                ? 'flex w-full' 
                : 'hidden md:flex md:flex-1'
            } flex-col`}>
              {selectedStore ? (
                <>
                  {/* Chat Header */}
                  <div className="bg-white p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center">
                      {/* Back button - Only visible on mobile */}
                      <button
                        onClick={handleBackToSidebar}
                        className="md:hidden mr-3 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                      <img
                        src={selectedStore.avatar}
                        alt={selectedStore.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="ml-3">
                        <h2 className="font-semibold text-gray-900">{selectedStore.name}</h2>
                        <p className="text-sm text-gray-500">
                          {selectedStore.online ? 'Online' : 'Last seen recently'}
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
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
                            msg.sender === 'user'
                              ? 'bg-blue-500 text-white rounded-br-sm'
                              : 'bg-white text-gray-900 rounded-bl-sm border'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <div className={`flex items-center justify-end mt-1 space-x-1 ${
                            msg.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}>
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{msg.timestamp}</span>
                            {msg.sender === 'user' && (
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
                        />
                      </div>
                      <button
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Welcome Screen - Only visible on desktop when no chat selected */
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
      
      <Footer />
    </div>
  );
};

export default StoreChatInterface;