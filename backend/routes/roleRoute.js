// routes/roles.js (Express.js backend)
const express = require('express');
const router = express.Router();
const { getAllRoles, getRolesSimple } = require('../controllers/roleController'); // Adjust path to your controller

// GET /api/roles - Fetch all roles
router.get('/', getAllRoles);

// GET /api/roles/:id - Fetch single role
router.get('/:id', getRolesSimple);

module.exports = router;

// Don't forget to register this route in your main app.js:
// app.use('/api/roles', require('./routes/roles'));