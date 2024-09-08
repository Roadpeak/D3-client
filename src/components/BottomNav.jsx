import React from 'react';
import { FaRegCircleUser } from 'react-icons/fa6';
import { IoHomeOutline } from 'react-icons/io5';
import { MdOutlineDiscount, MdOutlineShoppingBag } from 'react-icons/md';
import { useLocation } from 'react-router-dom';

const BottomNav = () => {
    const location = useLocation();

    const authRoutes = ['/login', '/signup', '/forgot-password'];

    if (authRoutes.includes(location.pathname)) return null;

    return (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 shadow-lg border-t border-gray-300 flex justify-around items-center py-3 w-[90%] max-w-md rounded-full z-50 bg-primary text-white">
            <button className="flex flex-col items-center justify-center">
                <IoHomeOutline size={24} />
                <span className="text-[14px] font-medium">Home</span>
            </button>
            <button className="flex flex-col items-center justify-center">
                <MdOutlineDiscount size={24} />
                <span className="text-[14px] font-medium">Offers</span>
            </button>
            <button className="flex flex-col items-center justify-center">
                <MdOutlineShoppingBag size={24} />
                <span className="text-[14px] font-medium">Stores</span>
            </button>
            <button className="flex flex-col items-center justify-center">
                <FaRegCircleUser size={24} />
                <span className="text-[14px] font-medium">Profile</span>
            </button>
        </div>
    );
};

export default BottomNav;
