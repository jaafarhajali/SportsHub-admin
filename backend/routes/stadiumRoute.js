const express = require('express');
const router = express.Router();
const { getAllStadiums, getStadiumById } = require('../controllers/stadiumController'); // Adjust path to your controller
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get('/', authMiddleware.auth, getAllStadiums);
router.get('/:id', authMiddleware.auth, getStadiumById);

module.exports = router;