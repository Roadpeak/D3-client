import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Link } from 'react-router-dom';

const FAQ = () => {
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (index) => {
    setOpenItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const faqData = [
    {
      category: "General",
      questions: [
        {
          question: "What is D3 (Discoun3)?",
          answer: "D3 is a services marketplace for deals and offers that connects service providers with service seekers. We help customers discover, book, and enjoy services at discounted prices from restaurants, salons, fitness centers, entertainment, travel, and professional services."
        },
        {
          question: "Is D3 free to use?",
          answer: "Yes! Browsing deals and booking services on D3 is completely free for customers. Service providers can also create basic listings for free and only pay for premium features if they choose to upgrade."
        },
        {
          question: "How do I find deals and offers?",
          answer: "Simply browse our categories or search for specific services. You can filter by location, price, ratings, and availability. You can also post a service request and receive multiple offers from providers competing for your business."
        },
        {
          question: "What makes D3 different from other platforms?",
          answer: "D3 is more than just discounts - we're a full booking platform. You can select specific staff members, choose branches, chat directly with providers, read reviews, and book services seamlessly, all while enjoying exclusive deals."
        }
      ]
    },
    {
      category: "Booking & Services",
      questions: [
        {
          question: "How do I book a service on D3?",
          answer: "Find the service you want, select your preferred date and time, choose your branch and staff member (if applicable), then confirm your booking. You'll receive a confirmation with all the details. Payment is completed directly with the service provider."
        },
        {
          question: "Can I choose specific staff members when booking?",
          answer: "Yes! Many service providers on D3 allow you to select specific staff members when making your booking. You can view staff profiles, ratings, and specialties before making your choice."
        },
        {
          question: "What is a Service Request and how does it work?",
          answer: "Service Requests let you post what service you need, and multiple providers will send you customized offers. Simply describe your requirements, set your budget, and wait for providers to compete for your business with their best deals."
        },
        {
          question: "Can I cancel or reschedule my booking?",
          answer: "Cancellation and rescheduling policies vary by service provider. Check the specific provider's policy before booking, or contact them directly through D3's chat feature to discuss changes."
        },
        {
          question: "How do I know if my booking is confirmed?",
          answer: "You'll receive a booking confirmation immediately after completing your reservation on D3. You can also view all your bookings in your profile under 'My Bookings' section."
        }
      ]
    },
    {
      category: "Payments & Pricing",
      questions: [
        {
          question: "How do payments work on D3?",
          answer: "D3 uses a 'Pay In-Store' model. You book and confirm your service on D3, but complete payment directly with the service provider at the time of service. This ensures no hidden charges and maximum flexibility."
        },
        {
          question: "Are there any booking fees?",
          answer: "No! D3 doesn't charge customers any booking fees. The price you see is what you pay to the service provider. We believe in transparency and keeping costs low for our users."
        },
        {
          question: "How do I know I'm getting a good deal?",
          answer: "All offers on D3 show the original price and discounted price clearly. You can also compare multiple offers for the same service and read reviews from other customers to ensure you're getting the best value."
        },
        {
          question: "What if the service provider tries to charge me more than the D3 price?",
          answer: "The price shown on D3 is guaranteed. If a provider tries to charge more, show them your D3 booking confirmation. If issues persist, contact our support team immediately for assistance."
        }
      ]
    },
    {
      category: "Account & Profile",
      questions: [
        {
          question: "Do I need an account to book services?",
          answer: "Yes, you need a D3 account to book services, post service requests, chat with providers, and manage your bookings. Creating an account is free and takes less than a minute."
        },
        {
          question: "How do I reset my password?",
          answer: "Click 'Sign In' then 'Forgot Password'. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password."
        },
        {
          question: "Can I save my favorite providers?",
          answer: "Yes! You can follow your favorite service providers to get updates on their latest offers and easily book with them again. Access your followed providers in your profile."
        },
        {
          question: "How do I update my profile information?",
          answer: "Go to your profile page and click 'Settings' to update your personal information, contact details, and preferences. You can also manage your notification settings there."
        }
      ]
    },
    {
      category: "Reviews & Communication",
      questions: [
        {
          question: "How do I leave a review?",
          answer: "After completing a service, you'll receive a notification to leave a review. You can also go to your booking history and rate your experience. Your honest feedback helps other customers and improves service quality."
        },
        {
          question: "Can I chat with service providers before booking?",
          answer: "Absolutely! D3 features direct chat with service providers. You can ask questions, clarify details, discuss special requirements, or get more information before making your booking decision."
        },
        {
          question: "What if I have a problem with a service provider?",
          answer: "First, try resolving the issue directly with the provider through our chat feature. If that doesn't work, contact our support team with your booking details and we'll help mediate and resolve the situation."
        },
        {
          question: "How do I report inappropriate behavior or fake reviews?",
          answer: "Use the 'Report' button on any inappropriate content or contact our support team directly. We take all reports seriously and investigate thoroughly to maintain a safe and trustworthy platform."
        }
      ]
    },
    {
      category: "For Service Providers",
      questions: [
        {
          question: "How can I list my business on D3?",
          answer: "Sign up as a service provider, create your digital storefront, add your services and offers, set up your branches and staff profiles, then start receiving bookings. Our team will guide you through the setup process."
        },
        {
          question: "How do I manage multiple branches on D3?",
          answer: "D3's platform allows you to list multiple branches, each with their own staff, schedules, and availability. Customers can choose which branch and staff member they prefer when booking."
        },
        {
          question: "How do I respond to Service Requests?",
          answer: "When customers post service requests in your category, you'll receive notifications. You can then send customized offers with your pricing and availability to compete for their business."
        },
        {
          question: "What are the fees for service providers?",
          answer: "D3 offers free basic listings for service providers. We have premium features and advertising options available for providers who want to increase their visibility and bookings. Contact us for detailed pricing."
        },
        {
          question: "How do I get more bookings on D3?",
          answer: "Complete your profile with high-quality photos, detailed service descriptions, competitive pricing, respond quickly to messages and service requests, maintain good reviews, and keep your availability calendar updated."
        }
      ]
    }
  ];

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Find answers to common questions about D3 (Discoun3). Can't find what you're looking for? Contact our support team for personalized assistance.
            </p>
          </div>

          {/* Search FAQ */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search FAQ..."
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                <path d="M21 21L16.514 16.506L21 21ZM19 10.5C19 15.194 15.194 19 10.5 19C5.806 19 2 15.194 2 10.5C2 5.806 5.806 2 10.5 2C15.194 2 19 5.806 19 10.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* FAQ Categories */}
          <div className="space-y-8">
            {faqData.map((category, categoryIndex) => (
              <div key={categoryIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <h2 className="text-xl font-semibold text-gray-900">{category.category}</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {category.questions.map((item, questionIndex) => {
                    const itemKey = `${categoryIndex}-${questionIndex}`;
                    const isOpen = openItems[itemKey];

                    return (
                      <div key={questionIndex}>
                        <button
                          onClick={() => toggleItem(itemKey)}
                          className="w-full px-6 py-4 text-left focus:outline-none focus:bg-gray-50 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900 pr-4">
                              {item.question}
                            </h3>
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                              className={`transform transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-400 flex-shrink-0`}
                            >
                              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-6 pb-4">
                            <p className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-gray-600 mb-6">
              Can't find the answer you're looking for? Our friendly support team is here to help you with D3.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact-us" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-block">
                Contact Support
              </Link>
              <Link to="/contact-us" className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors inline-block">
                Send Feedback
              </Link>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Email: <a href="mailto:support@discoun3ree.com" className="text-blue-500 hover:text-blue-600">support@discoun3ree.com</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;