
import mongoose from 'mongoose';

const cashfreeOrderSchema = new mongoose.Schema({
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

const CashfreeOrder = mongoose.model('CashfreeOrder',
    cashfreeOrderSchema,
    'cashfreeOrders' // ← EXACT SAME COLLECTION NAME
);



export default CashfreeOrder;
