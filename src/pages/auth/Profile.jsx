import React, { useState } from 'react';
import Navbar from '../../components/Navbar';
// import Footer from '../../components/Footer';
// import { useAuth } from '../../utils/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../utils/context/AuthContext';
import toast from 'react-hot-toast';
import { getCookie } from '../../utils/cookieUtils';
// import { toast } from 'react-toastify';
// import { getCookie } from '../../utils/cookiUtils';

const UserProfileCard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState({
        firstName: user?.first_name,
        lastName: user?.last_name,
        email: user?.email,
        phone: user?.phone || '',
    });
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!user) {
        return <></>;
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProfileData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
        };

        const token = getCookie('access_token');;
        try {
            const response = await axios.put('https://api.discoun3ree.com/api/user/profile', updatedData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
            });
            console.log(response.data);
            setIsModalOpen(false);
            toast("Profile updated.")
        } catch (error) {
            toast.error("An error occured.")
        }
    };

    const logoutUser = () => {
        const domain = window.location.hostname === 'localhost' ? '' : '; domain=.discoun3ree.com';
        document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domain}; secure; SameSite=None`;
        navigate('/');
        window.location.reload();
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Navbar />
            <div className="max-w-sm my-[5%] mx-auto bg-white rounded-md overflow-hidden">
                <div className="relative">
                    <div className="absolute bottom-0 left-0 bg-primary text-white py-1 px-2 rounded-tr-md">
                        ID: {user.id}
                    </div>
                </div>

                <div className="p-6">
                    <div className="text-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-800 mt-2">{`${profileData.firstName} ${profileData.lastName}`}</h2>
                        <p className="text-sm text-gray-600">@{profileData.firstName}{profileData.lastName}</p>
                    </div>

                    <div className="mt-4">
                        <p className="text-sm text-gray-600">{`Email: ${profileData.email}`}</p>
                    </div>

                    <div className="mt-6">
                        <p className="text-sm text-gray-700">Phone: {profileData.phone}</p>
                    </div>
                    <div className="flex items-center w-full gap-4">
                        <button onClick={openModal} className="w-full border border-primary text-primary py-2 px-4 rounded-md hover:bg-opacity-80">
                            Edit Profile
                        </button>
                        <button onClick={logoutUser} className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-opacity-80">
                            Log Out
                        </button>
                    </div>
                </div>
            </div>
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-md max-w-sm w-full">
                        <h2 className="text-xl font-semibold mb-4">Edit Profile</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="firstName">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    id="firstName"
                                    value={profileData.firstName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="lastName">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    id="lastName"
                                    value={profileData.lastName}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={profileData.email}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700" htmlFor="phone">Phone</label>
                                <input
                                    type="text"
                                    name="phone"
                                    id="phone"
                                    value={profileData.phone}
                                    onChange={handleChange}
                                    className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
                                />
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={closeModal} className="text-gray-600 py-2 px-4 rounded-md hover:bg-opacity-80 mr-2">
                                    Cancel
                                </button>
                                <button type="submit" className="bg-primary text-white py-1.5 px-4 rounded-md hover:bg-opacity-80">
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* <Footer /> */}
        </>
    );
};

export default UserProfileCard;
