const express = require('express');
const router = express.Router();

const tournamentController = require('../controllers/tournamentController');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.get('/', authMiddleware.auth, tournamentController.getAllTournaments);
router.post("/join", authMiddleware.teamLeader, tournamentController.joinTournament);
router.post("/leave", authMiddleware.teamLeader, tournamentController.leaveTournament);


module.exports = router;