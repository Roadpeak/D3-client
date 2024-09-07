import React from 'react';
import axios from 'axios';
import { FcGoogle } from "react-icons/fc";

const GoogleSignInButton = () => {
    const handleGoogleSignIn = async () => {
        try {
            const response = await axios.post('https://api.discoun3ree.com/api/auth/google/redirect');
            const { url } = response.data;
            window.location.href = url;
        } catch (error) {
            console.error('Error during Google Sign-In', error);
        }
    };

    return (
        <button
            onClick={handleGoogleSignIn}
            className="bg-white gap-2 border-2 border-primary text-primary flex items-center justify-center py-1.5 px-4 rounded-full transition duration-300"
        >
            <FcGoogle size={20} />
            Continue with Google
        </button>
    );
};

export default GoogleSignInButton;
