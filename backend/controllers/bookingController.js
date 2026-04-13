const Booking = require("../models/bookingModel");
const Stadium = require("../models/stadiumModel");
const User = require("../models/userModel");
// const Notification = requrie("../models/notificationModel");
const mongoose = require("mongoose");

exports.bookMatch = async (req, res) => {
  try {
    const { stadiumId, matchDate, timeSlot } = req.body;
    const userId = req.user.id;

    if (!stadiumId || !matchDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        message: "stadiumId, matchDate, and timeSlot are required",
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
      return res.status(400).json({ success: false, message: "You cannot book for a past date" });
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
      return res
        .status(400)
        .json({ success: false, message: "You cannot book a slot that has already started or passed" });
    }

    const BOOKING_PRICE = stadium.pricePerMatch;

    const user = await User.findById(userId);
    if (!user || user.wallet < BOOKING_PRICE) {
      return res.status(400).json({
        success: false,
        message: `Insufficient wallet balance. You need ${BOOKING_PRICE}, but you have ${user.wallet}`,
      });
    }

    // 🧾 Deduct from user
    user.wallet -= BOOKING_PRICE;
    await user.save({ validateBeforeSave: false });

    // 💰 Transfer to stadium owner
    const owner = await User.findById(stadium.ownerId);
    if (owner) {
      owner.wallet += BOOKING_PRICE;
      await owner.save({ validateBeforeSave: false });
    }

    // 🏟 Create booking
    const newBooking = await Booking.create({
      userId,
      stadiumId,
      matchDate: new Date(matchDate),
      timeSlot,
      isPaid: true,
      price: BOOKING_PRICE,
    });

    slot.isBooked = true;
    slot.bookingId = newBooking._id;
    await stadium.save();

    res.status(201).json({
      success: true,
      message: "Booking successful",
      data: newBooking,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Booking failed",
      error: error.message,
    });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }

    if (booking.userId.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "You can only cancel your own bookings" });
    }

    if (booking.status !== "pending" && booking.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved bookings can be cancelled",
      });
    }

    const now = new Date();
    const matchDateTime = new Date(booking.matchDate);
    const [hour, minute] = booking.timeSlot.split(":").map(Number);
    matchDateTime.setHours(hour, minute, 0, 0);

    if (now > matchDateTime) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel past bookings",
      });
    }

    // Check penalty
    const stadium = await Stadium.findById(booking.stadiumId).populate("ownerId");
    const penaltyWindow = stadium.penaltyPolicy.hoursBefore;
    const hoursBeforeMatch = (matchDateTime - now) / (1000 * 60 * 60);
    const applyPenalty = hoursBeforeMatch < penaltyWindow;

    const user = await User.findById(userId);
    const stadiumOwner = await User.findById(stadium.ownerId);

    const penaltyAmount = stadium.penaltyPolicy.penaltyAmount;
    const matchPrice = stadium.pricePerMatch;
    const extraPenalty = Math.max(0, penaltyAmount - matchPrice);

    if (applyPenalty) {
      const refundToUser = penaltyAmount >= matchPrice ? 0 : matchPrice - penaltyAmount;

      user.wallet = user.wallet + refundToUser - extraPenalty;
      stadiumOwner.wallet = stadiumOwner.wallet - matchPrice + penaltyAmount;

      // await Notification.create({
      //   user: user._id,
      //   message: `You were charged a penalty of ${penaltyAmount} for cancelling a booking at ${stadium.name}.`,
      // });
    } else {
      user.wallet += matchPrice;
      stadiumOwner.wallet -= matchPrice;
    }

    await user.save({ validateBeforeSave: false });
    await stadiumOwner.save({ validateBeforeSave: false });

    // Cancel the booking
    booking.status = "cancelled";
    booking.penaltyApplied = applyPenalty;
    await booking.save();

    // Free up the slot
    const dateOnly = new Date(booking.matchDate);
    dateOnly.setHours(0, 0, 0, 0);

    const calendarEntry = stadium.calendar.find((entry) => new Date(entry.date).getTime() === dateOnly.getTime());

    if (calendarEntry) {
      const slot = calendarEntry.slots.find((s) => s.bookingId && s.bookingId.toString() === booking._id.toString());
      if (slot) {
        slot.isBooked = false;
        slot.bookingId = null;
        await stadium.save();
      }
    }

    res.status(200).json({
      success: true,
      message: `Booking cancelled${applyPenalty ? ` with penalty ${stadium.penaltyPolicy.penaltyAmount}` : ""}`,
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

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate({
        path: "stadiumId",
        select: "name location pricePerHour photos penaltyPolicy",
      })
      .populate("refereeId", "username email")
      .sort({ matchDate: -1 });

    // Add penaltyAmount if penaltyApplied is true
    const enrichedBookings = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      if (bookingObj.penaltyApplied && bookingObj.stadiumId?.penaltyPolicy) {
        bookingObj.penaltyAmount = bookingObj.stadiumId.penaltyPolicy.penaltyAmount;
      } else {
        bookingObj.penaltyAmount = 0;
      }
      return bookingObj;
    });

    res.status(200).json({
      success: true,
      count: enrichedBookings.length,
      data: enrichedBookings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch bookings",
      error: error.message,
    });
  }
};
