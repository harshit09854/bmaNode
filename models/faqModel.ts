import mongoose, { Document, Schema } from 'mongoose';

export interface IFaq extends Document {
    packageId: string;
    packageName: string;
    packagePrice: string;
    packageCategories: string;
    faqs: string;
    serviceProviderId: string;
    createdAt: Date;
    updatedAt: Date;
}

const faqSchema: Schema = new mongoose.Schema(
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

const Faq = mongoose.model<IFaq>('Faq', faqSchema, 'faqs');

export default Faq;