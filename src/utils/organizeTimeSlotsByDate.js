export const organizeTimeSlotsByDate = (timeSlots) => {
  return timeSlots.reduce((acc, slot) => {
    const date = slot.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(slot);
    return acc;
  }, {});
};
