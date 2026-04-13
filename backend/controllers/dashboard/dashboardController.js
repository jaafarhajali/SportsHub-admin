// controller/dashboardController.js
const asyncHandler = require("express-async-handler");
const User = require("../../models/userModel");
const Stadium = require("../../models/stadiumModel");
const Booking = require("../../models/bookingModel");
const Tournament = require("../../models/tournamentModel");
const Academy = require("../../models/academyModel");

// GET /dashboard/metrics
exports.getDashboardMetrics = asyncHandler(async (req, res) => {
  const role = req.user.role;
  const userId = req.user.id;

  if (role === "admin") {
    const [userCount, stadiumCount, bookingCount, tournamentCount] = await Promise.all([
      User.countDocuments(),
      Stadium.countDocuments(),
      Booking.countDocuments(),
      Tournament.countDocuments(),
    ]);

    return res.status(200).json({
      role: "admin",
      userCount,
      stadiumCount,
      bookingCount,
      tournamentCount,
    });
  }

  if (role === "stadiumOwner") {
    const stadiums = await Stadium.find({ ownerId: userId }, "id");
    const stadiumIds = stadiums.map((s) => s._id);

    const [myStadiums, myBookings, myTournaments] = await Promise.all([
      stadiums.length,
      Booking.find({ stadiumId: { $in: stadiumIds } }),
      Tournament.find({ stadiumId: { $in: stadiumIds } }),
    ]);

    const totalBookingProfit = myBookings.reduce((sum, b) => sum + (b.price || 0), 0);
    const totalTournamentProfit = myTournaments.reduce(
      (sum, t) => sum + t.entryPricePerTeam * (t.teams?.length || 0),
      0
    );

    return res.status(200).json({
      role: "stadiumOwner",
      stadiumCount: myStadiums,
      bookingCount: myBookings.length,
      tournamentCount: myTournaments.length,
      profit: totalBookingProfit + totalTournamentProfit,
    });
  }

  if (role === "academyOwner") {
    // Get the academy created by the current user
    const academy = await Academy.findOne({ ownerId: userId });

    if (!academy) {
      return res.status(404).json({ message: "Academy not found for this owner" });
    }

    // Example: Users who favorited this academy or have it linked
    const viewers = await User.countDocuments({ academyId: academy._id });

    return res.status(200).json({
      role: "academyOwner",
      academyId: academy._id,
      viewersCount: viewers,
    });
  }

  res.status(403).json({ message: "Unauthorized" });
});

exports.getStatistics = asyncHandler(async (req, res) => {
  const { type = "monthly" } = req.query;
  const userId = req.user._id;
  const role = req.user.role;

  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Grouping logic
  const groupBy = {
    monthly: { $month: "$createdAt" },
    quarterly: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
    yearly: { $year: "$createdAt" },
  }[type];

  if (role === "admin" || role === "academyOwner") {
    const users = await User.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      { $group: { _id: groupBy, count: { $sum: 1 } } },
    ]);
    return res.json({ role, type, data: users });
  }

  if (role === "stadiumOwner") {
    const stadiums = await Stadium.find({ owner: userId }, "_id");
    const stadiumIds = stadiums.map((s) => s._id);

    const bookings = await Booking.aggregate([
      { $match: { stadiumId: { $in: stadiumIds }, createdAt: { $gte: startOfYear } } },
      { $group: { _id: groupBy, profit: { $sum: "$price" } } },
    ]);

    const tournaments = await Tournament.aggregate([
      { $match: { stadiumId: { $in: stadiumIds }, createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: groupBy,
          profit: {
            $sum: {
              $multiply: ["$entryPricePerTeam", { $size: { $ifNull: ["$teams", []] } }],
            },
          },
        },
      },
    ]);

    // Create filled arrays
    const labels =
      type === "monthly"
        ? Array.from({ length: 12 }, (_, i) => i + 1)
        : type === "quarterly"
        ? [1, 2, 3, 4]
        : [...new Set([...bookings.map((b) => b._id), ...tournaments.map((t) => t._id)])].sort();

    const bookingsProfits = labels.map((label) => {
      const item = bookings.find((b) => b._id === label);
      return { _id: label, profit: item ? item.profit : 0 };
    });

    const tournamentsProfits = labels.map((label) => {
      const item = tournaments.find((t) => t._id === label);
      return { _id: label, profit: item ? item.profit : 0 };
    });

    return res.json({
      role,
      type,
      data: {
        bookings: bookingsProfits,
        tournaments: tournamentsProfits,
      },
    });
  }

  res.status(403).json({ message: "Unauthorized" });
});
