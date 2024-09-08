import React from 'react';

const PaymentLoaderModal = ({ onClose, paymentStatus }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white p-6 rounded-md shadow-md max-w-md w-full">
                <h2 className="text-xl font-bold mb-4">Processing Payment</h2>
                <p className={`text-gray-600 mb-4 ${paymentStatus === 'failed' ? 'hidden' : ''} `}>Please wait while we process your payment... <span className="text-primary text-[14px]">Do not refresh this page</span></p>

                {paymentStatus === 'pending' && (
                    <div className="flex flex-col w-full gap-2 justify-center mb-4">
                        <p className="text-center text-gray-500 text-[14px]">We have sent you an Push to the phone number you provided. Input your pin to complete the transaction.</p>
                        <div className="animate-spin rounded-full mx-auto h-10 w-10 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
                )}

                {paymentStatus === 'failed' && (
                    <div className="flex flex-col items-center mb-4">
                        <svg
                            className="w-12 h-12 text-red-500 border-[2px] rounded-full border-primary p-2 animate-pulse"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                        <p className="text-red-500 text-center mt-2">Sorry, we could not process your payment. Please try again.</p>
                    </div>
                )}

                {paymentStatus === 'complete' && (
                    <div className="flex flex-col items-center mb-4">
                        <svg
                            className="w-12 h-12 text-green-500 border-[2px] rounded-full border-green-500 p-2 animate-bounce"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                        <p className="text-green-500 text-center mt-2">You Payment was successful!</p>
                    </div>
                )}

                <button
                    onClick={() => window.location.reload()}
                    className="mt-4 bg-primary text-white px-4 py-2 rounded-md font-medium"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default PaymentLoaderModal;
