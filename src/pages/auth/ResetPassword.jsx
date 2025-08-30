import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Extract query parameters
    const query = new URLSearchParams(location.search);
    const token = query.get('token');
    const email = query.get('email');

    // Handle form submission
    const handleResetPassword = async (e) => {
        e.preventDefault();

        // Check if passwords match
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            // Submit the reset password request
            const response = await axios.post('${process.env.REACT_APP_API_BASE_URL}/api/v1/reset-password', {
                token,
                email,
                password,
                password_confirmation: confirmPassword,
            });
            setSuccess(response.data.message);
            setError('');

            // Redirect after success
            setTimeout(() => {
                navigate('/accounts/sign-in');
            }, 3000);
        } catch (error) {
            setError('Failed to reset password. Please try again.');
            setSuccess('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex border bg-gray-100 items-center justify-center min-h-screen">
            <div className="w-fit bg-white h-fit rounded-md flex flex-col md:flex-row">
                <div className="bg-white p-8 rounded-lg w-full md:w-1/2">
                    <div className="text-center mb-2">
                        <a href="/">
                            {/* <img src={logo} className='w-[50px] -mb-4 mx-auto' alt="" /> */}
                        </a>
                        <h1 className="text-2xl font-semibold text-black">Reset Password</h1>
                    </div>
                    <form onSubmit={handleResetPassword}>
                        {error && <div className="text-red-500 mb-4">{error}</div>}
                        {success && <div className="text-green-500 mb-4">{success}</div>}
                        <div className="mb-4">
                            <label className="text-[14px] text-black">New Password</label>
                            <input
                                type="password"
                                className="p-2 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                                value={password}
                                placeholder='Enter new password'
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="text-[14px] text-black">Confirm New Password</label>
                            <input
                                type="password"
                                className="p-2 block w-full text-[13px] font-light text-primary border-b border-gray-300 focus:border-primary focus:outline-none"
                                value={confirmPassword}
                                placeholder='Confirm new password'
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full bg-primary font-medium text-[14px] text-white py-1.5 px-4 rounded-full disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                </div>
                <div className="w-1/2 hidden md:flex items-center justify-center">
                    <img src="https://imgs.search.brave.com/VikpyiN7OTH_xj6mfR6zYxy8_mHlGuCGveLv7wIAg14/rs:fit:500:0:0/g:ce/aHR0cHM6Ly90My5m/dGNkbi5uZXQvanBn/LzA0LzUzLzMyLzc2/LzM2MF9GXzQ1MzMy/NzYyMF9mbExTaFJD/VU50cW9WTUszTnlm/SmRLSTFVblEzRHhC/eS5qcGc" alt="Illustration" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
