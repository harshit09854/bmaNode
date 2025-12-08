import express from 'express';
import {
    adminLogin,
    viewVendorsNames,
    addNewPackage,
    viewPackages,
    updatePackage,
    deletePackage,
    getNewsletterSubscribers,
    getUserBookings,
    addNewBlog,
    addHomepageBanners,
    createNewSubAdmin,
    getAdminData,
    removeAdminData,
    updateAdminData,
    logoutAdmin,
    verifyAdmin,
    vendorRegistration,
    getProfileDetails,
    updateSubadminDetails,
    addNewFaqs,
    viewFaqs,
    getDashboardSummary,
    getNewYearBookings,
    getNewYearStatistics
} from '../controllers/adminController.js';
import { protectAdmin, authorizeMainAdmin } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/admin-login', adminLogin);
router.post('/vendor-registration', vendorRegistration);

// Protected routes (all admins)
router.get('/view-packages', protectAdmin, viewPackages);
router.get('/get-user-bookings', protectAdmin, getUserBookings);
router.get('/get-admin-verify', protectAdmin, verifyAdmin);
router.get('/get-profile-details', protectAdmin, getProfileDetails);
router.put('/update-subadmin-details', protectAdmin, upload.none(), updateSubadminDetails); // Assuming no file upload for now
router.get('/view-faqs', protectAdmin, viewFaqs);
router.post('/logout', logoutAdmin);

// Protected routes (main admin only)
router.get('/view-vendors-names', protectAdmin, authorizeMainAdmin, viewVendorsNames);
router.post('/add-new-package', protectAdmin, authorizeMainAdmin, upload.array('images'), addNewPackage);
router.put('/update-package', protectAdmin, authorizeMainAdmin, upload.array('images'), updatePackage);
router.delete('/delete-package/:id', protectAdmin, authorizeMainAdmin, deletePackage);
router.get('/get-newsletter-subscribers', protectAdmin, authorizeMainAdmin, getNewsletterSubscribers);
router.post('/add-new-blog', protectAdmin, authorizeMainAdmin, upload.array('images'), addNewBlog);
router.post('/add-homepage-banners', protectAdmin, authorizeMainAdmin, upload.array('images'), addHomepageBanners);
router.post('/create-new-sub-admin', protectAdmin, authorizeMainAdmin, createNewSubAdmin);
router.get('/get-admin-data', protectAdmin, authorizeMainAdmin, getAdminData);
router.delete('/remove-admin/:id', protectAdmin, authorizeMainAdmin, removeAdminData);
router.put('/update-admin-data', protectAdmin, authorizeMainAdmin, updateAdminData);
router.post('/add-new-faqs', protectAdmin, authorizeMainAdmin, addNewFaqs);
router.get('/dashboard-summary', protectAdmin, authorizeMainAdmin, getDashboardSummary);
router.get('/newyear-bookings', protectAdmin, authorizeMainAdmin, getNewYearBookings);
router.get('/newyear-statistics', protectAdmin, authorizeMainAdmin, getNewYearStatistics);

export default router;
