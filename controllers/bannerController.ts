import type { Request, Response } from 'express';
import Banner from '../models/bannerModel.ts';
import type { IBanner } from '../models/bannerModel.ts';

// @desc    Get the latest hero banners
// @route   GET /api/banners/hero
// @access  Public
export const getHeroBanners = async (req: Request, res: Response) => {
    try {
        console.log("Fetching hero banners");
        const allBanners: IBanner[] = await Banner.find({});
        // console.log("All banners retrieved:", allBanners);
        // Retrieve the most recent banner document based on the `createdAt` field
        const latestBanner: IBanner | null = await Banner.findOne({}).sort({ createdAt: -1 });
        // console.log("Latest banner retrieved:", latestBanner);
        if (latestBanner) {
            res.status(200).json({
                image_urls: latestBanner.image_urls,
                created_at: latestBanner.createdAt,
            });
        } else {
            res.status(404).json({ message: 'No banners found.' });
        }

    } catch (error: any) {
        res.status(500).json({ message: 'Error retrieving banners.', error: error.message });
    }
};