import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Careers = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Careers at D3 (Discoun3)</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join our team and help us build the future of services marketplace and deals discovery. We're passionate about connecting service providers with customers seeking great value.
            </p>
          </div>

          {/* Company Values */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Why Work With Us?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7ZM23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89317 18.7122 8.75608 18.1676 9.45768C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="#3B82F6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Collaborative Team</h3>
                  <p className="text-gray-600">Work with talented individuals who are passionate about making a difference in local communities.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Growth Opportunities</h3>
                  <p className="text-gray-600">Advance your career with learning opportunities, skill development, and leadership roles.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.27L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Work-Life Balance</h3>
                  <p className="text-gray-600">Flexible schedules, remote work options, and comprehensive benefits to support your well-being.</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 11H15M9 15H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Innovation Focus</h3>
                  <p className="text-gray-600">Be part of cutting-edge projects and help shape the future of business discovery technology.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Status */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">No Current Openings</h2>
              <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                We don't have any career opportunities available at the moment. However, we're always looking for talented individuals to join our team. We encourage you to check back regularly or submit your resume for future consideration.
              </p>
            </div>
          </div>

          {/* Future Opportunities */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Roles We Typically Look For</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Software Engineers</h3>
                <p className="text-gray-600 text-sm">Full-stack developers, mobile app developers, and backend engineers to build and maintain our platform.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Product Managers</h3>
                <p className="text-gray-600 text-sm">Strategic thinkers who can guide product development and user experience improvements.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Marketing Specialists</h3>
                <p className="text-gray-600 text-sm">Digital marketers, content creators, and community managers to grow our user base.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Success</h3>
                <p className="text-gray-600 text-sm">Support specialists and account managers to help businesses succeed on our platform.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Data Analysts</h3>
                <p className="text-gray-600 text-sm">Analytical minds to help us understand user behavior and optimize our services.</p>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">UX/UI Designers</h3>
                <p className="text-gray-600 text-sm">Creative professionals to enhance user experience and interface design.</p>
              </div>
            </div>
          </div>

          {/* Stay Connected */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg shadow-sm p-8 text-white">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Stay Connected</h2>
              <p className="mb-6 text-blue-50">
                Want to be the first to know about new opportunities? Send us your resume and we'll keep you in mind for future positions.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 hover:bg-blue-50 font-medium py-3 px-6 rounded-lg transition-colors">
                  Send Your Resume
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-6 rounded-lg transition-colors">
                  Follow Us on LinkedIn
                </button>
              </div>
              
              <div className="mt-8 pt-6 border-t border-blue-400">
                <p className="text-sm text-blue-100">
                  Email us at: <a href="mailto:careers@d3deals.com" className="text-white underline">careers@d3deals.com</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Careers;