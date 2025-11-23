import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Privacy Policy</h1>

        <div className="prose max-w-none">
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Last updated: August 23, 2025</p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">1. Information We Collect</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-4">
              <div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Personal Information</h3>
                <p>When you create an account or list your business, we collect information such as your name, email address, phone number, and business details.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Usage Data</h3>
                <p>We automatically collect information about how you use our platform, including your IP address, browser type, device information, and pages visited.</p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-gray-900 dark:text-white">Cookies and Tracking</h3>
                <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">2. How We Use Your Information</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p>• To provide and maintain our services</p>
              <p>• To process business listings and user accounts</p>
              <p>• To communicate with you about our services</p>
              <p>• To improve our platform and user experience</p>
              <p>• To send newsletters and marketing communications (with your consent)</p>
              <p>• To comply with legal obligations</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share information in the following circumstances:
            </p>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p>• With service providers who assist in operating our platform</p>
              <p>• When required by law or to protect our rights</p>
              <p>• With your explicit consent</p>
              <p>• In connection with a business transfer or merger</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">4. Data Security</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no internet transmission is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Your Rights</h2>
            <div className="text-gray-700 dark:text-gray-300 space-y-2">
              <p>• Access your personal information</p>
              <p>• Correct inaccurate information</p>
              <p>• Request deletion of your data</p>
              <p>• Object to data processing</p>
              <p>• Data portability</p>
              <p>• Withdraw consent for marketing communications</p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Data Retention</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We retain your personal information only as long as necessary to provide our services and comply with legal obligations. Business listings may remain active until you request removal.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">7. Third-Party Links</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. Please review their privacy policies before providing any information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Children's Privacy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information promptly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Updates to This Policy</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Contact Us</h2>
            <p className="text-gray-700 dark:text-gray-300">
              If you have questions about this Privacy Policy or our data practices, please contact us at:
              <br />
              Email: info@discoun3ree.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;