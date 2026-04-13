const express = require('express');
const router = express.Router();

const bookingController = require('../controllers/bookingController');
const { authMiddleware } = require('../middlewares/authMiddleware');

router.post('/book', authMiddleware.auth, bookingController.bookMatch);
router.put('/:id/cancel', authMiddleware.auth, bookingController.cancelBooking);
router.get('/my-bookings', authMiddleware.auth, bookingController.getMyBookings);

module.exports = router;