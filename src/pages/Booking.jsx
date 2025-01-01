import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import PaymentCodeModal from '../elements/PaymentCodeModal';
import MiniCalendar from '../elements/MiniCalendar';
import Navbar from '../components/Navbar';
import TimeSlotModal from '../elements/TimeSlotModal';
import { getCookie } from '../utils/cookieUtils';
import { useAuth } from '../utils/context/AuthContext';
import Loading from '../elements/Loading';
import toast from 'react-hot-toast';


const Booking = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [showTimeSlotModal, setShowTimeSlotModal] = useState(false);
    const [showPaymentCodeModal, setShowPaymentCodeModal] = useState(false);
    const [payments, setPayments] = useState([]);
    const { user } = useAuth();
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTimeSlots = async () => {
            try {
                const response = await axios.get(`https://api.discoun3ree.com/api/time-slots/discount/${id}`);
                setTimeSlots(response.data.time_slots);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch time slots');
                setLoading(false);
            }
        };

        fetchTimeSlots();
    }, [id]);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const accessToken = getCookie('access_token');
                if (!accessToken) {
                    console.error('Access token not found in localStorage');
                    return;
                }

                const response = await axios.get(`https://api.discoun3ree.com/api/payments/user/${user?.id}/discount/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                setPayments(response.data.payments);
                console.log(payments);
            } catch (err) {
                console.error('Failed to fetch payments', err);
            }
        };

        if (user?.first_discount !== 0) {
            fetchPayments();
        }
    }, [user]);

    const handleBooking = async (slotId, paymentCode = null) => {
        try {
            const accessToken = getCookie('access_token');
            const requestBody = {
                time_slot_id: slotId,
                code: paymentCode,
            };

            const apiUrl = `https://api.discoun3ree.com/api/discounts/${id}/bookings`;

            const response = await axios.post(apiUrl, requestBody, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            toast('Booking Successful!');
            navigate('/my-bookings');
        } catch (error) {
            toast.error('An error occurred.');
        }
    };

    const handleSelectSlot = (slot) => {
        setSelectedSlot(slot);

        if (user?.first_discount !== 0) {
            setShowPaymentCodeModal(true);
        } else {
            handleBooking(slot.id);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    return (
        <>
            <Navbar />
            <div className="py-8">
                <MiniCalendar timeSlots={timeSlots} onSelectSlot={handleSelectSlot} />

                {showTimeSlotModal && selectedSlot && (
                    <TimeSlotModal
                        date={selectedSlot.date}
                        timeSlots={timeSlots.filter(slot => slot.date === selectedSlot.date)}
                        onClose={() => setShowTimeSlotModal(false)}
                        onSelectSlot={(slot) => handleBooking(slot.id)}
                    />
                )}

                {showPaymentCodeModal && (
                    <PaymentCodeModal
                        payments={payments}
                        onClose={() => setShowPaymentCodeModal(false)}
                        onBook={(paymentCode) => {
                            if (selectedSlot) {
                                handleBooking(selectedSlot.id, paymentCode);
                            }
                        }}
                    />
                )}
            </div>
            {/* <Footer /> */}
        </>
    );
};

export default Booking;
