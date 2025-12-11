import type { Request, Response } from 'express';
// TODO: Add types for cashfree-pg
// import Cashfree from '../config/cashfree';
import CashfreeOrder from '../models/cashfreeOrderModel.ts';
import Booking from '../models/bookingModel.ts';
import NewYearBooking from '../models/newYearBookingModel.ts';
import { v4 as uuidv4 } from 'uuid';
import { sendWhatsAppMessage, sendNewYearBookingConfirmationEmail } from '../utils/notification.ts';

const Cashfree: any = {}; // Placeholder for Cashfree SDK

// @desc    Payment API
// @route   POST /api/payment
// @access  Private
export const paymentApi = async (req: Request, res: Response) => {
    try {
        const { customer_name, customer_email, pricePackage, customer_phone } = req.body;

        if (!customer_name || !customer_email || !pricePackage || !customer_phone) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const internal_order_id = uuidv4();
        const internal_customer_id = uuidv4();

        const request = {
            order_id: internal_order_id,
            order_amount: pricePackage,
            order_currency: "INR",
            customer_details: {
                customer_id: internal_customer_id,
                customer_name: customer_name,
                customer_email: customer_email,
                customer_phone: customer_phone
            },
            order_meta: {
                return_url: `http://localhost:3000/order/status/{order_id}`,
            }
        };

        const response = await Cashfree.PGCreateOrder("2022-09-01", request);
        const cashfreeOrder = new CashfreeOrder({
            internal_order_id,
            internal_customer_id,
            cf_order_id: response.data.order_id,
            cf_payment_session_id: response.data.payment_session_id,
            cf_order_status: response.data.order_status,
            order_amount: pricePackage,
            customer_name,
            customer_email,
            customer_phone,
            cf_customer_id: response.data.customer_details.customer_id,
        });

        await cashfreeOrder.save();

        res.status(200).json(response.data);

    } catch (error: any) {
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
};

// @desc    Adventure Bookings
// @route   POST /api/adventure-bookings
// @access  Private
export const adventureBookings = async (req: Request, res: Response) => {
    try {
        const {
            name, email, phone, adventurePackageId, selectedDate, selectedTime, packagePrice, termsAccepted,
            SessionDetails, orderId, adventurePackageName, order_status, customer_id, cf_order_id, payment_session_id, location
        } = req.body;

        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentBooking = await Booking.findOne({
            email,
            adventure_package_id: adventurePackageId,
            createdAt: { $gte: twentyFourHoursAgo },
        });

        if (recentBooking) {
            return res.status(400).json({ message: 'You have already booked this package in the last 24 hours.' });
        }

        const booking_datetime = new Date(`${selectedDate}T${selectedTime}`);

        let cashfree_order = null;
        if (cf_order_id) {
            cashfree_order = await CashfreeOrder.findOne({ cf_order_id });
        }
        if (!cashfree_order && orderId) {
            cashfree_order = await CashfreeOrder.findOne({ internal_order_id: orderId });
        }

        const booking = new Booking({
            date_time: booking_datetime,
            name,
            email,
            phone,
            termsAccepted,
            adventure_package_id: adventurePackageId,
            price_type: packagePrice,
            sessionDetails: SessionDetails,
            orderId,
            adventurePackageName,
            order_status,
            customer_id,
            cf_order_id,
            payment_session_id,
            cashfree_order_ref: cashfree_order ? cashfree_order._id : null,
        });

        const createdBooking = await booking.save();

        if (cashfree_order) {
            await CashfreeOrder.updateOne(
                { _id: cashfree_order._id },
                {
                    $set: {
                        booking_ref: createdBooking._id,
                        adventure_package_id: adventurePackageId,
                        adventure_package_name: adventurePackageName,
                        booking_date: booking_datetime.toISOString().split('T')[0],
                        booking_time: booking_datetime.toTimeString().split(' ')[0],
                    },
                }
            );
        }

        await sendWhatsAppMessage(name, adventurePackageName, packagePrice, selectedDate, selectedTime, orderId, phone, location);

        res.status(201).json({ message: 'Booking created successfully', data: createdBooking });

    } catch (error: any) {
        res.status(500).json({ message: 'Error creating booking', error: error.message });
    }
};

// @desc    Payment Webhook
// @route   POST /api/payment-webhook
// @access  Public
export const paymentWebhook = (req: Request, res: Response) => {
    // TODO: Implement logic
    res.status(200).json({ message: 'Payment Webhook' });
};

// @desc    Get Order Details
// @route   GET /api/order-details/:order_id
// @access  Public
export const getOrderDetails = async (req: Request, res: Response) => {
    try {
        const order = await CashfreeOrder.findOne({ cf_order_id: req.params.order_id });
        if (order) {
            res.status(200).json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching order details', error: error.message });
    }
};

// @desc    Test Cashfree
// @route   GET /api/test-cashfree
// @access  Public
export const testCashfree = async (req: Request, res: Response) => {
    try {
        const response = await Cashfree.PGGetSettlements("2022-09-01", {
            order_id: "order_id" // This is a dummy order_id
        });
        res.status(200).json(response.data);
    } catch (error: any) {
        res.status(500).json({ message: 'Error testing Cashfree', error: error.message });
    }
};

// @desc    Sync Cashfree Order
// @route   GET /api/sync-cashfree-order/:cf_order_id
// @access  Public
export const syncCashfreeOrder = async (req: Request, res: Response) => {
    try {
        const { cf_order_id } = req.params;
        const response = await Cashfree.PGGetOrderById("2022-09-01", cf_order_id);

        const updatedOrder = await CashfreeOrder.findOneAndUpdate(
            { cf_order_id },
            {
                $set: {
                    cf_order_status: response.data.order_status,
                    payment_status: response.data.order_status,
                },
            },
            { new: true }
        );

        res.status(200).json(updatedOrder);
    } catch (error: any) {
        res.status(500).json({ message: 'Error syncing Cashfree order', error: error.message });
    }
};

// @desc    Create New Year Payment
// @route   POST /api/create-newyear-payment
// @access  Public
export const createNewYearPayment = async (req: Request, res: Response) => {
    const { customer_name, customer_email, customer_phone } = req.body;

    if (!customer_name || !customer_email || !customer_phone) {
        return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
    }

    try {
        const internal_order_id = uuidv4();
        const customer_id = uuidv4();
        const amount = 2500.00;

        const request = {
            order_id: internal_order_id,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: customer_id,
                customer_name: customer_name,
                customer_email: customer_email,
                customer_phone: customer_phone
            },
            order_meta: {
                return_url: `${process.env.FRONTEND_URL}/new-year-booking-confirmation`,
                notify_url: `${process.env.BACKEND_URL}/api/newyear-booking-webhook`,
            },
            order_note: "New Year Adventure Party 2025 - One Pass"
        };

        const response = await Cashfree.PGCreateOrder("2022-09-01", request);

        const newYearBooking = new NewYearBooking({
            internal_order_id,
            cf_order_id: response.data.cf_order_id,
            customer_id,
            customer_name,
            customer_email,
            customer_phone,
            amount,
            payment_link: response.data.payment_link,
            payment_session_id: response.data.payment_session_id,
        });

        await newYearBooking.save();

        res.status(200).json({
            success: true,
            data: {
                payment_link: response.data.payment_link,
                payment_session_id: response.data.payment_session_id,
                order_id: internal_order_id,
                cf_order_id: response.data.cf_order_id,
                customer_id: customer_id,
                amount: amount,
                currency: "INR"
            }
        });

    } catch (error: any) {
        res.status(500).json({ success: false, message: `Internal server error: ${error.message}` });
    }
};

// @desc    New Year Booking Webhook
// @route   POST /api/newyear-booking-webhook
// @access  Public
export const newYearBookingWebhook = async (req: Request, res: Response) => {
    try {
        const { data } = req.body;
        const { order, payment } = data;
        const cf_order_id = order.order_id;
        const payment_status = payment.payment_status || order.order_status;
        const is_success = payment_status === 'SUCCESS' || payment_status === 'PAID';

        const booking = await NewYearBooking.findOne({
            $or: [{ cf_order_id }, { internal_order_id: cf_order_id }],
        });

        if (booking) {
            booking.payment_status = payment_status;
            booking.cashfree_webhook_data = req.body;
            if (is_success) {
                booking.booking_status = 'CONFIRMED';
                booking.payment_completed_at = new Date();
            }
            await booking.save();

            if (is_success && !booking.email_sent) {
                const email_sent = await sendNewYearBookingConfirmationEmail(
                    booking.customer_name,
                    booking.customer_email,
                    booking.internal_order_id,
                    booking.amount
                );
                if (email_sent) {
                    booking.email_sent = true;
                    await booking.save();
                }
            }
        } else {
            // Create a minimal booking record if it doesn't exist
            const newBooking = new NewYearBooking({
                internal_order_id: cf_order_id,
                cf_order_id: cf_order_id,
                payment_status: payment_status,
                booking_status: is_success ? 'CONFIRMED' : 'PENDING',
                cashfree_webhook_data: req.body,
            });
            await newBooking.save();
        }

        res.status(200).send('Webhook received');
    } catch (error: any) {
        console.error(`[ERROR] Error handling webhook: ${error.message}`);
        res.status(500).send('Error handling webhook');
    }
};

// @desc    New Year Booking Status
// @route   GET /api/newyear-booking-status/:order_id
// @access  Public
export const newYearBookingStatus = async (req: Request, res: Response) => {
    try {
        const booking = await NewYearBooking.findOne({
            $or: [
                { internal_order_id: req.params.order_id },
                { cf_order_id: req.params.order_id },
            ],
        });

        if (booking) {
            res.status(200).json({ success: true, data: booking });
        } else {
            res.status(404).json({ success: false, message: 'Booking not found' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: `Error: ${error.message}` });
    }
};