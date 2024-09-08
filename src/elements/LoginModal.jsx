import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

const LoginModal = ({ onClose, onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [loginType, setLoginType] = useState('user'); 

    const handleSubmit = async (event)=> {
        event.preventDefault();
        setLoading(true);
        try {
            const endpoint = loginType === 'user' ? 'https://api.discoun3ree.com/api/user/login' : 'https://api.discoun3ree.com/api/seller/login';
            const response = await axios.post(endpoint, { email, password });
            const token = response.data.access_token;
            localStorage.setItem('access_token', token);
            setError('');
            onClose();
            onLogin();
            setLoading(false);
        } catch (error) {
            setLoading(false);
            setError('An error occurred');
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md max-w-sm w-full">
                <div className="flex w-full justify-start gap-2 border-b border-gray-400 mb-4">
                    <button
                        className={`px-4 py-2 flex items-center ${loginType === 'user' ? 'text-primary border-b-2 border-primary' : 'text-black'}`}
                        onClick={() => setLoginType('user')}
                    >
                        User
                    </button>
                    <button
                        className={`px-4 py-2 flex items-center ${loginType === 'seller' ? 'text-primary border-b-2 border-primary' : 'text-black'}`}
                        onClick={() => setLoginType('seller')}
                    >
                        Seller
                    </button>
                </div>
                <h2 className="text-xl font-bold mb-4">Login as {loginType === 'user' ? 'User' : 'Seller'}</h2>
                <form onSubmit={handleSubmit}>
                    {error && <p className="text-sm text-red-500 mb-4">{error}</p>}
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-sm font-medium text-black">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 p-2 block w-full rounded border border-gray-300 focus:border-primary outline-none"
                            required
                        />
                    </div>
                    <div className="">
                        <label htmlFor="password" className="block text-sm font-medium text-black">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 p-2 block w-full rounded border border-gray-300 focus:border-primary outline-none"
                            required
                        />
                    </div>
                    <p className="text-sm text-gray-700 text-start mt-4 mb-1">
                        Don't have an account?{' '}
                        <Link to="/accounts/sign-up" className="text-red-500">
                            Sign Up
                        </Link>
                    </p>
                    <div className="mb-4">
                        <button type="submit" className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600">
                            {loading ? <ClipLoader color="#fff" /> : 'Log in'}
                        </button>
                    </div>
                </form>
                <button onClick={onClose} className="text-gray-500 ml-2 hover:text-gray-700 focus:outline-none">
                    Cancel
                </button>
            </div>
        </div>
    );
};

export default LoginModal;
