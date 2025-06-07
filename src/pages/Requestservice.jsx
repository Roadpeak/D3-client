import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Custom SVG Icons
const Search = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const MapPin = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const User = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Plus = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const Clock = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12,6 12,12 16,14" />
  </svg>
);

const Star = ({ className }) => (
  <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);

const DollarSign = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const Calendar = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const MessageSquare = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
  </svg>
);

const ChevronDown = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polyline points="6,9 12,15 18,9" />
  </svg>
);

const Filter = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
  </svg>
);

const Briefcase = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

export default function RequestServicePage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const serviceCategories = [
    { name: "Home Services", icon: "🏠", count: 45, color: "bg-blue-100 text-blue-800" },
    { name: "Auto Services", icon: "🚗", count: 23, color: "bg-green-100 text-green-800" },
    { name: "Beauty & Wellness", icon: "💄", count: 67, color: "bg-pink-100 text-pink-800" },
    { name: "Tech Support", icon: "💻", count: 34, color: "bg-purple-100 text-purple-800" },
    { name: "Event Services", icon: "🎉", count: 28, color: "bg-yellow-100 text-yellow-800" },
    { name: "Tutoring", icon: "📚", count: 56, color: "bg-indigo-100 text-indigo-800" },
    { name: "Fitness", icon: "💪", count: 19, color: "bg-orange-100 text-orange-800" },
    { name: "Photography", icon: "📸", count: 41, color: "bg-teal-100 text-teal-800" }
  ];

  const serviceRequests = [
    {
      id: 1,
      title: "Need a Professional House Cleaning Service",
      category: "Home Services",
      description: "Looking for reliable house cleaning service for a 3-bedroom apartment. Need deep cleaning including bathrooms, kitchen, and all rooms.",
      budget: "$150 - $300",
      timeline: "This Weekend",
      location: "Westlands, Nairobi",
      postedBy: "Sarah M.",
      postedTime: "2 hours ago",
      offers: 8,
      status: "Open",
      priority: "Urgent",
      requirements: ["Licensed", "Insurance", "References"]
    },
    {
      id: 2,
      title: "Car Air Conditioning Repair Needed",
      category: "Auto Services",
      description: "My car's AC stopped working completely. Need experienced mechanic to diagnose and fix the issue. Toyota Camry 2018 model.",
      budget: "$200 - $500",
      timeline: "Next Week",
      location: "Karen, Nairobi",
      postedBy: "John K.",
      postedTime: "5 hours ago",
      offers: 12,
      status: "Open",
      priority: "Normal",
      requirements: ["Certified Mechanic", "Warranty"]
    },
    {
      id: 3,
      title: "Wedding Photography Package",
      category: "Photography",
      description: "Looking for professional wedding photographer for outdoor ceremony. Need full day coverage with edited photos and album.",
      budget: "$800 - $1500",
      timeline: "March 15, 2024",
      location: "Nairobi National Park",
      postedBy: "Maria & James",
      postedTime: "1 day ago",
      offers: 15,
      status: "Open",
      priority: "Normal",
      requirements: ["Portfolio", "Equipment", "Experience"]
    },
    {
      id: 4,
      title: "Math Tutor for High School Student",
      category: "Tutoring",
      description: "Need experienced math tutor for Form 4 student preparing for KCSE. Focus on calculus and algebra. 3 sessions per week.",
      budget: "$100 - $200/month",
      timeline: "Ongoing",
      location: "Kilimani, Nairobi",
      postedBy: "Grace W.",
      postedTime: "3 days ago",
      offers: 6,
      status: "In Progress",
      priority: "Normal",
      requirements: ["Teaching Experience", "KCSE Results"]
    },
    {
      id: 5,
      title: "Personal Trainer for Weight Loss",
      category: "Fitness",
      description: "Looking for certified personal trainer to help with weight loss journey. Need someone who can create custom workout plans.",
      budget: "$150 - $300/month",
      timeline: "Starting ASAP",
      location: "Westlands Gym",
      postedBy: "David R.",
      postedTime: "6 hours ago",
      offers: 9,
      status: "Open",
      priority: "High",
      requirements: ["Certification", "Nutrition Knowledge"]
    },
    {
      id: 6,
      title: "Laptop Screen Replacement",
      category: "Tech Support",
      description: "MacBook Pro 2020 screen is cracked and needs replacement. Looking for authorized repair service with genuine parts.",
      budget: "$200 - $400",
      timeline: "This Week",
      location: "CBD, Nairobi",
      postedBy: "Alex T.",
      postedTime: "8 hours ago",
      offers: 4,
      status: "Open",
      priority: "Normal",
      requirements: ["Authorized Service", "Genuine Parts"]
    }
  ];

  const recentOffers = [
    {
      id: 1,
      providerId: 1,
      requestId: 1,
      providerName: "CleanPro Services",
      rating: 4.8,
      reviews: 124,
      price: "$250",
      message: "We can provide comprehensive house cleaning with eco-friendly products. 5 years experience.",
      responseTime: "30 minutes ago",
      verified: true
    },
    {
      id: 2,
      providerId: 2,
      requestId: 2,
      providerName: "AutoFix Garage",
      rating: 4.6,
      reviews: 89,
      price: "$350",
      message: "Certified Toyota specialist. Can diagnose and fix AC issues same day. 2 year warranty included.",
      responseTime: "1 hour ago",
      verified: true
    },
    {
      id: 3,
      providerId: 3,
      requestId: 3,
      providerName: "Capture Moments Studio",
      rating: 4.9,
      reviews: 67,
      price: "$1200",
      message: "Award-winning wedding photographer with 8+ years experience. Portfolio available for review.",
      responseTime: "2 hours ago",
      verified: true
    }
  ];

  const RequestForm = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Post a Service Request</h2>
            <button 
              onClick={() => setShowRequestForm(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <form className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Category *</label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">
              <option value="">Select a category</option>
              {serviceCategories.map((cat, index) => (
                <option key={index} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Service Title *</label>
            <input 
              type="text" 
              placeholder="Briefly describe what service you need"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea 
              rows="4"
              placeholder="Provide detailed description of your requirements..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            ></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range *</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">
                <option value="">Select budget range</option>
                <option value="0-100">$0 - $100</option>
                <option value="100-300">$100 - $300</option>
                <option value="300-500">$300 - $500</option>
                <option value="500-1000">$500 - $1000</option>
                <option value="1000+">$1000+</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timeline *</label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500">
                <option value="">When do you need this?</option>
                <option value="urgent">ASAP/Urgent</option>
                <option value="thisweek">This Week</option>
                <option value="nextweek">Next Week</option>
                <option value="thismonth">This Month</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
            <input 
              type="text" 
              placeholder="Enter your location"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-red-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Must be licensed/certified</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Insurance required</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">References needed</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Portfolio/samples required</span>
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <button 
              type="button"
              onClick={() => setShowRequestForm(false)}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Post Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner */}
      {/* <div className="bg-red-600 text-white text-center py-2 text-sm">
        🔥 Post your service request and get quotes from verified providers!
      </div> */}

      {/* Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Need a Service?</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Post your service request and get competitive quotes from verified professionals in your area
          </p>
          <button 
            onClick={() => setShowRequestForm(true)}
            className="bg-white text-red-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Post Service Request</span>
          </button>
        </div>
      </section>

      {/* Service Categories */}
      <section className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Browse Service Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {serviceCategories.map((category, index) => (
            <div key={index} className="bg-white rounded-lg p-4 text-center hover:shadow-lg transition-shadow cursor-pointer group">
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-red-600">{category.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${category.color}`}>
                {category.count} requests
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Filter and Stats Bar */}
      <section className="container mx-auto px-4 py-4">
        <div className="bg-white rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            <select className="border border-gray-200 rounded px-3 py-1 text-sm">
              <option>All Categories</option>
              <option>Home Services</option>
              <option>Auto Services</option>
              <option>Beauty & Wellness</option>
            </select>
            <select className="border border-gray-200 rounded px-3 py-1 text-sm">
              <option>All Budgets</option>
              <option>$0 - $100</option>
              <option>$100 - $500</option>
              <option>$500+</option>
            </select>
            <select className="border border-gray-200 rounded px-3 py-1 text-sm">
              <option>All Timelines</option>
              <option>Urgent</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            <span className="font-semibold">247</span> active service requests
          </div>
        </div>
      </section>

      {/* Service Requests */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Active Service Requests</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'all' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              All Requests
            </button>
            <button 
              onClick={() => setActiveTab('recent')}
              className={`px-4 py-2 rounded-lg font-medium ${activeTab === 'recent' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'}`}
            >
              Recent Offers
            </button>
          </div>
        </div>

        {activeTab === 'all' && (
          <div className="space-y-6">
            {serviceRequests.map((request) => (
              <div key={request.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{request.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.priority === 'Urgent' ? 'bg-red-100 text-red-800' :
                          request.priority === 'High' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {request.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          request.status === 'Open' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{request.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4" />
                          <span>{request.location}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{request.budget}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{request.timeline}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>by {request.postedBy}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-500">{request.postedTime}</span>
                          <div className="flex items-center space-x-2">
                            <MessageSquare className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-red-600">{request.offers} offers received</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium">
                            View Details
                          </button>
                          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium">
                            Make Offer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {request.requirements && request.requirements.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {request.requirements.map((req, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                          {req}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'recent' && (
          <div className="space-y-6">
            {recentOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <Briefcase className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">{offer.providerName}</h3>
                          {offer.verified && (
                            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Star className="w-4 h-4 text-yellow-400 mr-1" />
                            <span className="font-medium">{offer.rating}</span>
                          </div>
                          <span>({offer.reviews} reviews)</span>
                          <span className="text-gray-400">•</span>
                          <span>{offer.responseTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{offer.price}</div>
                      <div className="text-sm text-gray-500">Quoted Price</div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <p className="text-gray-700 italic">"{offer.message}"</p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">
                      Offer for: <span className="font-medium">
                        {serviceRequests.find(req => req.id === offer.requestId)?.title}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">
                        View Store
                      </button>
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium">
                        Accept Offer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Statistics Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose Our Platform?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Connect with verified service providers and get the best deals for your needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">2,500+</div>
              <div className="text-gray-600">Service Providers</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">15,000+</div>
              <div className="text-gray-600">Completed Requests</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">4.8★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-red-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
     

      {/* Request Form Modal */}
      {showRequestForm && <RequestForm />}
    </div>
  );
}
