import React, { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { FaSearch, FaStore, FaUserCircle, FaArrowLeft } from 'react-icons/fa';
import { IoSendOutline } from 'react-icons/io5';
import { MdAttachFile } from 'react-icons/md';
import Navbar from '../components/Navbar';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messageEndRef = useRef(null);

    useEffect(() => {
        const mockConversations = [
            { id: 1, name: 'TechMart', lastMessage: 'Your order has been shipped.', time: '11:15 AM', online: true },
            { id: 2, name: 'FashionHub', lastMessage: 'Check out our new arrivals!', time: '10:45 AM', online: false },
            { id: 3, name: 'HomeDecorPro', lastMessage: 'Discounts on furniture!', time: '9:30 AM', online: true },
        ];
        setConversations(mockConversations);
        setFilteredConversations(mockConversations);
    }, []);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const handleSearch = (query) => {
        setSearchQuery(query);
        const filtered = conversations.filter((conv) =>
            conv.name.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredConversations(filtered);
    };

    const sendMessage = () => {
        if (newMessage.trim()) {
            setMessages([
                ...messages,
                { id: Date.now(), sender: 'You', text: newMessage, time: moment().format('h:mm A') },
            ]);
            setNewMessage('');
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row bg-gray-100">
            
            <Navbar />

            
            <div
                className={`md:w-1/3 bg-white md:block ${
                    selectedConversation ? 'hidden sm:block' : 'block'
                } mt-16`}
            >
                <div className="bg-teal-500 text-white p-4 flex items-center gap-3 md:justify-between">
                    <FaUserCircle className="text-3xl" />
                    <h1 className="font-bold text-lg">Chats</h1>
                </div>
                <div className="p-4">
                    <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
                        <FaSearch className="text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search stores..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="bg-transparent w-full text-sm outline-none ml-2"
                        />
                    </div>
                </div>
                <div>
                    {filteredConversations.map((conv) => (
                        <div
                            key={conv.id}
                            className="flex items-center justify-between p-4 border-b bg-white hover:bg-gray-50 cursor-pointer"
                            onClick={() => setSelectedConversation(conv.id)}
                        >
                            <div className="flex items-center gap-3">
                                <FaStore className="text-2xl text-gray-500" />
                                <div>
                                    <h2 className="font-medium text-gray-800 text-sm">{conv.name}</h2>
                                    <p className="text-xs text-gray-500 truncate">{conv.lastMessage}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-gray-400">{conv.time}</p>
                                <p
                                    className={`text-xs ${
                                        conv.online ? 'text-green-600' : 'text-gray-400'
                                    }`}
                                >
                                    {conv.online ? 'Online' : 'Offline'}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            
            <div
                className={`md:w-2/3 flex flex-col ${
                    selectedConversation ? 'block' : 'hidden sm:block'
                } mt-16`}
            >
                {selectedConversation ? (
                    <>
                        
                        <div className="bg-teal-500 text-white p-4 flex items-center gap-3">
                            <button
                                onClick={() => setSelectedConversation(null)}
                                className="sm:hidden"
                            >
                                <FaArrowLeft />
                            </button>
                            <div className="flex items-center gap-2">
                                <FaStore className="text-2xl" />
                                <div>
                                    <h1 className="font-bold text-sm">
                                        {
                                            filteredConversations.find(
                                                (c) => c.id === selectedConversation
                                            )?.name
                                        }
                                    </h1>
                                    <p className="text-xs">
                                        {filteredConversations.find(
                                            (c) => c.id === selectedConversation
                                        )?.online
                                            ? 'Online'
                                            : 'Offline'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        
                        <div className="flex-1 p-4 bg-gray-50 overflow-y-auto pb-20">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${
                                        msg.sender === 'You'
                                            ? 'justify-end'
                                            : 'justify-start'
                                    } mb-2`}
                                >
                                    <div
                                        className={`p-3 rounded-xl text-sm max-w-xs ${
                                            msg.sender === 'You'
                                                ? 'bg-teal-500 text-white'
                                                : 'bg-white text-gray-800'
                                        }`}
                                    >
                                        <p>{msg.text}</p>
                                        <p className="text-xs mt-1 text-gray-400">{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messageEndRef} />
                        </div>

                       
                        <div className="p-4 bg-white border-t flex items-center gap-3 fixed bottom-0 left-0 right-0 z-10 md:relative md:flex md:w-full md:top-auto md:mt-0">
                            <label htmlFor="attachment" className="cursor-pointer text-gray-500">
                                <MdAttachFile size={20} />
                            </label>
                            <input id="attachment" type="file" className="hidden" />
                            <input
                                type="text"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                className="flex-1 border rounded-full px-4 py-2 text-sm"
                            />
                            <button
                                onClick={sendMessage}
                                className="text-teal-500 hover:text-teal-600"
                            >
                                <IoSendOutline size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <p className="text-gray-500">Select a chat to start messaging</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
