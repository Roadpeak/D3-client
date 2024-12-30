import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IoIosSearch, IoMdClose } from 'react-icons/io';
import { FaCircleUser } from 'react-icons/fa6';
import { FiMenu } from 'react-icons/fi';
import { AiOutlineHome, AiOutlineShop, AiOutlineTags, AiOutlineMessage, AiOutlineTag } from 'react-icons/ai';
import { MdOutlineConfirmationNumber } from 'react-icons/md';
import { useAuth } from '../utils/context/AuthContext';
import { CiHome } from "react-icons/ci";
import { FaStore } from "react-icons/fa6";
import { CiDiscount1 } from "react-icons/ci";
import { CiShoppingTag } from "react-icons/ci";
import { CiChat1 } from "react-icons/ci";
import { CiBookmarkCheck } from "react-icons/ci";
import { IoTicket } from "react-icons/io5";

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenu, setOpenMenu] = useState(false);
    const [showNavBar, setShowNavBar] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            setShowNavBar(scrollTop < lastScrollTop || scrollTop < 50);

            setLastScrollTop(scrollTop <= 0 ? 0 : scrollTop);
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollTop]);

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/search?query=${searchQuery}`);
        setSearchQuery('');
    };

    const logoutUser = () => {
        const domain = window.location.hostname === 'localhost' ? '' : '; domain=.discoun3ree.com';
        document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domain}; secure; SameSite=None`;
        navigate('/');
        window.location.reload();
    };

    return (
        <>
            <div
                className={`fixed top-0 left-0 w-full bg-white border-b border-gray-200 z-50 shadow-md transition-transform duration-300 ${
                    showNavBar ? 'translate-y-0' : '-translate-y-full'
                }`}
                style={{ background: 'rgba(255, 255, 255, 0.95)' }}
            >
                <div className="w-full py-3 px-[5%] flex justify-between items-center">
                    <div className="flex items-center">
                        <p className="text-3xl font-bold text-[#ff9021]" style={{ fontFamily: 'Museo Moderno, sans-serif' }}>
                            d3
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-12 w-full">
                        <div className="flex items-center gap-8 ml-12">
                            <Link to="/" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <CiHome />Home
                            </Link>
                            <Link to="/merchants" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <FaStore /> Stores
                            </Link>
                            <Link to="/offers" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <CiDiscount1 /> Deals
                            </Link>
                            <Link to="/my-vouchers" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <CiShoppingTag />
                            Vouchers
                            </Link>
                            <Link to="/chat" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <CiChat1 /> Chat
                            </Link>
                            <Link to="/my-bookings" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <CiBookmarkCheck />Bookings
                            </Link>
                            <Link to="/my-tickets" className="flex items-center gap-2 text-black-700 hover:text-red-500">
                            <IoTicket /> Tickets
                            </Link>
                        </div>

                        <div className="flex w-full max-w-lg mr-12">
                            <form
                                onSubmit={handleSearch}
                                className="flex items-center w-full bg-white border border-gray-300 rounded-full overflow-hidden"
                            >
                                <input
                                    type="text"
                                    placeholder="Search on d3..."
                                    className="flex-grow px-4 py-2 text-gray-700 text-sm outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    className="bg-gray-800 text-white px-6 py-2 text-sm font-medium"
                                >
                                    Search
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <button className="text-gray-700 hover:text-red-500">
                            <FaCircleUser size={24} />
                        </button>
                        <button
                            onClick={logoutUser}
                            className="bg-[#ff9021] text-white px-4 py-2 rounded-full text-[15px] font-semibold"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="md:hidden flex items-center">
                        <FiMenu size={24} onClick={() => setOpenMenu(true)} />
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '72px' }}></div>
        </>
    );
};

export default Navbar;
