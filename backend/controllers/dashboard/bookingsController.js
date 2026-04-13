const Booking = require("../../models/bookingModel");
const Stadium = require("../../models/stadiumModel");
const User = require("../../models/userModel");

const mongoose = require("mongoose");

// 🟡 GET all bookings
exports.getAllBookings = async (req, res) => {
  try {
    // Fetch all bookings with populated user and stadium
    const bookings = await Booking.find()
      .populate("userId", "username email")
      .populate("stadiumId", "name location penaltyPolicy") // include penaltyPolicy
      .sort({ matchDate: -1 })
      .lean(); // use lean so we can add fields

    // Add penaltyAmount to bookings that have penaltyApplied = true
    const enhancedBookings = bookings.map((booking) => {
      if (booking.penaltyApplied && booking.stadiumId?.penaltyPolicy) {
        return {
          ...booking,
          penaltyAmount: booking.stadiumId.penaltyPolicy.penaltyAmount,
        };
      }
      return booking;
    });

    res.status(200).json({
      success: true,
      count: enhancedBookings.length,
      data: enhancedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { stadiumId, userId, matchDate, timeSlot } = req.body;

    if (!stadiumId || !userId || !matchDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "stadiumId, userId, matchDate, and timeSlot are required",
      });
    }

    const stadium = await Stadium.findById(stadiumId);
    if (!stadium) {
      return res.status(404).json({ success: false, message: "Stadium not found" });
    }

    const now = new Date();
    const bookingDate = new Date(matchDate);
    bookingDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ success: false, message: "Cannot book for a past date" });
    }

    const calendarEntry = stadium.calendar.find((entry) => new Date(entry.date).getTime() === bookingDate.getTime());

    if (!calendarEntry) {
      return res.status(400).json({ success: false, message: "No available slots for this date" });
    }

    const slot = calendarEntry.slots.find((s) => s.startTime === timeSlot);
    if (!slot) {
      return res.status(400).json({ success: false, message: "Time slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: "Slot is already booked" });
    }

    const [hour, minute] = slot.startTime.split(":").map(Number);
    const slotDateTime = new Date(matchDate);
    slotDateTime.setHours(hour, minute, 0, 0);

    if (slotDateTime <= now) {
      return res.status(400).json({
        success: false,
        message: "Cannot book a slot that has already started or passed",
      });
    }

    const BOOKING_PRICE = stadium.pricePerMatch;

    // 🏟 Create booking for the selected user
    const newBooking = await Booking.create({
      userId,
      stadiumId,
      matchDate: new Date(matchDate),
      timeSlot,
      price: BOOKING_PRICE,
    });

    slot.isBooked = true;
    slot.bookingId = newBooking._id;
    await stadium.save();

    const populatedBooking = await Booking.findById(newBooking._id)
      .populate("userId", "username email")
      .populate("stadiumId", "name location");

    res.status(201).json({
      success: true,
      message: "Booking created by admin successfully",
      data: populatedBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin booking failed",
      error: error.message,
    });
  }
};

