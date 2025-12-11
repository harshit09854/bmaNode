import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
    date_time: Date;
    name: string;
    email: string;
    phone: string;
    termsAccepted: boolean;
    adventure_package_id: string;
    price_type: string;
    sessionDetails?: string;
    orderId: string;
    adventurePackageName: string;
    order_status: string;
    customer_id: string;
    cf_order_id?: string;
    payment_session_id?: string;
    cashfree_order_ref?: string;
    createdAt: Date;
    updatedAt: Date;
}

const bookingSchema: Schema = new mongoose.Schema(
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

const Booking = mongoose.model<IBooking>('Booking', bookingSchema, 'adventureBookings');

export default Booking;