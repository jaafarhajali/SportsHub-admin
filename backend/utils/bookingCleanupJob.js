const Booking = require("../models/bookingModel");
const Stadium = require("../models/stadiumModel");
const logger = require("./logger");

logger.info("bookingCleanupJob loaded");

setInterval(async () => {
  try {
    const now = new Date();

    const bookings = await Booking.find({ status: "approved" });
    let updatedCount = 0;

    for (const booking of bookings) {
      const stadium = await Stadium.findById(booking.stadiumId);
      if (!stadium) {
        logger.debug("Stadium not found for booking", { bookingId: booking._id });
        continue;
      }

      const calendarEntry = stadium.calendar.find(
        (entry) => new Date(entry.date).toDateString() === new Date(booking.matchDate).toDateString()
      );
      if (!calendarEntry) {
        logger.debug("No calendar entry for booking", { bookingId: booking._id });
        continue;
      }

      const slot = calendarEntry.slots.find((s) => s.bookingId?.toString() === booking._id.toString());
      if (!slot) {
        logger.debug("Slot not found for booking", { bookingId: booking._id });
        continue;
      }

      if (!slot.endTime) {
        logger.debug("Slot has no endTime", { bookingId: booking._id });
        continue;
      }

      const [hour, minute] = slot.endTime.split(":").map(Number);
      const endDateTime = new Date(booking.matchDate);
      endDateTime.setHours(hour, minute, 0, 0);

      if (now > endDateTime) {
        booking.status = "completed";
        await booking.save({ validateBeforeSave: false });
        updatedCount++;
      }
    }

    if (updatedCount > 0) {
      logger.info("Bookings marked completed", { updatedCount });
    }
  } catch (err) {
    logger.error("Error updating completed bookings", { error: err.message });
  }
}, 90 * 60 * 1000);
