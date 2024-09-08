import React, { useEffect, useState } from 'react';
import { FiLoader } from 'react-icons/fi';
import { fetchUserPayments } from '../utils/api/api';
import Navbar from '../components/Navbar';

const MyVouchers = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const getPayments = async () => {
            setLoading(true);
            setError(null);
            try {
                const paymentsData = await fetchUserPayments();
                setPayments(paymentsData);
            } catch (error) {
                console.error('Error fetching payments:', error);
                setError('Error fetching Vouchers. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        getPayments();
    }, []);

    return (
        <div>
            <Navbar />
            <div className="w-full bg-gray-50 px-[5%] py-6 min-h-screen">
                <h1 className="text-[24px] font-medium capitalize text-gray-800 mb-2">My Vouchers</h1>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <FiLoader className="animate-spin text-4xl text-gray-600" />
                    </div>
                ) : error ? (
                    <div className="flex justify-center items-center">
                        <p className="text-red-500 text-xl">{error}</p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="flex justify-center items-center">
                        <p className="text-gray-600 text-xl">No vouchers found. Browse to get some.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {payments.map((payment) => (
                            <div
                                key={payment.id}
                                className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-transform duration-200 transform hover:-translate-y-2 ${payment.used ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                                    }`}
                                onClick={() =>
                                    !payment.used && (window.location.href = `/offers/${payment.discount_id}/booking`)
                                }
                            >
                                <h2 className="text-lg font-semibold text-gray-900">{payment.discount_name}</h2>
                                <p className="text-sm text-gray-500 mt-2">Bought on: {new Date(payment.payment_date).toLocaleDateString()}</p>
                                <p className="text-sm text-gray-500">Amount: {payment.amount} KES</p>
                                <p className="text-sm text-gray-500">Phone: {payment.phone}</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <p className={`text-${payment.used ? 'red' : 'green'}-500 font-bold`}>
                                        {payment.used ? 'Used' : 'Book Now'}
                                    </p>
                                    <span className="bg-primary text-white text-sm px-3 py-1 rounded-full">
                                        Code: {payment.code}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyVouchers;
