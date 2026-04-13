const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const teamsController = require("../controllers/teamsController");

router.get("/my-team", authMiddleware.auth, teamsController.getMyTeam);
router.post("/create", authMiddleware.role("user"), teamsController.createTeam);
router.get("/search", authMiddleware.auth, teamsController.searchUser);
router.post("/invite", authMiddleware.auth, teamsController.inviteUser);
router.post("/accept", authMiddleware.auth, teamsController.acceptInvite);
router.post("/reject", authMiddleware.auth, teamsController.rejectInvite);
router.post("/remove-member", authMiddleware.auth, teamsController.removeMember);
router.post("/delete", authMiddleware.auth, teamsController.deleteTeam);
router.post("/exit", authMiddleware.auth, teamsController.exitTeam);


module.exports = router;
