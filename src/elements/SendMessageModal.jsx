import React, { useState } from 'react';
import axios from 'axios';
import { FiUpload } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getCookie } from '../utils/cookieUtils';

const SendMessageModal = ({ isOpen, onClose, sellerId }) => {
    const [newMessage, setNewMessage] = useState('');
    const [attachment, setAttachment] = useState(null);
    const navigate = useNavigate();

    const sendMessage = async () => {
        if (!sellerId) {
            console.error('Seller ID is missing');
            return;
        }

        const formData = new FormData();
        formData.append('to_id', sellerId.toString());
        formData.append('body', newMessage);
        if (attachment) {
            formData.append('attachment', attachment);
        }
        const accessToken = getCookie('access_token');

        try {
            const response = await axios.post('${process.env.REACT_APP_API_BASE_URL}/api/v1/messages/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${accessToken}`,
                }
            });
            setNewMessage('');
            setAttachment(null);
            onClose();
            navigate('/chat')
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleAttachmentChange = (e) => {
        if (e.target.files) {
            setAttachment(e.target.files[0]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-4 rounded shadow-lg w-80">
                <h2 className="text-lg mb-4">Send Message</h2>
                <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-2"
                    placeholder="Type your message..."
                />
                <label className="cursor-pointer flex items-center mb-2">
                    <FiUpload className="w-6 h-6 mr-2 text-gray-600" />
                    <span>Upload attachment</span>
                    <input
                        type="file"
                        onChange={handleAttachmentChange}
                        className="hidden"
                    />
                </label>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="mr-2 text-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={sendMessage}
                        className="bg-primary text-white px-4 py-1.5 rounded"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SendMessageModal;
