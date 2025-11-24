import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

/**
 * ChatLayout Component
 * Layout for chat pages with Navbar but without Footer
 * Provides full-height chat experience without footer obstruction
 */
const ChatLayout = () => {
    return (
        <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
            {/* Navbar stays mounted across all routes */}
            <Navbar />

            {/* Main content area where chat route renders - no footer */}
            <main className="flex-1 bg-gray-50 dark:bg-gray-900">
                <Outlet />
            </main>
        </div>
    );
};

export default ChatLayout;
