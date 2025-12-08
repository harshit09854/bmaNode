
import mongoose from 'mongoose';

const newsletterSchema = mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true,
        },
        deviceInfo: {
            type: Object,
        },
    },
    {
        timestamps: true,
    }
);

const Newsletter = mongoose.model('Newsletter',
    newsletterSchema,
    'newsletter' // ← EXACT SAME COLLECTION NAME
    );


export default Newsletter;
