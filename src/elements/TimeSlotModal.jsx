import React from 'react';
import { format } from 'date-fns';

const TimeSlotModal = ({ date, timeSlots, onClose, onSelectSlot }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-800 bg-opacity-50">
            <div className="bg-white rounded-md shadow-md max-h-[90vh] overflow-y-auto w-full max-w-lg">
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4 text-center">Available Time Slots</h2>
                    <h3 className="text-lg font-semibold mb-2">{format(new Date(date), 'EEEE, MMMM d, yyyy')}</h3>
                    <div className="space-y-4">
                        {timeSlots.map(slot => (
                            <button
                                key={slot.id}
                                className={`flex items-center justify-between px-4 py-3 border rounded-md w-full ${slot.booked ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:outline-none'}`}
                                onClick={() => !slot.booked && onSelectSlot(slot)}
                                disabled={slot.booked}
                            >
                                <div className="flex justify-start">
                                    {format(new Date(slot.start_time), 'HH:mm')} - {format(new Date(slot.end_time), 'HH:mm')}
                                </div>
                                <div className="ml-2">{slot.booked ? 'Booked' : 'Available'}</div>
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={onClose}
                        className="mt-6 w-full bg-gray-200 text-gray-800 hover:bg-gray-300 py-3 rounded-md font-medium focus:outline-none"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TimeSlotModal;