exports.updateBooking = async (req, res) => {
  try {
    const { stadiumId, userId, matchDate, timeSlot } = req.body;
    const bookingId = req.params.id;

    if (!stadiumId || !userId || !matchDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "stadiumId, userId, matchDate, and timeSlot are required",
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    // 🟡 Step 1: Unbook old slot
    const oldStadium = await Stadium.findById(booking.stadiumId);
    if (oldStadium) {
      const oldDate = new Date(booking.matchDate);
      oldDate.setHours(0, 0, 0, 0);

      const oldEntry = oldStadium.calendar.find((entry) => new Date(entry.date).getTime() === oldDate.getTime());

      if (oldEntry) {
        const oldSlot = oldEntry.slots.find((s) => s.startTime === booking.timeSlot);
        if (oldSlot) {
          oldSlot.isBooked = false;
          oldSlot.bookingId = null;
          await oldStadium.save();
        }
      }
    }

    // 🟢 Step 2: Book new slot
    const newStadium = await Stadium.findById(stadiumId);
    if (!newStadium) {
      return res.status(404).json({ success: false, message: "New stadium not found" });
    }

    const bookingDate = new Date(matchDate);
    const today = new Date();
    bookingDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (bookingDate < today) {
      return res.status(400).json({ success: false, message: "Cannot book for a past date" });
    }

    const calendarEntry = newStadium.calendar.find((entry) => new Date(entry.date).getTime() === bookingDate.getTime());

    if (!calendarEntry) {
      return res.status(400).json({ success: false, message: "No available slots for this date" });
    }

    const slot = calendarEntry.slots.find((s) => s.startTime === timeSlot);
    if (!slot) {
      return res.status(400).json({ success: false, message: "Time slot not found" });
    }

    if (slot.isBooked) {
      return res.status(400).json({ success: false, message: "Slot is already booked" });
    }

    const [hour, minute] = timeSlot.split(":").map(Number);
    const slotDateTime = new Date(matchDate);
    slotDateTime.setHours(hour, minute, 0, 0);
    if (slotDateTime <= new Date()) {
      return res.status(400).json({ success: false, message: "Slot has already started or passed" });
    }

    const BOOKING_PRICE = newStadium.pricePerMatch;

    // Update booking document
    booking.stadiumId = stadiumId;
    booking.userId = userId;
    booking.matchDate = new Date(matchDate);
    booking.timeSlot = timeSlot;
    booking.price = BOOKING_PRICE;
    await booking.save();

    // Mark the new slot as booked
    slot.isBooked = true;
    slot.bookingId = booking._id;
    await newStadium.save();

    const populatedUpdated = await Booking.findById(booking._id)
      .populate("userId", "username email")
      .populate("stadiumId", "name location");

    res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      data: populatedUpdated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking update failed",
      error: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be cancelled",
      });
    }

    const now = new Date();
    const matchDateTime = new Date(booking.matchDate);
    const [hour, minute] = booking.timeSlot.split(":").map(Number);
    matchDateTime.setHours(hour, minute, 0, 0);

    const stadium = await Stadium.findById(booking.stadiumId).populate("ownerId");
    const user = await User.findById(booking.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found for this booking",
      });
    }
    const stadiumOwner = stadium.ownerId;
    if (!stadiumOwner) {
      return res.status(404).json({
        success: false,
        message: "Stadium owner not found",
      });
    }

    let refundMessage = "Booking cancelled without refund";

    if (booking.isPaid) {
      const price = booking.price || stadium.pricePerMatch;
      const penaltyWindow = stadium.penaltyPolicy.hoursBefore;
      const penaltyAmount = stadium.penaltyPolicy.penaltyAmount;
      const hoursBeforeMatch = (matchDateTime - now) / (1000 * 60 * 60);
      const applyPenalty = hoursBeforeMatch < penaltyWindow;

      let refundToUser = price;
      let ownerAdjustment = -price;

      if (applyPenalty) {
        refundToUser = penaltyAmount >= price ? 0 : price - penaltyAmount;
        ownerAdjustment = -price + penaltyAmount;
        refundMessage = `Booking cancelled with penalty of ${penaltyAmount}`;
      } else {
        refundMessage = "Paid booking cancelled and fully refunded";
      }

      user.wallet += refundToUser;
      stadiumOwner.wallet += ownerAdjustment;

      await user.save({ validateBeforeSave: false });
      await stadiumOwner.save({ validateBeforeSave: false });

      booking.penaltyApplied = applyPenalty;
    }

    // Cancel booking
    booking.status = "cancelled";
    await booking.save();

    // Free the slot from the calendar
    const bookingDate = new Date(booking.matchDate);
    bookingDate.setHours(0, 0, 0, 0);

    const calendarEntry = stadium.calendar.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === bookingDate.getTime();
    });

    if (calendarEntry) {
      const slot = calendarEntry.slots.find((s) => s.bookingId?.toString() === booking._id.toString());
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
      }
      await stadium.save();
    }

    res.status(200).json({
      success: true,
      message: refundMessage,
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel booking",
      error: error.message,
    });
  }
};

exports.getBookingsByOwner = async (req, res) => {
  try {
    const ownerId = req.user.id; // or req.params.ownerId if passed in params

    // Find all stadiums that belong to this owner
    const stadiums = await Stadium.find({ ownerId }).select("_id");

    const stadiumIds = stadiums.map((stadium) => stadium._id);

    // Fetch all bookings where stadiumId is in stadiumIds
    const bookings = await Booking.find({ stadiumId: { $in: stadiumIds } })
      .populate("userId", "username email")
      .populate("stadiumId", "name location")
      .sort({ createdAt: -1 })
      .lean();

    const enhancedBookings = bookings.map((booking) => {
      if (booking.penaltyApplied && booking.stadiumId?.penaltyPolicy) {
        return {
          ...booking,
          penaltyAmount: booking.stadiumId.penaltyPolicy.penaltyAmount,
        };
      }
      return booking;
    });

    res.status(200).json({
      success: true,
      count: enhancedBookings.length,
      data: enhancedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings for owner",
      error: error.message,
    });
  }
};
