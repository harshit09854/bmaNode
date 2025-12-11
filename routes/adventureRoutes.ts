import express from 'express';
import {
    getTrendingAdventures,
    getAdventureDetails,
    getUpcomingAdventures,
    getHomepageUpcomingAdventures,
    getAdventuresByCategory,
    getAdventureCourses,
    viewAdventurePackages,
    fetchHomepageVendors,
    fetchVendorPackages
} from '../controllers/adventureController.ts';

const router = express.Router();

router.get('/trending-adventures', getTrendingAdventures);
router.get('/trending/adventure-details/:adventure_name', getAdventureDetails);
router.get('/upcoming-adventures', getUpcomingAdventures);
router.get('/homepage-upcoming-adventures', getHomepageUpcomingAdventures);
router.get('/adventures-by-category/:category', getAdventuresByCategory);
router.get('/get-adventure-courses', getAdventureCourses);
router.get('/view-adventure-packages', viewAdventurePackages);
router.get('/fetch-homepage-vendors', fetchHomepageVendors);
router.get('/fetch-vendor-packages', fetchVendorPackages);

export default router;