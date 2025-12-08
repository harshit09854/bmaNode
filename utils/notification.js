import twilio from 'twilio';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Sends a WhatsApp message using Twilio.
 * @param {string} client_name
 * @param {string} adventure_package_name
 * @param {string} package_price
 * @param {string} booking_date
 * @param {string} booking_time
 * @param {string} order_id
 * @param {string} client_phone - Must include country code (e.g., +91)
 * @param {string} location
 * @returns {Promise<string>} A success or error message.
 */
export const sendWhatsAppMessage = async (client_name, adventure_package_name, package_price, booking_date, booking_time, order_id, client_phone, location) => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !twilioPhoneNumber) {
        const errorMsg = "Twilio credentials are not configured in environment variables.";
        console.error(errorMsg);
        return errorMsg;
    }

    const client = twilio(accountSid, authToken);

    // Format package price
    let formattedPrice = package_price;
    if (package_price.includes(":")) {
        const price_parts = package_price.split(":");
        formattedPrice = `${price_parts[0]} Package Rs. ${price_parts[1]}`;
    } else {
        formattedPrice = `Rs. ${package_price}`;
    }

    const messageBody = `
Dear ${client_name},

Thank you for choosing Book My Adventure!

We are delighted to inform you that your booking for the adventure package "${adventure_package_name}" has been successfully confirmed.

Here are your booking details:

*Package Name*: ${adventure_package_name}
*Customer Name*: ${client_name}
*Customer Phone Number*: ${client_phone}
*Package Price*: ₹${formattedPrice}
*Booking Date*: ${booking_date}
*Booking Time*: ${booking_time}
*Order ID*: ${order_id}
*Location Details*: ${location}

Our team will soon reach out to you with further details, including itinerary and travel guidelines.

In the meantime, if you have any questions or require assistance, please feel free to contact us at bookmyadventure2021@gmail.com.

We look forward to providing you with an unforgettable adventure experience!

Warm regards,
The Book My Adventure Team
`;

    try {
        const message = await client.messages.create({
            from: `whatsapp:${twilioPhoneNumber}`,
            body: messageBody,
            to: `whatsapp:${client_phone}`
        });
        console.log(`Message SID: ${message.sid}`);
        return "WhatsApp message sent successfully.";
    } catch (error) {
        console.error(`Error sending WhatsApp message: ${error.toString()}`);
        return `Error sending WhatsApp message: ${error.toString()}`;
    }
};


/**
 * Sends a confirmation email to a new admin/vendor.
 * @param {string} vendor_name
 * @param {string} business_email
 * @param {string} role
 * @param {string|null} admin_id
 * @param {string|null} created_at
 * @param {string|null} key
 * @returns {Promise<string>} A success or error message.
 */
export const sendEmailForAdmin = async (vendor_name, business_email, role, admin_id = null, created_at = null, key = null) => {
    const senderEmail = process.env.MAIL_USER || "bookmyadventure2021@gmail.com";
    const senderPassword = process.env.MAIL_PASSWORD;

    if (!senderPassword) {
        const errorMsg = "Mail password is not configured in environment variables.";
        console.error(errorMsg);
        return errorMsg;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: senderPassword,
        },
    });

    const finalRole = role === "Vendor" ? "Sub Admin" : role;

    let emailBody = `
    <p>Dear ${vendor_name},</p>
    <p>Thank you for registering as an admin for the business "<b>${vendor_name}</b>" under the role of "<b>${finalRole}</b>." We are pleased to confirm your account has been created successfully.</p>
    <p>Below are your registration details:</p>
    <br><br>
    <p><b>Business Name</b>: ${vendor_name}</p>
    <p><b>Business Email</b>: ${business_email}</p>
    <p><b>Role</b>: ${finalRole}</p>
    ${created_at ? `<p><b>Account Created At</b>: ${created_at}</p>` : ''}
    ${admin_id ? `<p><b>Admin ID</b>: ${admin_id}</p>` : ''}
    ${key ? `<p><b>Key</b>: ${key}</p>` : ''}
    <p>Your account has been successfully registered, and the <b>Agreement Acceptance</b> is confirmed.</p>
    <p>If you have not reviewed the agreement, please visit the following link to do so: <br>
    <a href="https://bookmyadventure.co.in/vendors-agreement" target="_blank">Vendor Agreement</a></p>
    <p>We are excited to have you on board and look forward to your contribution to the success of the business.</p>
    <br><br>
    <p>If you need any assistance or have any questions, feel free to reach out to us at <b>support@example.com</b>.</p>
    <p>Best regards,<br>
    <b>Book My Adventure Admin Team</b></p>
    `;

    const mailOptions = {
        from: senderEmail,
        to: business_email,
        subject: 'Welcome to Your New Admin Account',
        html: emailBody,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Admin confirmation email sent successfully.");
        return "Mail sent to admin successfully.";
    } catch (error) {
        console.error(`Error sending email: ${error.toString()}`);
        return `Error sending email: ${error.toString()}`;
    }
};

