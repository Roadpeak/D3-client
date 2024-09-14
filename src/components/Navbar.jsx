import React, { useEffect, useState } from 'react';
import { FaRegUser } from "react-icons/fa";
import { FiMenu, FiUser } from 'react-icons/fi';
import { CiBookmarkPlus } from "react-icons/ci";
import { Link, useNavigate } from 'react-router-dom';
import { LuLayoutDashboard } from "react-icons/lu";
import { BsTicketDetailed } from "react-icons/bs";
import { IoChatboxEllipsesOutline } from 'react-icons/io5';
import { MdOutlineDiscount } from 'react-icons/md';
import { IoIosSearch, IoMdClose } from 'react-icons/io';
import { BsGlobe } from 'react-icons/bs';
import { FaCircleUser } from 'react-icons/fa6';
import { useAuth } from '../utils/context/AuthContext';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [login, setLogin] = useState(false);
    const [register, setRegister] = useState(false);
    const [openMenu, setOpenMenu] = useState(false);
    const [openSearch, setOpenSearch] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleSearch = (event) => {
        event.preventDefault();
        navigate(`/search?query=${searchQuery}`);
    };

    const logoutUser = () => {
        const domain = window.location.hostname === 'localhost' ? '' : '; domain=.discoun3ree.com';
        document.cookie = `access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;${domain}; secure; SameSite=None`;
        navigate('/');
        window.location.reload();
    };

    const handleUserIconClick = () => {
        if (user) {
            if (window.innerWidth <= 768) {
                setOpenMenu(true);
            } else {
                navigate('/accounts/profile');
            }
        } else {
            navigate('/accounts/sign-in');
        }
    };

    return (
        <>
            <div className="bg-black md:py-2 relative">
                <div className="hidden md:flex items-center justify-between w-full px-[5%] text-white text-[15px]">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <BsGlobe size={16} />
                            <span>Kenya</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <p>English</p>
                    </div>
                </div>
            </div>

            {openSearch && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className='w-full px-[5%] bg-gray-50 absolute top-11 flex items-center gap-2 left-0'>
                        <form onSubmit={handleSearch} className="flex items-center border rounded-full w-full px-3 py-2 bg-gray-50">
                            <input
                                type="text"
                                placeholder='Search products...'
                                className='flex-grow outline-none bg-transparent text-[15px] text-gray-700'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleSearch(e);
                                        setOpenSearch(false);
                                        setSearchQuery("");
                                    }
                                }}
                            />
                            <button type='submit' className="text-gray-600">
                                <IoIosSearch size={20} />
                            </button>
                        </form>
                        <button onClick={() => setOpenSearch(false)} className="">
                            <IoMdClose size={20} />
                        </button>
                    </div>
                </div>
            )}

            <div className='flex items-center justify-between w-full py-2 px-[5%] bg-white border-b border-gray-200'>
                <div className="flex items-center">
                    <p className="text-2xl font-bold text-primary">d3</p>
                </div>

                <div className="hidden md:flex items-center gap-4 md:px-6">
                    <Link to='/' className="text-gray-700 text-[15px] font-semibold">Home</Link>
                    <Link to='/merchants' className='text-gray-700 text-[15px] font-semibold'>Stores</Link>
                    <Link to='/offers' className="text-gray-700 text-[15px] font-semibold">Deals</Link>
                </div>

                <div className="md:hidden flex items-center">
                    <FiMenu size={24} onClick={() => setOpenMenu(true)} />
                </div>

                {user && (
                    <div className="hidden md:flex items-center gap-4 ml-8">
                        <Link to='/my-vouchers' className="text-gray-700 text-[15px] font-semibold">Vouchers</Link>
                        <Link to='/chat' className="text-gray-700 text-[15px] font-semibold">Chat</Link>
                        <Link to='/my-bookings' className="text-gray-700 text-[15px] font-semibold">Bookings</Link>
                        <Link to='/my-tickets' className="text-gray-700 text-[15px] font-semibold">Tickets</Link>
                    </div>
                )}

                <div className="hidden md:flex items-center gap-6">
                    <button onClick={handleUserIconClick} className="flex items-center gap-2 text-black hover:text-primary">
                        <FaCircleUser size={24} className="text-black" />
                    </button>
                </div>
            </div>

            {openMenu && (
                <>
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setOpenMenu(false)}></div>
                    <div className="fixed top-0 right-0 w-[70%] h-full bg-primary z-50 p-6">
                        <div className="flex flex-col gap-2">
                           <div className="flex w-full items-center justify-between mb-4 border-b border-white ">
                                <button onClick={() => setOpenMenu(false)} className="text-white">
                                    <IoMdClose size={24} />
                                </button>
                                <p className="text-2xl font-bold text-white">d3</p>
                           </div>                           
                            {user ? (
                                <div className="flex flex-col w-full">
                                    <p className="text-white border-b mb-4 w-full text-[18px] font-medium border-gray-50">Manage Account</p>
                                    <Link to='/my-vouchers' className="text-[15px] text-white hover:text-primary flex items-center gap-2"><MdOutlineDiscount size={20} /> Vouchers</Link>
                                    <Link to='/chat' className="text-[15px] text-white hover:text-primary flex items-center gap-2"><IoChatboxEllipsesOutline size={20} /> Chat</Link>
                                    <Link to='/my-bookings' className="text-[15px] text-white hover:text-primary flex items-center gap-2"><CiBookmarkPlus size={20} /> Bookings</Link>
                                    <Link to='/my-tickets' className="text-[15px] text-white hover:text-primary flex items-center gap-2"><BsTicketDetailed size={20} /> Tickets</Link>
                                    {user?.user_type === 'admin' && (
                                        <Link to='/manage' className="text-[15px] text-white hover:text-primary flex items-center gap-2"><LuLayoutDashboard size={20} /> Dashboard</Link>
                                    )}
                                    <button onClick={logoutUser} className="text-[14px] bg-white flex items-center text-center justify-center mt-2 rounded-md py-1.5 text-primary ">Logout</button>
                                </div>
                            ) : (
                                <div className="flex flex-col ">
                                        
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Navbar;
