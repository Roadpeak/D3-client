import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const TermsConditions = () => {
  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms & Conditions</h1>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6 text-sm">Last updated: August 23, 2025</p>
            
            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-700 mb-4">
                By accessing and using D3's services, you agree to be bound by these Terms and Conditions. 
                If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
              <p className="text-gray-700 mb-4">
                D3 (Discoun3) is a services marketplace platform that connects service providers with customers seeking deals and offers. 
                Our platform enables booking services, requesting quotes, and discovering discounts across various categories.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">3. User Responsibilities</h2>
              <div className="text-gray-700 space-y-2">
                <p>• Provide accurate information when creating accounts and booking services</p>
                <p>• Not post false, misleading, or defamatory content</p>
                <p>• Respect intellectual property rights</p>
                <p>• Honor bookings made through the platform</p>
                <p>• Not engage in spam or unauthorized marketing activities</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Service Bookings and Payments</h2>
              <p className="text-gray-700 mb-4">
                Customers book services through D3 but complete payments directly with service providers. 
                D3 facilitates the connection and booking process but is not directly involved in payment transactions 
                between customers and service providers.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Prohibited Activities</h2>
              <div className="text-gray-700 space-y-2">
                <p>• Creating fake service listings or bookings</p>
                <p>• Posting inappropriate or offensive content</p>
                <p>• Attempting to hack or compromise our systems</p>
                <p>• Using our platform for illegal activities</p>
                <p>• Circumventing the booking system to avoid platform guidelines</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
              <p className="text-gray-700 mb-4">
                All content on D3, including logos, text, images, and software, is protected by 
                intellectual property rights. Users may not use our content without permission.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
              <p className="text-gray-700 mb-4">
                D3 acts as a marketplace platform connecting customers with service providers. We are not liable 
                for the quality, safety, or legality of services provided, or any direct, indirect, incidental, 
                or consequential damages arising from service bookings or interactions.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">8. Privacy</h2>
              <p className="text-gray-700 mb-4">
                Your privacy is important to us. Please review our Privacy Policy to understand how we 
                collect, use, and protect your information when using D3's services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">9. Modifications to Terms</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify these terms at any time. Users will be notified of 
                significant changes, and continued use constitutes acceptance of modified terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">10. Contact Information</h2>
              <p className="text-gray-700">
                If you have questions about these Terms & Conditions, please contact us at:
                <br />
                Email: support@d3deals.com
                <br />
                Phone: 1300 271 3365
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default TermsConditions;