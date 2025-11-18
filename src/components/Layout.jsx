import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * Layout Component
 * Keeps Navbar and Footer persistent across all route changes
 * This prevents re-mounting of the Navbar which causes the flash
 */
const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* Navbar stays mounted across all routes */}
            <Navbar />

            {/* Main content area where routes render */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                <Outlet />
            </main>

            {/* Footer stays mounted across all routes */}
            <Footer />
        </div>
    );
};

export default Layout;