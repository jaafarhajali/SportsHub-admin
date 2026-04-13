const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard/dashboardController");
const usersController = require("../controllers/dashboard/usersController");
const rolesController = require("../controllers/dashboard/rolesController");
const stadiumController = require("../controllers/dashboard/stadiumsController");
const academyController = require("../controllers/dashboard/academiesController");
const tournamentsController = require("../controllers/dashboard/tournamentsController");
const bookingsController = require("../controllers/dashboard/bookingsController");
const teamsController = require("../controllers/dashboard/teamsController");
const exportController = require("../controllers/dashboard/exportController")
const { authMiddleware } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const uploadStadium = require("../middlewares/uploadStadium");
const uploadAcademy = require("../middlewares/uploadAcademy");

// Dashboard Stats
router.get("/metrics", authMiddleware.role(["admin", "stadiumOwner", "academyOwner"]), dashboardController.getDashboardMetrics);
router.get("/statistics", authMiddleware.role(["admin", "stadiumOwner", "academyOwner"]), dashboardController.getStatistics);

// Dashboard users management
router.get("/users", authMiddleware.role(["admin", "stadiumOwner"]), usersController.getAllUsers);
router.get("/users/academy-owners", authMiddleware.role("admin"), usersController.getAcademyOwners);
router.get("/users/stadium-owners", authMiddleware.role("admin"), usersController.getStadiumOwners);
router.get("/users/:id", authMiddleware.admin, usersController.getUser);
router.post("/users", authMiddleware.admin, upload.single("profilePhoto"), usersController.addUser);
router.put("/users/:id", authMiddleware.admin, upload.single("profilePhoto"), usersController.updateUser);
router.delete("/users/:id", authMiddleware.admin, usersController.deleteUser);

// Dashboard roles management
router.get("/roles", authMiddleware.admin, rolesController.getAllRoles);
router.post("/roles", authMiddleware.admin, rolesController.addRole);
router.put("/roles/:id", authMiddleware.admin, rolesController.updateRole);
router.delete("/roles/:id", authMiddleware.admin, rolesController.deleteRole);

// Dashboard stadium management
router.get("/stadiums", authMiddleware.role(["admin"]), stadiumController.getAllStadiums);
router.get("/stadiums/:id", authMiddleware.role(["admin", "stadiumOwner"]), stadiumController.getStadiumById);
router.post(
  "/stadiums",
  authMiddleware.role(["stadiumOwner", "admin"]),
  uploadStadium.array("photos", 5),
  stadiumController.addStadium
);
router.put(
  "/stadiums/:id",
  authMiddleware.owns("stadiumModel", "id", "ownerId"),
  uploadStadium.array("photos", 5),
  stadiumController.updateStadium
);
router.delete("/stadiums/:id", authMiddleware.owns("stadiumModel", "id", "ownerId"), stadiumController.deleteStadium);
router.get(
  "/stadiums/owner/:ownerId",
  authMiddleware.role(["admin", "stadiumOwner"]),
  stadiumController.getStadiumsByOwner
);

// Dashboard Bookings management
router.get("/bookings", authMiddleware.role("admin"), bookingsController.getAllBookings);
router.get("/bookings/owner/:ownerId", authMiddleware.role("stadiumOwner"), bookingsController.getBookingsByOwner);
router.post("/bookings", authMiddleware.role(["admin", "stadiumOwner"]), bookingsController.createBook);
router.put("/bookings/:id", authMiddleware.role(["admin", "stadiumOwner"]), bookingsController.updateBooking);
router.put("/bookings/cancel/:id", authMiddleware.role(["admin", "stadiumOwner"]), bookingsController.cancelBooking);

// Dashboard academy management
router.get("/academies", authMiddleware.role(["admin"]), academyController.getAllAcademies);
router.post(
  "/academies",
  authMiddleware.role(["admin", "academyOwner"]),
  uploadAcademy.array("photos", 5),
  academyController.addAcademy
);
router.get("/academies/:id", authMiddleware.role(["admin", "academyOwner"]), academyController.getAcademyById);
router.put(
  "/academies/:id",
  authMiddleware.owns("academyModel", "id", "ownerId"),
  uploadAcademy.array("photos", 5),
  academyController.updateAcademy
);
router.delete("/academies/:id", authMiddleware.owns("academyModel", "id", "ownerId"), academyController.deleteAcademy);
router.get("/academies/owner/:ownerId", authMiddleware.role(["academyOwner"]), academyController.getAcademiesByOwner);

// Dashboard tournaments management
router.get("/tournaments", authMiddleware.role(["admin"]), tournamentsController.getAllTournaments);
router.get("/my-tournaments", authMiddleware.stadiumOwner, tournamentsController.getMyTournaments);
router.post("/tournaments", authMiddleware.role(["admin", "stadiumOwner"]), tournamentsController.addTournament);
router.get(
  "/tournaments/:id/teams",
  authMiddleware.role(["admin", "stadiumOwner"]),
  tournamentsController.getTournamentTeams
);
router.put(
  "/tournaments/:id",
  authMiddleware.owns("tournamentModel", "id", "createdBy"),
  tournamentsController.updateTournament
);
router.post(
  "/tournaments/add-team",
  authMiddleware.role(["admin", "stadiumOwner"]),
  tournamentsController.addTeamToTournament
);

router.post(
  "/tournaments/remove-team",
  authMiddleware.role(["admin", "stadiumOwner"]),
  tournamentsController.removeTeamFromTournament
);
router.delete(
  "/tournaments/:id",
  authMiddleware.owns("tournamentModel", "id", "createdBy"),
  tournamentsController.deleteTournament
);

// Dashboard teams management
router.get("/teams", authMiddleware.role("admin"), teamsController.getAllTeams);
router.post("/teams", authMiddleware.role("admin"), teamsController.createTeamByAdmin);
router.patch("/teams/:teamId", authMiddleware.role("admin"), teamsController.updateTeamByAdmin);
router.delete("/teams/:teamId", authMiddleware.role("admin"), teamsController.deleteTeamByAdmin);
router.get("/teams/search", authMiddleware.role(["admin", "stadiumOwner"]), teamsController.searchTeams);

// Dashboard export
router.get("/export/:table", authMiddleware.role(["admin", "stadiumOwner", "academyOwner"]), exportController.exportTableToExcel);

module.exports = router;
