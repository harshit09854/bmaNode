import express from 'express';
import {
    paymentApi,
    adventureBookings,
    paymentWebhook,
    getOrderDetails,
    testCashfree,
    syncCashfreeOrder,
    createNewYearPayment,
    newYearBookingWebhook,
    newYearBookingStatus
} from '../controllers/paymentController.ts';

const router = express.Router();

router.post('/payment', paymentApi);
router.post('/adventure-bookings', adventureBookings);
router.post('/payment-webhook', paymentWebhook);
router.get('/order-details/:order_id', getOrderDetails);
router.get('/test-cashfree', testCashfree);
router.get('/sync-cashfree-order/:cf_order_id', syncCashfreeOrder);
router.post('/create-newyear-payment', createNewYearPayment);
router.post('/newyear-booking-webhook', newYearBookingWebhook);
router.get('/newyear-booking-status/:order_id', newYearBookingStatus);

export default router;