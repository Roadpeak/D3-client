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
    const [open, setOpen] = useState(false);
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

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleUserIconClick = () => {
        if (user) {
            if (isMobile) {
                setOpen(true);
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
                        <div className="flex items-center gap-1">
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

                <div className="flex items-center px-4">
                    <form onSubmit={handleSearch} className="hidden md:flex items-center border rounded-full w-[250px] md:w-[60%] px-3 py-2 bg-gray-50">
                        <input
                            type="text"
                            placeholder="Search products..."
                            className="flex-grow outline-none bg-transparent text-[15px] text-gray-700"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleSearch(e);
                                }
                            }}
                        />
                        <button type="submit" className="hidden md:flex text-gray-600">
                            <IoIosSearch size={20} />
                        </button>
                    </form>


                    {user && (
                        <div className="hidden md:flex items-center gap-4 ml-8">
                            <Link to='/my-vouchers' className="text-gray-700 text-[15px] font-semibold">Vouchers</Link>
                            <Link to='/chat' className="text-gray-700 text-[15px] font-semibold">Chat</Link>
                            <Link to='/my-bookings' className="text-gray-700 text-[15px] font-semibold">Bookings</Link>
                            <Link to='/my-tickets' className="text-gray-700 text-[15px] font-semibold">Tickets</Link>
                        </div>
                    )}
                </div>
                <div className="flex ">
                    <FiMenu size={20} />
                </div>
                {/* <div className="flex items-center gap-6">
                    {user ? (
                        <>
                            <button onClick={handleUserIconClick} className="md:ml-4 flex items-center gap-2 text-black hover:text-primary">
                                <FaCircleUser size={24} className="text-black" />
                            </button>
                            {user?.user_type === 'admin' && (
                                <Link to='/manage' className="bg-white text-primary text-[15px] font-semibold px-4 py-2 rounded-full">Dashboard</Link>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center gap-2 ml-4">
                            <div className="flex flex-col items-center relative text-white">
                                <div className="flex relative w-full items-center">
                                    <Link to='/accounts/sign-in' className="flex text-black md:hidden">
                                        <FiUser size={24} className='text-gray-500 border rounded-full border-gray-400 p-1' />
                                    </Link>
                                    <div className="flex flex-col relative">
                                        <button onClick={() => setLogin(!login)} className='mr-3 hidden md:flex text-primary hover:underline text-[15px] font-medium'>Login</button>
                                        {login && (
                                            <div className="flex flex-col absolute top-full left-0 rounded-md p-4 bg-white gap-2">
                                                <Link className='text-primary text-[15px] font-medium hover:underline' to='/accounts/sign-in'>User</Link>
                                                <Link className='text-primary text-[15px] font-medium hover:underline' to='https://merchants.discoun3ree.com/accounts/login' target='_blank'>Merchant</Link>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col relative">
                                        <button onClick={() => setRegister(!register)} className='hidden md:flex text-white hover:underline font-medium text-[15px] bg-primary px-6 py-1.5 rounded-md'>Register</button>
                                        {register && (
                                            <div className="flex flex-col absolute top-full right-0 rounded-md p-4 bg-white gap-2">
                                                <Link className='text-primary text-[15px] font-medium hover:underline' to='/accounts/sign-up'>User</Link>
                                                <Link className='text-primary text-[15px] font-medium hover:underline' to='https://merchants.discoun3ree.com/accounts/register' target='_blank'>Merchant</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div> */}
            </div>
            {open && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
                    <div className="absolute z-40 mt-4 right-0 top-5 bg-white w-[250px] h-[55vh] flex flex-col gap-4 rounded-lg p-6 ">
                        <p className="border-b mb-4 w-full text-[18px] font-medium border-gray-300">Manage Account</p>
                        <Link to='/accounts/profile' className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><FaRegUser /> Account</Link>
                        <Link to='/my-vouchers' className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><MdOutlineDiscount /> Vouchers</Link>
                        <Link to='/chat' className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><IoChatboxEllipsesOutline /> Chat</Link>
                        <Link to='/my-bookings' className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><CiBookmarkPlus /> Bookings</Link>
                        <Link to='/my-tickets' className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><BsTicketDetailed /> Tickets</Link>
                        {user?.user_type === 'admin' && (
                            <Link to='/manage' className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><LuLayoutDashboard /> Dashboard</Link>
                        )}
                        <button onClick={logoutUser} className="text-[15px] text-gray-600 hover:text-primary flex items-center gap-2"><FiUser /> Logout</button>
                        <button onClick={() => setOpen(false)} className="bg-primary rounded-md text-[15px] font-medium text-white py-1.5 z-40">Close</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

