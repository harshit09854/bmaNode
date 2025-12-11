import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ICashfreeOrder extends Document {
    internal_order_id: string;
    internal_customer_id: string;
    cf_order_id: string;
    cf_payment_session_id: string;
    cf_order_status: string;
    order_amount: number;
    order_currency: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    cf_customer_id?: string;
    payment_status: string;
    booking_ref?: Types.ObjectId;
    adventure_package_id?: Types.ObjectId;
    adventure_package_name?: string;
    booking_date?: string;
    booking_time?: string;
    createdAt: Date;
    updatedAt: Date;
}

const cashfreeOrderSchema: Schema = new mongoose.Schema({
    internal_order_id: { type: String, required: true, unique: true },
    internal_customer_id: { type: String, required: true },
    cf_order_id: { type: String, required: true, unique: true },
    cf_payment_session_id: { type: String, required: true },
    cf_order_status: { type: String, default: 'PENDING' },
    order_amount: { type: Number, required: true },
    order_currency: { type: String, default: 'INR' },
    customer_name: { type: String, required: true },
    customer_email: { type: String, required: true },
    customer_phone: { type: String, required: true },
    cf_customer_id: { type: String },
    payment_status: { type: String, default: 'PENDING' },
    booking_ref: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    adventure_package_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AdventurePackage' },
    adventure_package_name: { type: String },
    booking_date: { type: String },
    booking_time: { type: String },
}, { timestamps: true });

const CashfreeOrder = mongoose.model<ICashfreeOrder>('CashfreeOrder', cashfreeOrderSchema, 'cashfreeOrders');

export default CashfreeOrder;