import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { CheckCircleIcon, PlusCircleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/context/AuthContext';
import { getCookie } from '../utils/cookieUtils';
import toast from 'react-hot-toast';

const Calendar = ({ serviceId, shopId }) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [slots, setSlots] = useState([]);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth();

    useEffect(() => {
        if (startDate && endDate) {
            const fetchSlots = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_BASE_URL}/api/v1/shops/${shopId}/services/${serviceId}/available-slots`,
                        { params: { start_date: format(startDate, 'yyyy-MM-dd'), end_date: format(endDate, 'yyyy-MM-dd') } }
                    );
                    setSlots(response.data);
                    setError(null);
                } catch (error) {
                    if (axios.isAxiosError(error) && error.response) {
                        setError(error.response.data.error || 'An unexpected error occurred');
                    } else {
                        setError('An unexpected error occurred');
                    }
                }
            };
            fetchSlots();
        }
    }, [startDate, endDate, serviceId, shopId]);

    const handleAppointment = async () => {
        if (startDate && selectedSlot) {
            const [startDateStr, startTimeStr] = selectedSlot.split(':').map(part => part.trim());
            const appointmentDateTimeStart = `${startDateStr}T${startTimeStr}:00`;

            const now = new Date();
            const appointmentDateTimeStartObj = new Date(appointmentDateTimeStart);
            if (appointmentDateTimeStartObj <= now) {
                toast.error('The appointment time must be a future date and time.');
                return;
            }

            if (!user) {
                navigate('/accounts/sign-in')
            }

            setLoading(true);
            const token = getCookie('access_token')
            try {
                await axios.post(
                    '${process.env.REACT_APP_API_BASE_URL}/api/v1/appointments',
                    {
                        service_id: serviceId,
                        appointment_time: appointmentDateTimeStart,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                navigate('/my-bookings');
                window.location.reload();
            } catch (error) {
                console.error('Error creating appointment:', error);
                toast.error('Failed. Please try again.');
            } finally {
                setLoading(false);
            }
        }
    };

    const formatSlot = (startDate, startTime) => {
        const start = new Date(`${startDate} ${startTime}`);
        return `${format(start, 'yyyy-MM-dd')}:${format(start, 'HH:mm:ss')}`;
    };

    const groupSlotsByDate = (slots) => {
        const grouped = {};

        slots.forEach(slot => {
            const key = formatSlot(slot.start_date, slot.start_time);
            if (!grouped[slot.start_date]) {
                grouped[slot.start_date] = [];
            }
            grouped[slot.start_date].push(key);
        });

        return grouped;
    };

    const groupedSlots = groupSlotsByDate(slots);

    return (
        <div className="relative">
            <h1 className="text-[20px] font-medium text-gray-700 mb-4 text-center border-b border-gray-200">Appointment Scheduler</h1>
            <p>Select a start date and an end date for your booking range</p>
            <div className="flex space-x-4 mb-4">
                <DatePicker
                    selected={startDate}
                    onChange={(date) => setStartDate(date)}
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    className="p-2 border rounded w-full"
                    placeholderText="Select start date"
                    portalId="datepicker-portal"
                />
                <DatePicker
                    selected={endDate}
                    onChange={(date) => setEndDate(date)}
                    dateFormat="yyyy-MM-dd"
                    minDate={startDate ? startDate : new Date()}
                    className="p-2 border rounded w-full"
                    placeholderText="Select end date"
                    portalId="datepicker-portal"
                />
            </div>
            {error && (
                <p className="text-red-500 mb-4">{error}</p>
            )}
            {Object.keys(groupedSlots).length > 0 && !error ? (
                <div>
                    <h2 className="text-[17px] font-medium mb-2 text-gray-700 border-t border-gray-300 pt-4">Available Slots</h2>
                    {Object.keys(groupedSlots).map(date => (
                        <div key={date} className="mb-4">
                            <h3 className="text-[16px] font-medium text-gray-700">{format(new Date(date), 'd MMM yyyy')}</h3>
                            <ul className="space-y-2">
                                {groupedSlots[date].map((slot, index) => (
                                    <li
                                        key={index}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`flex items-center p-3 border rounded cursor-pointer hover:bg-gray-200 ${selectedSlot === slot ? 'bg-gray-50 border-green-200' : ''}`}
                                    >
                                        <span className={`flex-1 ${selectedSlot === slot ? 'font-semibold' : ''}`}>
                                            {slot}
                                        </span>
                                        {selectedSlot === slot ? (
                                            <CheckCircleIcon className="w-6 h-6 text-green-600" />
                                        ) : (
                                            <PlusCircleIcon className="w-6 h-6 text-gray-500" />
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                    <button
                        onClick={handleAppointment}
                        className="w-full py-2 bg-primary rounded-md text-white capitalize text-[14px] flex items-center justify-center mb-2 mt-4"
                        disabled={loading}
                    >
                        {loading ? 'Scheduling...' : 'Schedule Appointment'}
                    </button>
                </div>
            ) : !error ? (
                <p className="mt-4 text-gray-600 text-center">No available slots for the selected date range.</p>
            ) : null}
        </div>
    );
};

export default Calendar;
