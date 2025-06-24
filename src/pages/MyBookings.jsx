import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/context/AuthContext';
import { getCookie } from '../utils/cookieUtils';
import Navbar from '../components/Navbar';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [activeTab, setActiveTab] = useState('bookings');
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const accessToken = getCookie('access_token');
                if (!accessToken) {
                    console.error('Access token not found in localStorage');
                    return;
                }

                const [bookingsResponse, appointmentsResponse] = await Promise.all([
                    axios.get(`http://localhost:4000/api/v1/bookings/user`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }),
                    axios.get(`http://localhost:4000/api/v1/user/appointments`, {
                        headers: { Authorization: `Bearer ${accessToken}` },
                    }),
                ]);

                setBookings(bookingsResponse.data);
                setAppointments(appointmentsResponse.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch data');
                setLoading(false);
            }
        };

        if (user) {
            fetchData();
        }
    }, [user]);

    const handleRowClick = (item, type) => {
        if (type === 'booking') {
            setSelectedBooking(item);
        } else {
            setSelectedAppointment(item);
        }
    };

    const handleCloseModal = () => {
        setSelectedBooking(null);
        setSelectedAppointment(null);
    };

    const formatDateTime = (start, end) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const date = startDate.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
        const startTime = startDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true });
        const endTime = endDate.toLocaleTimeString(undefined, { hour: 'numeric', minute: 'numeric', hour12: true });
        return `${date}, ${startTime} - ${endTime}`;
    };

    if (loading) {
        return '';
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <>
            <Navbar />
            <div className="px-[5%] py-6 bg-white">
                <div className="flex mb-4 border-b border-gray-200 gap-6">
                    <button onClick={() => setActiveTab('bookings')} className={`pb-2 transition duration-200 ease-in ${activeTab === 'bookings' ? 'text-primary font-semibold border-b-[3px] border-primary' : 'text-gray-600 hover:text-primary'}`}>
                        Offers
                    </button>
                    <button onClick={() => setActiveTab('appointments')} className={`pb-2 transition duration-200 ease-in ${activeTab === 'appointments' ? 'text-primary font-semibold border-b-[3px] border-primary' : 'text-gray-600 hover:text-primary'}`}>
                        Appointments
                    </button>
                </div>

                {activeTab === 'bookings' ? (
                    bookings?.length === 0 ? (
                        <div className="text-gray-600 text-center">You have no bookings.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bookings.map((booking) => (
                                <div key={booking.id} className="bg-white border border-gray-100 p-4 shadow rounded-lg hover:shadow-lg transition cursor-pointer" onClick={() => handleRowClick(booking, 'booking')}>
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-[18px] font-medium text-gray-800">Voucher: <span className="text-black text-[20px]">{booking.code}</span></h4>
                                        <span className={`px-2 py-1 text-sm rounded ${booking.approved ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                                            {booking.approved ? 'Fulfilled' : 'Pending'}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-[14px] w-full flex items-center border-b border-gray-200 mb-2 justify-between">Offer: <span className="text-black">{booking.discount_name}</span></p>
                                    <p className="text-gray-600 text-[14px] w-full flex items-center border-b border-gray-200 mb-2 justify-between">Merchant: <span className="text-black">{booking.shop_name}</span></p>
                                    <p className="text-gray-600 text-[14px] w-full flex items-center border-b border-gray-200 mb-2 justify-between">Date: <span className="text-black">{new Date(booking.time_slot_start).toLocaleDateString()}</span></p>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    appointments?.length === 0 ? (
                        <div className="text-gray-600 text-center">You have no appointments.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {appointments.map((appointment) => (
                                <div key={appointment.id} className="bg-white p-4 shadow rounded-lg hover:shadow-lg transition cursor-pointer" onClick={() => handleRowClick(appointment, 'appointment')}>
                                    <h4 className="text-lg font-semibold text-gray-800">Service: {appointment.service_name}</h4>
                                    <p className="text-gray-600">Shop: {appointment.shop_name}</p>
                                    <p className="text-gray-600">Date: {new Date(appointment.appointment_time).toLocaleDateString()}</p>
                                    <p className={`text-gray-600`}>
                                        Time: {new Date(appointment.appointment_time).toLocaleTimeString()}
                                    </p>
                                    <span className={`px-2 py-1 text-sm rounded ${appointment.status === 'pending' ? 'bg-yellow-100 text-yellow-500' : 'bg-green-100 text-green-500'}`}>
                                        {appointment.status === 'pending' ? 'Pending' : 'Completed'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {selectedBooking && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                            <button onClick={handleCloseModal} className="absolute top-2 right-2 bg-gray-100 p-1 rounded-full hover:bg-gray-300">
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                            <h2 className="text-2xl font-semibold mb-4 text-center text-primary">Booking Details</h2>
                            <div className="space-y-2">
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600">
                                    <span>Code</span> {selectedBooking.code}
                                </p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600">
                                    <span>Discount</span> {selectedBooking.discount_name}
                                </p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600">
                                    <span>Shop</span> {selectedBooking.shop_name}
                                </p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600">
                                    <span>Time Slot</span> {formatDateTime(selectedBooking.time_slot_start, selectedBooking.time_slot_end)}
                                </p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600">
                                    <span>Fulfilled</span> {selectedBooking.approved ? 'Yes' : 'No'}
                                </p>
                                {selectedBooking.qr_code_url && (
                                    <div className="text-center">
                                        <img src={selectedBooking.qr_code_url} alt="QR Code" className="mx-auto my-4" style={{ maxWidth: '150px', maxHeight: '150px' }} />
                                    </div>
                                )}
                            </div>
                            <p className="text-center text-[13px] font-light text-gray-600 my-2">
                                {selectedBooking.approved ? (
                                    "Thank You, we hope you enjoyed the service. Take a moment and submit a review about this service."
                                ) : (
                                    "After your service is fulfilled, provide this code to the service provider to mark it as fulfilled. Keep it safe."
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {selectedAppointment && (
                    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                        <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
                            <button onClick={handleCloseModal} className="absolute top-2 right-2 bg-gray-100 p-1 rounded-full hover:bg-gray-300">
                                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                            <h2 className="text-2xl font-semibold mb-4 text-center text-primary">Appointment Details</h2>
                            <div className="space-y-2">
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600"><span>Service</span> {selectedAppointment.service_name}</p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600"><span>Shop</span> {selectedAppointment.shop_name}</p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600"><span>Date</span> {new Date(selectedAppointment.appointment_time).toLocaleDateString()}</p>
                                <p className="flex justify-between border-b border-gray-100 py-1 text-gray-600"><span>Time</span> {new Date(selectedAppointment.appointment_time).toLocaleTimeString()}</p>
                            </div>
                            <p className="text-center text-[13px] font-light text-gray-600 my-2">Please make sure to arrive on time for your appointment.</p>
                        </div>
                    </div>
                )}
            </div>
        </>

    );
};

export default MyBookings;
