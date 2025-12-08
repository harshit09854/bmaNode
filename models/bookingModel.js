import mongoose from 'mongoose';

const bookingSchema = mongoose.Schema(
    {
        date_time: {
            type: Date,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        phone: {
            type: String,
            required: true,
        },
        termsAccepted: {
            type: Boolean,
            required: true,
        },
        adventure_package_id: {
            type: String,
            required: true,
        },
        price_type: {
            type: String,
            required: true,
        },
        sessionDetails: {
            type: String,
        },
        orderId: {
            type: String,
            required: true,
        },
        adventurePackageName: {
            type: String,
            required: true,
        },
        order_status: {
            type: String,
            required: true,
        },
        customer_id: {
            type: String,
            required: true,
        },
        cf_order_id: {
            type: String,
        },
        payment_session_id: {
            type: String,
        },
        cashfree_order_ref: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model('Booking', bookingSchema, 'adventureBookings' );

export default Booking;


