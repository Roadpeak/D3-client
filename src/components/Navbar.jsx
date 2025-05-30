import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCircleUser, FaStore } from 'react-icons/fa6';
import { CiHome, CiDiscount1, CiShoppingTag, CiChat1, CiBookmarkCheck } from 'react-icons/ci';
import { IoTicket } from 'react-icons/io5';
import { FiMenu } from 'react-icons/fi';

const Navbar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [openMenu, setOpenMenu] = useState(false);
    const [showNavBar, setShowNavBar] = useState(true);
    const [lastScrollTop, setLastScrollTop] = useState(0);
    const navigate = useNavigate();

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
            <div className={`fixed top-0 left-0 w-full bg-red-600 z-50 shadow-lg transition-transform duration-300 ${showNavBar ? 'translate-y-0' : '-translate-y-full'}`}>
                <div className="w-full py-4 px-[5%] flex justify-between items-center">
                    <div className="flex items-center">
                        <p className="text-2xl font-bold text-white" style={{ fontFamily: 'Museo Moderno, sans-serif' }}>
                            Qualy
                        </p>
                    </div>

                    <div className="hidden md:flex items-center gap-8 w-full max-w-2xl mx-8">
                        <form onSubmit={handleSearch} className="flex items-center w-full bg-white rounded-lg overflow-hidden shadow-sm">
                            <input
                                type="text"
                                placeholder="Search for products, stores..."
                                className="flex-grow px-4 py-3 text-gray-700 text-sm outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 text-sm font-medium transition-colors">
                                Search
                            </button>
                        </form>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <button className="text-white hover:text-yellow-300 transition-colors">
                            <FaCircleUser size={24} />
                        </button>
                        <button
                            onClick={logoutUser}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                        >
                            Logout
                        </button>
                    </div>

                    <div className="md:hidden flex items-center">
                        <FiMenu size={24} className="text-white" onClick={() => setOpenMenu(true)} />
                    </div>
                </div>

                {/* Secondary Navigation */}
                <div className="hidden md:block bg-red-700 py-2">
                    <div className="px-[5%] flex items-center gap-8">
                        <Link to="/" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <CiHome size={16} /> Home
                        </Link>
                        <Link to="/merchants" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <FaStore size={14} /> Stores
                        </Link>
                        <Link to="/offers" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <CiDiscount1 size={16} /> Deals
                        </Link>
                        <Link to="/my-vouchers" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <CiShoppingTag size={16} /> Vouchers
                        </Link>
                        <Link to="/chat" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <CiChat1 size={16} /> Chat
                        </Link>
                        <Link to="/my-bookings" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <CiBookmarkCheck size={16} /> Bookings
                        </Link>
                        <Link to="/my-tickets" className="flex items-center gap-2 text-white hover:text-yellow-300 text-sm transition-colors">
                            <IoTicket size={16} /> Tickets
                        </Link>
                    </div>
                </div>
            </div>
            {/* Spacer to prevent content from being hidden behind navbar */}
            <div style={{ marginTop: '120px' }}></div>
        </>
    );
};

export default Navbar;

