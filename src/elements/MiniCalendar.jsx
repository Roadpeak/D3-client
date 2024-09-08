import React, { useState } from 'react';
import TimeSlotModal from './TimeSlotModal';
import { organizeTimeSlotsByDate } from '../utils/organizeTimeSlotsByDate';

const MiniCalendar = ({ timeSlots, onSelectSlot }) => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const organizedSlots = organizeTimeSlotsByDate(timeSlots);

    const handleDateClick = (date) => {
        setSelectedDate(date);
        setShowModal(true);
    };

    const isPastDate = (date) => {
        const currentDate = new Date();
        const selectedDate = new Date(date);
        return selectedDate < currentDate;
    };

    return (
        <div className="">
            <div className="flex flex-col w-full px-[5%]">
                <p className="pt-1 pb-2 text-gray-600 text-[16px]">To Proceed with your booking, please select a date you want to make the appointment</p>
                <div className="grid grid-cols-3 md:grid-cols-7 gap-4 mb-4">
                    {Object.keys(organizedSlots).map((date) => (
                        <button
                            key={date}
                            className={`p-4 border rounded-md ${isPastDate(date) ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-gray-200 hover:bg-gray-300 focus:outline-none transition duration-300 ease-in-out'}`}
                            onClick={() => !isPastDate(date) && handleDateClick(date)}
                            disabled={isPastDate(date)}
                            title={isPastDate(date) ? 'Past' : ''}
                        >
                            <div className="text-sm font-medium text-gray-800">
                                {new Date(date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </div>
                            <div className="mt-1 text-lg font-semibold italic">
                                {new Date(date).toLocaleDateString(undefined, {
                                    day: 'numeric',
                                })}
                            </div>
                        </button>
                    ))}
                </div>

                {showModal && selectedDate && (
                    <TimeSlotModal
                        date={selectedDate}
                        timeSlots={organizedSlots[selectedDate]}
                        onClose={() => setShowModal(false)}
                        onSelectSlot={onSelectSlot}
                    />
                )}
            </div>
        </div>
    );
};

export default MiniCalendar;
