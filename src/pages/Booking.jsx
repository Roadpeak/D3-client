import React, { useState } from 'react';
import { Calendar, Clock, MapPin, User, CreditCard, Smartphone, Check, ChevronRight, AlertCircle, Star, X } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BookingPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showMpesaPopup, setShowMpesaPopup] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bookingData, setBookingData] = useState({
    date: '',
    time: '',
    store: null,
    staff: null
  });

  // Mock data
  const offerDetails = {
    title: "Wyndham Garden at Palmas del Mar - Puerto Rico",
    originalPrice: "$200.00",
    offerPrice: "$60.00",
    image: "/api/placeholder/300/200",
    description: "Luxury resort experience with premium amenities"
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"
  ];

  // Mock availability data - in real app this would come from API
  const getTimeSlotAvailability = (date, time) => {
    // Simple mock logic - some slots are unavailable
    const unavailableSlots = {
      [new Date().toISOString().split('T')[0]]: ['10:00 AM', '02:00 PM', '06:00 PM'],
      [new Date(Date.now() + 86400000).toISOString().split('T')[0]]: ['09:00 AM', '01:00 PM', '05:00 PM']
    };
    return !unavailableSlots[date]?.includes(time);
  };

  const stores = [
    { id: 1, name: "Downtown Branch", address: "123 Main St, City Center", isOpen: true, distance: "0.5 km" },
    { id: 2, name: "Mall Location", address: "456 Shopping Mall, Level 2", isOpen: true, distance: "1.2 km" },
    { id: 3, name: "Airport Terminal", address: "Terminal 1, Gate Area", isOpen: false, distance: "15 km" },
    { id: 4, name: "Beachfront Office", address: "789 Ocean Drive", isOpen: true, distance: "3.8 km" }
  ];

  const staff = [
    { id: 1, name: "Sarah Johnson", role: "Senior Specialist", rating: 4.9, experience: "5 years", isAvailable: true, avatar: "/api/placeholder/60/60" },
    { id: 2, name: "Mike Rodriguez", role: "Expert Consultant", rating: 4.7, experience: "3 years", isAvailable: true, avatar: "/api/placeholder/60/60" },
    { id: 3, name: "Emily Chen", role: "Premium Advisor", rating: 4.8, experience: "4 years", isAvailable: false, avatar: "/api/placeholder/60/60" },
    { id: 4, name: "David Wilson", role: "Lead Specialist", rating: 4.6, experience: "6 years", isAvailable: true, avatar: "/api/placeholder/60/60" }
  ];

  const platformFee = 5.99;

  const steps = [
    { id: 1, title: "Date & Time", icon: Calendar, completed: currentStep > 1 },
    { id: 2, title: "Store Location", icon: MapPin, completed: currentStep > 2 },
    { id: 3, title: "Select Staff", icon: User, completed: currentStep > 3 },
    { id: 4, title: "Complete Booking", icon: CreditCard, completed: false }
  ];

  const handleDateTimeNext = () => {
    if (bookingData.date && bookingData.time) {
      setCurrentStep(2);
    }
  };

  const handleStoreNext = () => {
    if (bookingData.store) {
      setCurrentStep(3);
    }
  };

  const handleStaffNext = () => {
    if (bookingData.staff) {
      setCurrentStep(4);
    }
  };

  const handleBookingComplete = () => {
    alert("Booking completed successfully!");
  };

  const handleMpesaPayment = () => {
    if (phoneNumber.length >= 10) {
      setShowMpesaPopup(false);
      alert("Payment request sent to your phone. Please complete the payment.");
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const StepTracker = () => (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                step.completed ? 'bg-green-500 text-white' : 
                currentStep === step.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {step.completed ? <Check className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
              </div>
              <span className={`mt-2 text-sm font-medium ${
                currentStep === step.id ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <ChevronRight className="w-5 h-5 text-gray-400 mx-4" />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const DateTimeStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Date & Time</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Date
          </label>
          <input
            type="date"
            value={bookingData.date}
            onChange={(e) => setBookingData({...bookingData, date: e.target.value, time: ''})}
            min={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Available Time Slots
            {bookingData.date && (
              <span className="text-gray-500 font-normal"> for {new Date(bookingData.date).toLocaleDateString()}</span>
            )}
          </label>
          {!bookingData.date ? (
            <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-300 rounded-lg">
              <div className="text-center">
                <Clock className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Please select a date first</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((time) => {
                const isAvailable = getTimeSlotAvailability(bookingData.date, time);
                return (
                  <button
                    key={time}
                    onClick={() => isAvailable && setBookingData({...bookingData, time})}
                    disabled={!isAvailable}
                    className={`p-3 rounded-lg border text-sm font-medium transition duration-200 ${
                      bookingData.time === time
                        ? 'bg-blue-500 text-white border-blue-500'
                        : isAvailable
                        ? 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div>
                      {time}
                      {!isAvailable && (
                        <div className="text-xs text-red-500 mt-1">Unavailable</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          
          {bookingData.date && (
            <div className="mt-3 flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                <span className="text-gray-600">Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded"></div>
                <span className="text-gray-600">Unavailable</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 flex justify-end">
        <button
          onClick={handleDateTimeNext}
          disabled={!bookingData.date || !bookingData.time}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const StoreStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Store Location</h2>
      
      <div className="space-y-4">
        {stores.map((store) => (
          <div
            key={store.id}
            onClick={() => store.isOpen && setBookingData({...bookingData, store})}
            className={`p-4 rounded-lg border-2 cursor-pointer transition duration-200 ${
              bookingData.store?.id === store.id
                ? 'border-blue-500 bg-blue-50'
                : store.isOpen
                ? 'border-gray-200 hover:border-blue-300'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-semibold text-gray-900">{store.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    store.isOpen 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {store.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{store.address}</p>
                <p className="text-sm text-gray-500 mt-1">{store.distance} away</p>
              </div>
              <MapPin className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(1)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={handleStoreNext}
          disabled={!bookingData.store}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const StaffStep = () => (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Staff Member</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {staff.map((member) => (
          <div
            key={member.id}
            onClick={() => member.isAvailable && setBookingData({...bookingData, staff: member})}
            className={`p-4 rounded-lg border-2 cursor-pointer transition duration-200 ${
              bookingData.staff?.id === member.id
                ? 'border-blue-500 bg-blue-50'
                : member.isAvailable
                ? 'border-gray-200 hover:border-blue-300'
                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center space-x-4">
              <img
                src={member.avatar}
                alt={member.name}
                className="w-16 h-16 rounded-full object-cover"
              />
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900">{member.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.isAvailable 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {member.isAvailable ? 'Available' : 'Busy'}
                  </span>
                </div>
                <p className="text-gray-600 text-sm">{member.role}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center">
                    {renderStars(member.rating)}
                  </div>
                  <span className="text-sm text-gray-500">{member.rating}</span>
                  <span className="text-sm text-gray-500">•</span>
                  <span className="text-sm text-gray-500">{member.experience}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setCurrentStep(2)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={handleStaffNext}
          disabled={!bookingData.staff}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
        >
          Continue
        </button>
      </div>
    </div>
  );

  const MpesaPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">M-Pesa Payment</h3>
          <button
            onClick={() => setShowMpesaPopup(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Amount to Pay</span>
            </div>
            <p className="text-2xl font-bold text-green-600 mt-2">${platformFee.toFixed(2)}</p>
          </div>
          
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Enter your M-Pesa phone number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="e.g. 0712345678"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowMpesaPopup(false)}
            className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleMpesaPayment}
            disabled={phoneNumber.length < 10}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition duration-200"
          >
            Complete Payment
          </button>
        </div>
      </div>
    </div>
  );

  const CompleteBookingStep = () => (
    <div className="space-y-6">
      {/* Booking Summary */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Booking Summary</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Selected Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Date & Time</p>
                <p className="text-gray-600">{bookingData.date} at {bookingData.time}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Store Location</p>
                <p className="text-gray-600">{bookingData.store?.name}</p>
                <p className="text-sm text-gray-500">{bookingData.store?.address}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-medium">Staff Member</p>
                <p className="text-gray-600">{bookingData.staff?.name}</p>
                <p className="text-sm text-gray-500">{bookingData.staff?.role}</p>
              </div>
            </div>
          </div>
          
          {/* Offer Details */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex space-x-4">
              <img
                src={offerDetails.image}
                alt={offerDetails.title}
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{offerDetails.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{offerDetails.description}</p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-lg font-bold text-green-600">{offerDetails.offerPrice}</span>
                  <span className="text-sm text-gray-500 line-through">{offerDetails.originalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Payment Method</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div 
            className="border-2 border-gray-200 rounded-lg p-4 hover:border-green-300 cursor-pointer transition duration-200"
            onClick={() => setShowMpesaPopup(true)}
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-medium">M-Pesa</h4>
                <p className="text-sm text-gray-600">Pay with mobile money</p>
              </div>
            </div>
          </div>
          
          <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 cursor-not-allowed">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-6 h-6 text-gray-400" />
              <div>
                <h4 className="font-medium text-gray-500">Card Payment</h4>
                <p className="text-sm text-gray-500">Coming soon</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t pt-6">
          <div className="space-y-3">
            <div className="flex justify-between font-bold text-lg">
              <span>Platform Access Fee</span>
              <span>${platformFee.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Important Notice:</strong> This fee grants you access to this exclusive offer. 
                  You will pay the discounted service price of <strong>{offerDetails.offerPrice}</strong> 
                  (instead of {offerDetails.originalPrice}) when you arrive for your service appointment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={() => setCurrentStep(3)}
          className="bg-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-400 transition duration-200"
        >
          Back
        </button>
        <button
          onClick={() => setShowMpesaPopup(true)}
          className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition duration-200"
        >
          Proceed to Payment - ${platformFee.toFixed(2)}
        </button>
      </div>

      {/* M-Pesa Popup */}
      {showMpesaPopup && <MpesaPopup />}
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <DateTimeStep />;
      case 2:
        return <StoreStep />;
      case 3:
        return <StaffStep />;
      case 4:
        return <CompleteBookingStep />;
      default:
        return <DateTimeStep />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Booking</h1>
          <p className="text-gray-600">Follow the steps below to secure your reservation</p>
        </div>
        
        <StepTracker />
        {renderCurrentStep()}
      </div>

      <Footer />
    </div>
  );
};

export default BookingPage;