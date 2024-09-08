import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Pusher from 'pusher-js';
import moment from 'moment';
import { FaChevronLeft, FaSearch, FaUser } from 'react-icons/fa';
import { IoHomeOutline, IoSendOutline } from 'react-icons/io5';
import { MdAttachFile } from 'react-icons/md';
import { getCookie } from '../utils/cookieUtils';

const Chat = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const messageEndRef = useRef(null);

    const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 768);
    const accessToken = getCookie('access_token');

    useEffect(() => {
        const handleResize = () => {
            setIsMobileView(window.innerWidth <= 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const pusher = new Pusher('f566a73b20b1548b5a13', {
            cluster: 'ap2',
            forceTLS: true,
        });

        const channel = pusher.subscribe('chat');
        channel.bind('App\\Events\\MessageSent', function (data) {
            setMessages(prevMessages => [...prevMessages, data.message]);
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
            pusher.disconnect();
        };
    }, []);

    useEffect(() => {
        const cachedConversations = localStorage.getItem('conversations');
        if (cachedConversations) {
            setConversations(JSON.parse(cachedConversations));
        }

        fetchConversations();
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            const cachedMessages = localStorage.getItem(`messages_${selectedConversation}`);
            if (cachedMessages) {
                setMessages(JSON.parse(cachedMessages));
            }

            fetchMessages(selectedConversation);
        }
    }, [selectedConversation]);

    useEffect(() => {
        if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const response = await axios.get('https://api.discoun3ree.com/api/messages/conversations', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });

            const conversationsWithLastMessage = await Promise.all(response.data.map(async (conversation) => {
                const messagesResponse = await axios.get(`https://api.discoun3ree.com/api/messages/${conversation.id}`, {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                    }
                });

                const lastMessage = messagesResponse.data[messagesResponse.data.length - 1];
                return {
                    ...conversation,
                    last_message: lastMessage?.body,
                    last_message_time: lastMessage?.created_at,
                };
            }));

            const sortedConversations = conversationsWithLastMessage.sort((a, b) => {
                if (!a.last_message_time || !b.last_message_time) return 0;
                return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
            });

            setConversations(sortedConversations);
            localStorage.setItem('conversations', JSON.stringify(sortedConversations));
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const fetchMessages = async (userId) => {
        try {
            const response = await axios.get(`https://api.discoun3ree.com/api/messages/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            const sortedMessages = response.data.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
            setMessages(sortedMessages);
            localStorage.setItem(`messages_${userId}`, JSON.stringify(sortedMessages));
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const sendMessage = async () => {
        const formData = new FormData();
        formData.append('to_id', selectedConversation.toString());
        formData.append('body', newMessage);
        if (attachment) {
            formData.append('attachment', attachment);
        }

        try {
            const response = await axios.post('https://api.discoun3ree.com/api/messages/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            setNewMessage('');
            setAttachment(null);
            const updatedMessages = [...messages, response.data];
            localStorage.setItem(`messages_${selectedConversation}`, JSON.stringify(updatedMessages));
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleAttachmentChange = (e) => {
        if (e.target.files) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleConversationClick = (userId) => {
        setSelectedConversation(userId);
    };

    const formatTime = (time) => {
        const momentTime = moment(time);
        if (moment().isSame(momentTime, 'day')) {
            return momentTime.format('h:mm A');
        } else if (moment().subtract(1, 'days').isSame(momentTime, 'day')) {
            return `Yesterday, ${momentTime.format('h:mm A')}`;
        } else {
            return momentTime.format('MMM D, h:mm A');
        }
    };

    return (
        <div className="flex w-full h-[100vh] bg-gray-50">
            <div className="flex w-full">
                {!isMobileView || (isMobileView && selectedConversation === null) ? (
                    <div className={`bg-white py-4 overflow-y-auto shadow-md ${isMobileView ? 'w-full' : 'w-1/3'}`}>
                        <div className="flex items-center justify-between border-b border-gray-200 px-4 pb-4 mb-4">
                            <h1 className="font-semibold text-gray-800 text-lg">Messages</h1>
                            <div className="flex items-center gap-3 text-gray-600">
                                <a href="/" className="hover:text-primary">
                                    <IoHomeOutline size={24} />
                                </a>
                            </div>
                        </div>
                        <div className="px-4">
                            <div className="flex items-center border border-gray-300 rounded-full bg-gray-100 py-2 px-4 mb-4">
                                <input className="w-full bg-transparent outline-none text-sm" type="text" placeholder="Search..." />
                                <FaSearch className="text-gray-500" />
                            </div>
                        </div>
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => handleConversationClick(conversation.id)}
                                className={`cursor-pointer hover:bg-gray-100 px-4 py-3 flex justify-between items-center transition-all duration-200 ${selectedConversation === conversation.id ? 'bg-gray-200' : ''}`}
                            >
                                <div className="flex items-center">
                                    <FaUser className="w-10 h-10 rounded-full bg-gray-300 text-gray-600 mr-3" />
                                    <div>
                                        <p className="font-medium text-gray-800">{conversation.first_name} {conversation.last_name}</p>
                                        <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>
                                    </div>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {conversation.last_message_time && formatTime(conversation.last_message_time)}
                                </div>
                                {conversation.unseenCount > 0 && (
                                    <span className="ml-2 text-xs text-red-500 font-semibold">
                                        {conversation.unseenCount} new
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : null}
                {selectedConversation !== null && (
                    <div className={`${isMobileView ? 'w-full' : 'w-2/3 p-6'}`}>
                        <div className="flex-1 p-4 flex flex-col h-full bg-white shadow-md rounded-lg">
                            {isMobileView && selectedConversation && (
                                <div className="flex gap-4 items-center                               mb-4">
                                    <button
                                        className="text-gray-600 hover:text-gray-800"
                                        onClick={() => setSelectedConversation(null)}
                                    >
                                        <FaChevronLeft size={20} />
                                    </button>
                                    <h1 className="text-gray-800 font-semibold text-lg">
                                        {conversations.find(c => c.id === selectedConversation)?.first_name} {conversations.find(c => c.id === selectedConversation)?.last_name}
                                    </h1>
                                </div>
                            )}
                            <div className="flex-1 overflow-y-auto mb-4">
                                {messages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`flex ${message.from_id === selectedConversation ? 'justify-start' : 'justify-end'} mb-4`}
                                    >
                                        <div className={`${message.from_id === selectedConversation ? 'bg-gray-100' : 'bg-primary text-white'} p-3 rounded-lg max-w-[70%]`}>
                                            <p className="text-sm">{message.body}</p>
                                            {message.attachment && (
                                                <a
                                                    href={`https://api.discoun3ree.com/storage/attachments/${message.attachment}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm underline text-blue-600"
                                                >
                                                    View attachment
                                                </a>
                                            )}
                                            <p className="text-xs text-right text-gray-500 mt-2">
                                                {moment(message.created_at).format('h:mm A')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messageEndRef} />
                            </div>
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex items-center">
                                    <input
                                        type="file"
                                        id="attachment"
                                        className="hidden"
                                        onChange={handleAttachmentChange}
                                    />
                                    <label htmlFor="attachment" className="text-gray-600 cursor-pointer mr-4">
                                        <MdAttachFile size={24} />
                                    </label>
                                    <input
                                        type="text"
                                        className="flex-1 border border-gray-300 rounded-full py-2 px-4 text-sm"
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') sendMessage();
                                        }}
                                    />
                                    <button
                                        className="ml-4 text-primary hover:text-primary-dark"
                                        onClick={sendMessage}
                                    >
                                        <IoSendOutline size={24} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;
