import React, { useState } from 'react';

const PaymentCodeModal = ({ payments, onClose, onBook }) => {
    const [selectedPaymentCode, setSelectedPaymentCode] = useState(null);

    const handleBookClick = () => {
        if (selectedPaymentCode) {
            onBook(selectedPaymentCode);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-bold mb-4 text-center">Select Voucher Code</h2>

                {payments.length === 0 && (
                    <div className="text-center font-light text-[14px] text-gray-600 mb-4">
                        No Voucher codes available. Please purchase one to continue.
                    </div>
                )}

                <div className="space-y-2">
                    {payments.map((payment) => (
                        <button
                            key={payment.code}
                            className={`p-3 border rounded-md w-full flex items-center justify-between
                ${selectedPaymentCode === payment.code ? 'border border-primary text-primary' : 'bg-gray-100 text-black'}
                ${payment.used === 1 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200'}
              `}
                            onClick={() => {
                                if (payment.used === 0) {
                                    setSelectedPaymentCode(payment.code);
                                }
                            }}
                            title={payment.used === 1 ? 'Payment code already used' : undefined}
                            disabled={payment.used === 1}
                        >
                            <span>{payment.code}</span>
                            {payment.used === 1 && <span className="text-sm text-gray-600 ml-2">Used</span>}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end mt-4 space-x-2">
                    <button
                        onClick={onClose}
                        className="mr-2 text-primary text-[14px] font-medium "
                    >
                        Close
                    </button>
                    <button
                        onClick={handleBookClick}
                        className={`px-6 py-1.5 rounded-md font-medium ${selectedPaymentCode ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600 cursor-not-allowed'}`}
                        disabled={!selectedPaymentCode || payments.length === 0}
                    >
                        Book Slot
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCodeModal;
