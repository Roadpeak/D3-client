import React from 'react';
import { FaRegCircleUser } from 'react-icons/fa6';
import { IoHomeOutline } from 'react-icons/io5';
import { MdOutlineDiscount, MdOutlineShoppingBag } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/context/AuthContext';

const BottomNav = () => {
    const location = useLocation();
    const { user } = useAuth();

    const authRoutes = ['/accounts/sign-in', '/accounts/sign-up', '/forgot-password'];

    if (authRoutes.includes(location.pathname)) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 transform shadow-lg flex justify-around items-center py-3 w-full z-50 bg-primary text-white sm:hidden">
            <Link to='/' className="flex flex-col items-center justify-center">
                <IoHomeOutline size={24} />
                <span className="text-[14px] font-medium">Home</span>
            </Link>
            <Link to='/offers' className="flex flex-col items-center justify-center">
                <MdOutlineDiscount size={24} />
                <span className="text-[14px] font-medium">Offers</span>
            </Link>
            <Link to='/merchants' className="flex flex-col items-center justify-center">
                <MdOutlineShoppingBag size={24} />
                <span className="text-[14px] font-medium">Stores</span>
            </Link>
            <Link to={user ? '/accounts/profile' : '/accounts/sign-in'} className="flex flex-col items-center justify-center">
                <FaRegCircleUser size={24} />
                <span className="text-[14px] font-medium">Profile</span>
            </Link>
        </div>
    );
};

export default BottomNav;
