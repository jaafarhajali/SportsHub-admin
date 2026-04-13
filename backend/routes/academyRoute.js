const express = require('express');
const router = express.Router();
const { getAllAcademies, getAcademyById } = require('../controllers/academyController'); // Adjust path to your controller
const { authMiddleware } = require("../middlewares/authMiddleware");

router.get('/', authMiddleware.auth, getAllAcademies);
router.get('/:id', authMiddleware.auth, getAcademyById);

module.exports = router;