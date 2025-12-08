
import mongoose from 'mongoose';

const faqSchema = mongoose.Schema(
    {
        packageId: {
            type: String,
            required: true,
            unique: true,
        },
        packageName: {
            type: String,
            required: true,
        },
        packagePrice: {
            type: String,
            required: true,
        },
        packageCategories: {
            type: String,
            required: true,
        },
        faqs: {
            type: String,
            required: true,
        },
        serviceProviderId: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Faq = mongoose.model('Faq', faqSchema, 'faqs');

export default Faq;


