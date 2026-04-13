// utils/generateSlots.js

function generateSlots(startTimeStr, endTimeStr) {
  const slots = [];

  function timeStrToMinutes(timeStr) {
    const [h, m] = timeStr.split(":").map(Number);
    return h * 60 + m;
  }

  function minutesToTimeStr(minutes) {
    const h = Math.floor(minutes / 60) % 24;
    const m = minutes % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  }

  let startMinutes = timeStrToMinutes(startTimeStr);
  const endMinutes = timeStrToMinutes(endTimeStr);

  // Handle overnight end time (e.g., end="00:00")
  const normalizedEndMinutes = endMinutes <= startMinutes ? endMinutes + 24 * 60 : endMinutes;

  while (startMinutes + 90 <= normalizedEndMinutes) {
    const slotStart = minutesToTimeStr(startMinutes % (24 * 60));
    const slotEnd = minutesToTimeStr((startMinutes + 90) % (24 * 60));

    slots.push({
      startTime: slotStart,
      endTime: slotEnd,
      isBooked: false,
      bookingId: null,
    });

    startMinutes += 90;
  }

  return slots;
}

module.exports = generateSlots;
