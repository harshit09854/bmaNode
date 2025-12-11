import mongoose, { Document, Schema } from 'mongoose';

export interface IBanner extends Document {
    image_urls: string[];
    createdAt: Date;
    updatedAt: Date;
}

const bannerSchema: Schema = new mongoose.Schema(
    {
        image_urls: {
            type: [String],
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Banner = mongoose.model<IBanner>('Banner', bannerSchema, 'homepageBanners');

export default Banner;
