import mongoose, { Document, Schema } from 'mongoose';

export interface INewsletter extends Document {
    email: string;
    deviceInfo?: object;
    createdAt: Date;
    updatedAt: Date;
}

const newsletterSchema: Schema = new mongoose.Schema(
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

const Newsletter = mongoose.model<INewsletter>('Newsletter', newsletterSchema, 'newsletter');

export default Newsletter;