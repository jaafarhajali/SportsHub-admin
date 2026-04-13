console.log("✅ bookingCleanupJob.js loaded");
const Booking = require("../models/bookingModel");
const Stadium = require("../models/stadiumModel");

setInterval(async () => {
  try {
    const now = new Date();

    const bookings = await Booking.find({ status: "approved" });
    let updatedCount = 0;

    for (const booking of bookings) {
      const stadium = await Stadium.findById(booking.stadiumId);
      if (!stadium) {
        console.log(`Stadium not found for booking ${booking._id}`);
        continue;
      }

      const calendarEntry = stadium.calendar.find(
        (entry) => new Date(entry.date).toDateString() === new Date(booking.matchDate).toDateString()
      );
      if (!calendarEntry) {
        console.log(`No calendar entry for booking ${booking._id}`);
        continue;
      }

      const slot = calendarEntry.slots.find((s) => s.bookingId?.toString() === booking._id.toString());
      if (!slot) {
        console.log(`Slot not found for booking ${booking._id}`);
        continue;
      }

      if (!slot.endTime) {
        console.log(`Slot for booking ${booking._id} has no endTime`);
        continue;
      }

      const [hour, minute] = slot.endTime.split(":").map(Number);
      const endDateTime = new Date(booking.matchDate);
      endDateTime.setHours(hour, minute, 0, 0);

      if (now > endDateTime) {
        console.log(`Booking ${booking._id} is overdue. Marking as completed`);
        booking.status = "completed";
        await booking.save({ validateBeforeSave: false });
        updatedCount++;
      }
    }

    console.log(`${updatedCount} bookings marked as completed.`);
  } catch (err) {
    console.error("Error updating completed bookings:", err.message);
  }
}, 90 * 60 * 1000);
