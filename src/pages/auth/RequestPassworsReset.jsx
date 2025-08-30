import React, { useState } from 'react';
import axios from 'axios';
// import logo from '../../assets/icon.png';
import { Link } from 'react-router-dom';

const RequestPasswordReset = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:4000/api/v1/send-reset-link', { email });
            setMessage(response.data.message);
            setError('');
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message);
            } else {
                setError('Failed to send reset link. Please try again.');
            }
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex border bg-gray-100 items-center justify-center min-h-screen">
                <div className="w-fit bg-white h-fit rounded-md flex flex-col md:flex-row">
                    <div className="bg-white p-8 rounded-lg w-full md:w-1/2 ">
                        <div className="text-center mb-2">
                            <a href="/">
                                {/* <img src={logo} className='w-[50px] -mb-4 mx-auto' alt="Logo" /> */}
                            </a>
                            <h1 className="text-[17px] font-medium text-black">Password reset</h1>
                        </div>
                        {message && <div className="text-green-500 text-[14px] mb-4">{message}</div>}
                        {error && <div className="text-red-500 text-[14px] mb-4">{error}</div>}
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="text-[14px] text-black">Email Address</label>
                                <input
                                    type="email"
                                    className="p-2 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                                    value={email}
                                    placeholder='Enter your email address'
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-primary font-medium text-[14px] text-white py-1.5 px-4 rounded-full disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Sending...' : 'Send Reset Link'}
                            </button>
                            <p className="text-[14px] text-gray-700 text-end mt-2">Remembered your password? <Link to='/accounts/sign-in' className="text-primary">Sign in</Link></p>
                        </form>
                    </div>
                    <div className="hidden md:flex justify-center items-center ">
                        <img src="https://imgs.search.brave.com/VikpyiN7OTH_xj6mfR6zYxy8_mHlGuCGveLv7wIAg14/rs:fit:500:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA0LzUzLzMyLzc2/LzM2MF9GXzQ1MzMy/NzYyMF9mbExTaFJD/VU50cW9WTUszTnlm/SmRLSTFVblEzRHhC/eS5qcGc" alt="Illustration" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default RequestPasswordReset;
