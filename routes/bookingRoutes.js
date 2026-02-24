import express from 'express';
import authMiddleware from '../middleware/auth.js';
import { uploads } from '../middleware/uploads.js';
import { createBooking, deleteBooking, getBooking, getMyBookings, updateBooking, updateBookingStatus } from '../controllers/bookingController.js';


const bookingRouter = express.Router();
bookingRouter.post("/", authMiddleware, uploads.single('carImage'), createBooking)
bookingRouter.get('/', getBooking);
bookingRouter.get('/mybookings', authMiddleware, getMyBookings);
bookingRouter.put('/:id', uploads.single('carImage'), updateBooking);
bookingRouter.patch('/:id/status', updateBookingStatus);
bookingRouter.delete('/:id', deleteBooking);

export default bookingRouter;


