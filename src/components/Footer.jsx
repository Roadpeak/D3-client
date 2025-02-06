import React from "react";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
    const footerSections = [
        {
            title: "Discover Services",
            links: [
                "Beauty & Wellness",
                "Home Maintenance",
                "Health & Fitness",
                "Professional Services",
                "Pet Care",
            ],
        },
        {
            title: "Offers & Deals",
            links: [
                "Seasonal Discounts",
                "Referral Rewards",
                "Loyalty Programs",
                "Bundle Deals",
                "Gift Cards",
            ],
        },
        {
            title: "Help & Support",
            links: [
                "FAQs",
                "Customer Service",
                "Cancellation Policy",
                "Service Guarantee",
                "Feedback",
            ],
        },
        {
            title: "Company",
            links: [
                "About Us",
                "Careers",
                "Press Releases",
                "Investor Relations",
                "Sustainability",
            ],
        },
    ];

    const socialLinks = [
        { name: "Facebook", href: "#", icon: <FaFacebookF className="text-blue-600" /> },
        { name: "Twitter", href: "#", icon: <FaTwitter className="text-blue-400" /> },
        { name: "Instagram", href: "#", icon: <FaInstagram className="text-pink-500" /> },
        { name: "LinkedIn", href: "#", icon: <FaLinkedinIn className="text-blue-700" /> },
        { name: "WhatsApp", href: "#", icon: <FaWhatsapp className="text-green-500" /> },
    ];

    return (
        <footer className="bg-gray-50 text-gray-700 text-sm border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
                {footerSections.map((section) => (
                    <div key={section.title}>
                        <h3 className="text-md font-semibold text-gray-900 mb-4">
                            {section.title}
                        </h3>
                        <ul>
                            {section.links.map((link) => (
                                <li key={link} className="mb-2">
                                    <a
                                        href="#"
                                        className="text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 flex flex-col lg:flex-row justify-between items-center gap-4">
                <p className="text-center lg:text-left text-gray-500 text-xs">
                    Join our newsletter for exclusive offers and updates on services tailored
                    for you.
                </p>
                <div className="flex gap-2">
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="text-sm px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="px-6 py-2 bg-gray-800 text-white rounded-r-md text-sm hover:bg-gray-700 transition-colors">
                        Subscribe
                    </button>
                </div>
            </div>

            <div className="border-t border-gray-200"></div>

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col lg:flex-row justify-between items-center">
                <p className="text-xs text-gray-500 text-center lg:text-left">
                    © {new Date().getFullYear()} d3 ltd. All rights reserved.
                </p>
                <ul className="flex flex-wrap justify-center lg:justify-end gap-4 mt-4 lg:mt-0 text-xs">
                    <li>
                        <a
                            href="#"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Privacy Policy
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Terms of Service
                        </a>
                    </li>
                    <li>
                        <a
                            href="#"
                            className="text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            Contact Us
                        </a>
                    </li>
                </ul>
            </div>

            <div className="border-t border-gray-200 py-6">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 flex justify-center gap-6">
                    {socialLinks.map((social) => (
                        <a
                            key={social.name}
                            href={social.href}
                            className="text-gray-600 hover:scale-110 hover:text-gray-900 text-xl transition-transform"
                            aria-label={social.name}
                        >
                            {social.icon}
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
};

export default Footer;
