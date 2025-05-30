import React from 'react';
import {
    FaFacebookF,
    FaTwitter,
    FaInstagram,
    FaLinkedinIn,
    FaWhatsapp,
} from 'react-icons/fa';

const Footer = () => {
    const footerSections = [
        {
            title: "Discover Services",
            links: [
                { text: "Beauty & Wellness", href: "#" },
                { text: "Home Maintenance", href: "#" },
                { text: "Health & Fitness", href: "#" },
                { text: "Professional Services", href: "#" },
                { text: "Pet Care", href: "#" },
            ],
        },
        {
            title: "Offers & Deals",
            links: [
                { text: "Seasonal Discounts", href: "#" },
                { text: "Referral Rewards", href: "#" },
                { text: "Loyalty Programs", href: "#" },
                { text: "Bundle Deals", href: "#" },
                { text: "Gift Cards", href: "#" },
            ],
        },
        {
            title: "Help & Support",
            links: [
                { text: "FAQs", href: "#" },
                { text: "Customer Service", href: "#" },
                { text: "Cancellation Policy", href: "#" },
                { text: "Service Guarantee", href: "#" },
                { text: "Feedback", href: "#" },
            ],
        },
        {
            title: "Company",
            links: [
                { text: "About Us", href: "#" },
                { text: "Careers", href: "#" },
                { text: "Press Releases", href: "#" },
                { text: "Investor Relations", href: "#" },
                { text: "Sustainability", href: "#" },
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
        <footer className="bg-gray-900 text-gray-300">
            {/* Section Links */}
            <div className="py-12 px-[5%]">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {footerSections.map((section) => (
                        <div key={section.title}>
                            <h3 className="text-lg font-semibold text-white mb-4">
                                {section.title}
                            </h3>
                            <ul className="space-y-2">
                                {section.links.map(({ text, href }) => (
                                    <li key={`${section.title}-${text}`}>
                                        <a
                                            href={href}
                                            className="text-gray-400 hover:text-white transition-colors"
                                            title={text}
                                        >
                                            {text}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Branding and Social Links */}
            <div className="border-t border-gray-800 py-8 px-[5%]">
                <div className="flex flex-col lg:flex-row justify-between items-center gap-4 text-center">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6">
                        <p className="text-2xl font-bold text-white">Qualy</p>
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} D3 Ltd. All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-4">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.href}
                                className="text-gray-400 hover:text-white hover:scale-110 transition-all"
                                aria-label={social.name}
                                title={social.name}
                            >
                                {social.icon}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Links */}
            <div className="border-t border-gray-800 py-4 px-[5%] text-center">
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                    <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white transition-colors">Contact Us</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
