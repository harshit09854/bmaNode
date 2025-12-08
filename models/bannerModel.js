
import mongoose from 'mongoose';

const bannerSchema = mongoose.Schema(
    {
        image_urls: {
            type: Array,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Banner = mongoose.model('Banner',
     bannerSchema,
     'homepageBanners' // ← EXACT SAME COLLECTION NAME
    );

export default Banner;


