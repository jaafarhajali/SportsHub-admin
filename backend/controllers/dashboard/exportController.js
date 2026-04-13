// controllers/exportController.js
const ExcelJS = require("exceljs");
const User = require("../../models/userModel");
const Stadium = require("../../models/stadiumModel");
const Booking = require("../../models/bookingModel");
const Tournament = require("../../models/tournamentModel");
const Team = require("../../models/teamModel");
const Academy = require("../../models/academyModel");
const Role = require("../../models/roleModel");

const exportConfig = require("../../config/exportConfig");

const models = {
  users: User,
  stadiums: Stadium,
  bookings: Booking,
  tournaments: Tournament,
  teams: Team,
  academies: Academy,
  roles: Role,
};

exports.exportTableToExcel = async (req, res) => {
  const { table } = req.params;
  const model = models[table];
  const config = exportConfig[table] || {};

  if (!model) {
    return res.status(400).json({ success: false, message: "Invalid table name" });
  }

  try {
    let query = model.find();

    // Role-based filters
    const user = req.user;

    if (user.role !== "admin") {
      switch (table) {
        case "stadiums":
          query = query.where("ownerId").equals(user.id);
          break;

        case "bookings":
          const userStadiums = await Stadium.find({ ownerId: user.id }).select("_id").lean();
          const stadiumIds = userStadiums.map((s) => s._id);
          query = query.where("stadiumId").in(stadiumIds);
          break;

        case "tournaments":
          query = query.where("owner").equals(user.id);
          break;

        case "academies":
          query = query.where("ownerId").equals(user.id);
          break;

        default:
          return res.status(403).json({ success: false, message: "You are not allowed to export this data" });
      }
    }

    // Populate references if defined
    if (config.populate) {
      for (const pop of config.populate) {
        query = query.populate(pop);
      }
    }

    let data = await query.lean();

    // Apply transform function
    data = data.map((item) => {
      if (config.transform) {
        item = config.transform(item);
      }

      // Filter included fields
      if (config.include) {
        item = Object.fromEntries(Object.entries(item).filter(([key]) => config.include.includes(key)));
      }

      // Remove excluded fields
      if (config.exclude) {
        for (const field of config.exclude) {
          delete item[field];
        }
      }

      return item;
    });

    // Create Excel file
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(table);

    if (data.length > 0) {
      const columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));
      worksheet.columns = columns;
      worksheet.addRows(data);
    }

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=${table}.xlsx`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Export failed" });
  }
};
