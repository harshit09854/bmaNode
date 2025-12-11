import mongoose, { Document, Schema } from 'mongoose';

export interface INewYearBooking extends Document {
    internal_order_id: string;
    cf_order_id?: string;
    customer_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: number;
    currency: string;
    payment_link?: string;
    payment_session_id?: string;
    payment_status: string;
    booking_status: string;
    email_sent: boolean;
    payment_completed_at?: Date;
    cashfree_webhook_data?: object;
    createdAt: Date;
    updatedAt: Date;
}

const newYearBookingSchema: Schema = new mongoose.Schema({
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

const NewYearBooking = mongoose.model<INewYearBooking>('NewYearBooking', newYearBookingSchema, 'newYearBookings');

export default NewYearBooking;