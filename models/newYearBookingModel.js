import mongoose from 'mongoose';

const newYearBookingSchema = new mongoose.Schema({
    internal_order_id: { type: String, required: true, unique: true },
    cf_order_id: { type: String, unique: true },
    customer_id: { type: String, required: true },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    payment_link: { type: String },
    payment_session_id: { type: String },
    payment_status: { type: String, default: 'PENDING' },
    booking_status: { type: String, default: 'PENDING' },
    email_sent: { type: Boolean, default: false },
    payment_completed_at: { type: Date },
    cashfree_webhook_data: { type: Object },
}, { timestamps: true });

const NewYearBooking = mongoose.model('NewYearBooking',newYearBookingSchema,'newYearBookings') // ← EXACT SAME COLLECTION NAME);

export default NewYearBooking;