/**
 * Sends a confirmation email to a customer for a New Year Party booking.
 * @param {string} customer_name
 * @param {string} customer_email
 * @param {string} booking_id
 * @param {number} amount
 * @returns {Promise<boolean>} True if the email was sent successfully, false otherwise.
 */
export const sendNewYearBookingConfirmationEmail = async (customer_name, customer_email, booking_id, amount) => {
    const senderEmail = process.env.MAIL_USER || "bookmyadventure2021@gmail.com";
    const senderPassword = process.env.MAIL_PASSWORD;

    if (!senderPassword) {
        console.error("Mail password is not configured in environment variables.");
        return false;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: senderEmail,
            pass: senderPassword,
        },
    });

    const subject = "🎉 Your New Year Adventure Party 2025 Booking Confirmed!";
    const html_content = `
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; padding: 20px; background-color: #f9f9f9;">
                    <h1 style="color: #16a34a; text-align: center;">🏕️ New Year Adventure Party 2025</h1>
                    <div style="background-color: white; padding: 20px; border-radius: 8px; margin-top: 20px;">
                        <h2 style="color: #16a34a;">Booking Confirmed!</h2>
                        <p>Dear <strong>${customer_name}</strong>,</p>
                        <p>Thank you for booking your pass for the <strong>New Year Adventure Party 2025!</strong></p>
                        <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #16a34a; margin: 20px 0;">
                            <p style="margin: 8px 0;"><strong>Booking Details:</strong></p>
                            <p style="margin: 8px 0;">📋 <strong>Booking ID:</strong> ${booking_id}</p>
                            <p style="margin: 8px 0;">💰 <strong>Amount Paid:</strong> ₹${amount.toFixed(2)}</p>
                            <p style="margin: 8px 0;">📧 <strong>Email:</strong> ${customer_email}</p>
                            <p style="margin: 8px 0;">📅 <strong>Event Date:</strong> 31st December 2024</p>
                            <p style="margin: 8px 0;">🎵 <strong>Features:</strong> Music • Campfire • Adventure</p>
                        </div>
                        <p style="margin-top: 20px;">
                            <strong>What to Expect:</strong><br>
                            🎶 Live Music • 🔥 Campfire Gathering • 🏕️ Adventure Activities • 🌟 Limited Passes (50 only)
                        </p>
                        <p style="margin-top: 20px;">
                            <strong>Important:</strong><br>
                            Please keep this booking confirmation for reference. You'll need your booking ID for check-in.
                        </p>
                        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626; margin-top: 20px;">
                            <p style="margin: 0;"><strong>❓ Questions?</strong></p>
                            <p style="margin: 8px 0;">Contact us at: support@bookmyadventure.co.in</p>
                        </div>
                    </div>
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px;">
                        <p>© 2024 Book My Adventure. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply directly to this email.</p>
                    </div>
                </div>
            </body>
        </html>
    `;

    const mailOptions = {
        from: senderEmail,
        to: customer_email,
        subject: subject,
        html: html_content,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`[SUCCESS] Confirmation email sent to ${customer_email}`);
        return true;
    } catch (error) {
        console.error(`[ERROR] Error sending email: ${error}`);
        return false;
    }
};
