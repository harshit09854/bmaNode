import type { Request, Response } from 'express';
import Admin from '../models/adminModel.ts';
import AdventurePackage from '../models/adventurePackageModel.ts';
import Newsletter from '../models/newsletterModel.ts';
import Booking from '../models/bookingModel.ts';
import Blog from '../models/blogModel.ts';
import Banner from '../models/bannerModel.ts';
import Faq from '../models/faqModel.ts';
import NewYearBooking from '../models/newYearBookingModel.ts';
import { createAccessToken } from '../utils/generateToken.ts';
import cloudinary from '../config/cloudinary.ts';
import { sendEmailForAdmin } from '../utils/notification.ts';
import { encryptData } from '../utils/cipher.ts';
import {comparePassword} from '../utils/hash.ts';
import type { CustomRequest } from '../middleware/authMiddleware.ts';
import User from '../models/userModel.ts';

//
// @desc    Admin Login
// @route   POST /admin/admin-login
// @access  Public
export const adminLogin = async (req: Request, res: Response) => {
    try {
        const { businessEmail, password } = req.body;
       
        // console.log(businessEmail)
        const admin = await Admin.findOne({businessEmail: businessEmail});
        // console.log("Admin found during login:", admin);    
        if (admin && admin.password && (await comparePassword(password, admin.password))) {
            const payload = {
                adminId: admin._id,
                "admin-email": admin.businessEmail,
                "admin-role": admin["Admin-Role"],
                businessName: admin.businessName,
            };

            const token = createAccessToken(payload);

            return res.status(200).json({
                message: "Success",
                access_token: token,
                token_type: "bearer",
            });
        }

        return res.status(401).json({ message: "Invalid email or password" });
    } catch (error: any) {
        return res.status(500).json({
            message: "Server error during login",
            error: error.message,
        });
    }
};


// @desc    View Vendors Names
// @route   GET /admin/view-vendors-names
// @access  Private (Main Admin)
export const viewVendorsNames = async (req: Request, res: Response) => {
    try {
        const admins = await Admin.find({ 'Admin-Role': { $ne: 'main-admin-001' } })
            .select('adminServiceId businessName -_id');
        res.status(200).json(admins);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching vendor names', error: error.message });
    }
};

// @desc    Add New Package
// @route   POST /admin/add-new-package
// @access  Private
export const addNewPackage = async (req: CustomRequest, res: Response) => {
    try {
        const {
            name,
            location,
            prices,
            description,
            From,
            To,
            Categories,
            Status,
            slots,
            reporting_time,
            starting_point,
            includes,
            highlights,
            tags,
            itinerary,
            certificate_name,
            vendorId,
        } = req.body;

        const includes_list = JSON.parse(includes);
        const highlights_list = JSON.parse(highlights);
        const itinerary_list = JSON.parse(itinerary);
        const tags_list = JSON.parse(tags).split(', ');
        const prices_list = JSON.parse(prices);

        const image_urls: string[] = [];
        if (req.files) {
            for (const file of req.files as Express.Multer.File[]) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'bookmyadventure/packages',
                    transformation: [{ width: 800, crop: 'scale' }, { quality: 'auto' }],
                });
                image_urls.push(result.secure_url);
            }
        }

        const packageData: any = {
            name,
            location,
            price: prices_list,
            description,
            Category: Categories,
            Includes: includes_list,
            Highlights: highlights_list,
            itinerary: itinerary_list,
            Tags: tags_list,
            slots,
            reporting_time,
            starting_point,
            image_paths: image_urls,
            status: Status,
        };

        if (From) {
            packageData.From = From;
        }
        if (To) {
            packageData.To = To;
        }

        if (req.admin && req.admin['Admin-Role'] === 'main-admin-001' && vendorId) {
            packageData.serviceProvider = vendorId;
        } else if (req.admin) {
            packageData.serviceProvider = req.admin.adminServiceId;
        }

        if (Categories === 'Courses & Training' && certificate_name) {
            packageData.certificate_name = certificate_name;
        }

        const newPackage = new AdventurePackage(packageData);
        await newPackage.save();

        res.status(201).json({ message: 'Package added successfully.' });
    } catch (error: any) {
        res.status(422).json({ message: 'Error processing request', error: error.message });
    }
};

// @desc    View Packages
// @route   GET /admin/view-packages
// @access  Private
export const viewPackages = async (req: CustomRequest, res: Response) => {
    try {
        let packages;
        if (req.admin && req.admin['Admin-Role'] === 'main-admin-001') {
            packages = await AdventurePackage.find({});
        } else if (req.admin) {
            packages = await AdventurePackage.find({ serviceProvider: req.admin.adminServiceId });
        }
        res.status(200).json({ message: 'Adventures fetched successfully', data: packages });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching adventures', error: error.message });
    }
};

// @desc    Update Package
// @route   PUT /admin/update-package
// @access  Private
export const updatePackage = async (req: Request, res: Response) => {
    try {
        const {
            packageId,
            existingImages,
            imagesToDelete,
            name,
            location,
            prices,
            description,
            From,
            To,
            Categories,
            Status,
            slots,
            reporting_time,
            starting_point,
            includes,
            highlights,
            itinerary,
            tags,
            Certificate,
        } = req.body;

        if (!packageId) {
            return res.status(400).json({ message: 'Package ID is required' });
        }

        const update_data: any = {};
        let final_images: string[] = [];

        // Get existing images that weren't deleted
        if (existingImages) {
            final_images.push(...JSON.parse(existingImages));
        }

        // Delete images from Cloudinary if specified
        if (imagesToDelete) {
            const images_to_delete = JSON.parse(imagesToDelete);
            for (const image_url of images_to_delete) {
                const public_id = image_url.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`bookmyadventure/packages/${public_id}`);
                final_images = final_images.filter((img) => img !== image_url);
            }
        }

        // Upload new images if provided
        if (req.files) {
            for (const file of req.files as Express.Multer.File[]) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'bookmyadventure/packages',
                    transformation: [{ width: 800, crop: 'scale' }, { quality: 'auto' }],
                });
                final_images.push(result.secure_url);
            }
        }

        update_data.image_paths = final_images;

        if (name) update_data.name = name;
        if (location) update_data.location = location;
        if (prices) update_data.price = JSON.parse(prices);
        if (description) update_data.description = description;
        if (From) update_data.From = From;
        if (To) update_data.To = To;
        if (Categories) update_data.Category = Categories;
        if (Status) update_data.status = Status;
        if (slots) update_data.slots = slots;
        if (reporting_time) update_data.reporting_time = reporting_time;
        if (starting_point) update_data.starting_point = starting_point;
        if (includes) update_data.Includes = JSON.parse(includes);
        if (highlights) update_data.Highlights = JSON.parse(highlights);
        if (itinerary) update_data.itinerary = JSON.parse(itinerary);
        if (tags) update_data.Tags = JSON.parse(tags).split(', ');
        if (Certificate) update_data.certificate_name = Certificate;

        const updatedPackage = await AdventurePackage.findByIdAndUpdate(packageId, { $set: update_data }, { new: true });

        if (!updatedPackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        res.status(200).json({ message: 'Package updated successfully.', data: updatedPackage });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating package', error: error.message });
    }
};

// @desc    Delete Package
// @route   DELETE /admin/delete-package/:id
// @access  Private (Main Admin)
export const deletePackage = async (req: Request, res: Response) => {
    try {
        const packageId = req.params.id;
        
        // First, find the package to get the image paths
        const adventurePackage = await AdventurePackage.findById(packageId);

        if (!adventurePackage) {
            return res.status(404).json({ message: 'Package not found' });
        }

        // Delete images from Cloudinary
        if (adventurePackage.image_paths && adventurePackage.image_paths.length > 0) {
            for (const imageUrl of adventurePackage.image_paths) {
                try {
                    const public_id_full = imageUrl.split('/').pop();
                    if (public_id_full) {
                        const public_id = public_id_full.substring(0, public_id_full.lastIndexOf('.'));
                        // We need to specify the folder in destroy method if images are stored in a folder
                        await cloudinary.uploader.destroy(`bookmyadventure/packages/${public_id}`);
                    }
                } catch (cloudinaryError) {
                    // Log the error but don't block the package deletion
                    console.error('Cloudinary deletion failed for an image:', cloudinaryError);
                }
            }
        }
        
        // Then, delete the package from the database
        await AdventurePackage.findByIdAndDelete(packageId);

        res.status(200).json({ message: 'Package and associated images deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error deleting package', error: error.message });
    }
};

// @desc    Get Newsletter Subscribers
// @route   GET /admin/get-newsletter-subscribers
// @access  Private
export const getNewsletterSubscribers = async (req: Request, res: Response) => {
    try {
        const subscribers = await Newsletter.find({});
        res.status(200).json({ message: 'Subscribers fetched successfully', data: subscribers });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching subscribers', error: error.message });
    }
};

// @desc    Get User Bookings
// @route   GET /admin/get-user-bookings
// @access  Private
export const getUserBookings = async (req: CustomRequest, res: Response) => {
    try {
        let bookings;
        if (req.admin && req.admin['Admin-Role'] === 'main-admin-001') {
            bookings = await Booking.find({});
        } else if (req.admin) {
            const packages = await AdventurePackage.find({ serviceProvider: req.admin.adminServiceId });
            const packageIds = packages.map((p) => p._id.toString());
            bookings = await Booking.find({ adventure_package_id: { $in: packageIds } });
        }
        res.status(200).json({ message: 'Bookings fetched successfully', data: bookings });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching bookings', error: error.message });
    }
};

// @desc    Add New Blog
// @route   POST /admin/add-new-blog
// @access  Private
export const addNewBlog = async (req: Request, res: Response) => {
    try {
        const { title, slug, content } = req.body;

        const image_urls: string[] = [];
        if (req.files) {
            for (const file of req.files as Express.Multer.File[]) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'bookmyadventure/blogs',
                });
                image_urls.push(result.secure_url);
            }
        }

        const newBlog = new Blog({
            title,
            slug,
            content,
            image_urls,
        });

        await newBlog.save();

        res.status(201).json({ message: 'Blog added successfully.' });
    } catch (error: any) {
        res.status(422).json({ message: 'Error processing request', error: error.message });
    }
};

// @desc    Add Homepage Banners
// @route   POST /admin/add-homepage-banners
// @access  Private
export const addHomepageBanners = async (req: Request, res: Response) => {
    try {
        const image_urls: string[] = [];
        if (req.files) {
            for (const file of req.files as Express.Multer.File[]) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: 'banners',
                    transformation: [{ width: 1800, crop: 'scale' }, { quality: '90' }, { fetch_format: 'webp' }],
                });
                image_urls.push(result.secure_url);
            }
        }

        const newBanner = new Banner({
            image_urls,
        });

        const savedBanner = await newBanner.save();

        res.status(201).json({
            message: 'Banner added successfully.',
            banner_id: savedBanner._id,
            image_count: image_urls.length,
        });
    } catch (error: any) {
        res.status(422).json({ message: 'Error processing request', error: error.message });
    }
};

// @desc    Create New Sub Admin
// @route   POST /admin/create-new-sub-admin
// @access  Private (Main Admin)
export const createNewSubAdmin = async (req: Request, res: Response) => {
    try {
        const { businessName, vendorName, businessEmail, bankAccountNumber, ifscCode, role } = req.body;

        const adminExists = await Admin.findOne({ businessEmail });
        if (adminExists) {
            return res.status(409).json({ message: 'Admin with this email already exists' });
        }

        const newAdmin = new Admin({
            businessName,
            vendorName,
            businessEmail,
            'Admin-Role': role,
            agreementAcceptance: true, // As per python code
        });
        
        // The password is the first part of the auto-generated adminServiceId
        const tempPassword = newAdmin.adminServiceId.split("-")[0];
        newAdmin.password = tempPassword;

        // Encrypt sensitive data
        if (bankAccountNumber) {
            newAdmin.bankAccountNumber = encryptData(bankAccountNumber);
        }
        if (ifscCode) {
            newAdmin.ifscCode = encryptData(ifscCode);
        }

        const createdAdmin = await newAdmin.save();

        // Send email notification
        await sendEmailForAdmin(
            vendorName,
            businessEmail,
            role,
            createdAdmin.adminServiceId,
            createdAdmin.createdAt.toISOString(),
            tempPassword // Sending the temporary password
        );

        res.status(201).json({ message: 'Admin created successfully', data: createdAdmin.adminServiceId });

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: 'Error creating admin', error: error.message });
    }
};

// @desc    Get Admin Data
// @route   GET /admin/get-admin-data
// @access  Private
export const getAdminData = async (req: Request, res: Response) => {
    try {
        console.log("Fetching admin data");
        const admins = await Admin.find({});
        console.log("Admins:", admins);
        res.status(200).json({ data: admins });
    } catch (error: any) {
        res.status(500).json({ message: 'Error retrieving admins', error: error.message });
    }
};

// @desc    Remove Admin Data
// @route   DELETE /admin/remove-admin/:id
// @access  Private
export const removeAdminData = async (req: Request, res: Response) => {
    try {
        const adminId = req.params.id;
        const deletedAdmin = await Admin.findByIdAndDelete(adminId);

        if (!deletedAdmin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json({ message: 'Admin removed successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error removing admin', error: error.message });
    }
};

// @desc    Update Admin Data
// @route   PUT /admin/update-admin-data
// @access  Private
export const updateAdminData = async (req: Request, res: Response) => {
    try {
        const { admin_id, businessName, vendorName, businessEmail, role } = req.body;

        const update_fields: any = {};
        if (businessName) update_fields.businessName = businessName;
        if (vendorName) update_fields.vendorName = vendorName;
        if (businessEmail) update_fields.businessEmail = businessEmail;
        if (role) update_fields['Admin-Role'] = role;

        if (Object.keys(update_fields).length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const updatedAdmin = await Admin.findByIdAndUpdate(admin_id, { $set: update_fields }, { new: true });

        if (!updatedAdmin) {
            return res.status(404).json({ message: 'Admin not found or data is unchanged' });
        }

        res.status(200).json({ message: 'Admin data updated successfully' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating admin data', error: error.message });
    }
};

// @desc    Logout
// @route   POST /admin/logout
// @access  Private
export const logoutAdmin = (req: Request, res: Response) => {
    res.cookie('jwt', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Admin Verify
// @route   GET /admin/get-admin-verify
// @access  Private
export const verifyAdmin = (req: CustomRequest, res: Response) => {
    res.status(200).json({ message: 'success', data: req.admin });
};

// @desc    Vendor Registration
// @route   POST /admin/vendor-registration
// @access  Public
export const vendorRegistration = async (req: Request, res: Response) => {
    try {
        const {
            businessName,
            bankAccNumber,
            vendorCity,
            businessEmail,
            IFSCCode,
            vendorPass,
            pinCode,
            vendorState,
            vendorAcceptance,
            vendorName,
        } = req.body;

        const adminExists = await Admin.findOne({ businessEmail });
        if (adminExists) {
            return res.status(409).json({ message: 'An admin with this email already exists.' });
        }

        const newAdmin = new Admin({
            businessName,
            vendorName,
            businessEmail,
            password: vendorPass, // Mongoose pre-save hook will hash this
            bankAccountNumber: encryptData(bankAccNumber),
            ifscCode: encryptData(IFSCCode),
            vendorCity,
            vendorState,
            pinCode,
            acceptance: vendorAcceptance,
            'Admin-Role': 'Vendor', // Corrected role
        });

        const savedAdmin = await newAdmin.save();

        // Send email notification, but don't fail the request if email fails
        try {
            await sendEmailForAdmin(
                vendorName,
                businessEmail,
                'Vendor',
                savedAdmin.adminServiceId,
                savedAdmin.createdAt.toISOString()
            );
        } catch (emailError: any) {
            console.error('Warning: Failed to send vendor registration email:', emailError);
        }

        res.status(201).json({ message: 'success' });
    } catch (error: any) {
        console.error('Vendor registration error:', error);
        res.status(500).json({ message: 'Error processing registration', error: error.message });
    }
};

// @desc    Get Profile Details
// @route   GET /admin/get-profile-details
// @access  Private
export const getProfileDetails = (req: CustomRequest, res: Response) => {
    res.status(200).json({ message: 'success', data: req.admin });
};

// @desc    Update Subadmin Details
// @route   PUT /admin/update-subadmin-datails
// @access  Private
export const updateSubadminDetails = async (req: CustomRequest, res: Response) => {
    try {
        const {
            businessName,
            username,
            businessEmail,
            userCity,
            userState,
            pinCode,
            previousPass,
            newPass,
        } = req.body;

        const admin = await Admin.findById(req.admin?._id);

        if (admin) {
            if (previousPass && newPass) {
                const isMatch = await admin.matchPassword(previousPass);
                if (!isMatch) {
                    return res.status(401).json({ message: 'Invalid old password' });
                }
                admin.password = newPass;
            }

            admin.businessName = businessName || admin.businessName;
            admin.vendorName = username || admin.vendorName;
            admin.businessEmail = businessEmail || admin.businessEmail;
            admin.vendorCity = userCity || admin.vendorCity;
            admin.vendorState = userState || admin.vendorState;
            admin.pinCode = pinCode || admin.pinCode;

            const updatedAdmin = await admin.save();
            res.status(200).json({ message: 'success', data: updatedAdmin });
        } else {
            res.status(404).json({ message: 'Admin not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating admin data', error: error.message });
    }
};

// @desc    Add New Faqs
// @route   POST /admin/add-new-faqs
// @access  Private
export const addNewFaqs = async (req: CustomRequest, res: Response) => {
    try {
        const { packageId, packageName, packagePrice, packageCategories, faqs } = req.body;

        const existingFaq = await Faq.findOne({ packageId });

        if (existingFaq) {
            existingFaq.faqs = faqs;
            await existingFaq.save();
            res.status(200).json({ message: 'FAQ updated successfully' });
        } else if(req.admin) {
            const newFaq = new Faq({
                packageId,
                packageName,
                packagePrice,
                packageCategories,
                faqs,
                serviceProviderId: req.admin.businessEmail,
            });
            await newFaq.save();
            res.status(201).json({ message: 'FAQ created successfully' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

// @desc    View Faqs
// @route   GET /admin/view-faqs
// @access  Private
export const viewFaqs = async (req: CustomRequest, res: Response) => {
    try {
        let faqs;
        if (req.admin && req.admin['Admin-Role'] === 'main-admin-001') {
            faqs = await Faq.find({});
        } else if (req.admin){
            faqs = await Faq.find({ serviceProviderId: req.admin.businessEmail });
        }
        res.status(200).json({ data: faqs });
    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

// @desc    Get Dashboard Summary
// @route   GET /admin/dashboard-summary
// @access  Private
export const getDashboardSummary = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log("hit dashboard summary");

        const total_packages = await AdventurePackage.countDocuments({});
        const total_bookings = await Booking.countDocuments({});
        const total_subscribers = await Newsletter.countDocuments({});
        const userCount = await User.countDocuments({});

        const businessNameDoc = await Admin
            .findOne({ "Admin-Role": "main-admin-001" })
            .select("businessName -_id");

        const adminRoleDoc = await Admin
            .findOne({ "Admin-Role": "main-admin-001" })
            .select("Admin-Role -_id");

        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5);

        const summary = {
            total_packages,
            total_bookings,
            total_subscribers,
            userCount,
            recentBookings,
            businessName: businessNameDoc?.businessName || "N/A",
            adminRole: adminRoleDoc?.["Admin-Role"] || "N/A",
        };

        console.log("Dashboard Summary:", summary);
        res.status(200).json({ data: summary });

    } catch (error: any) {
        console.error("Error in dashboard summary:", error);
        res.status(500).json({
            message: "An error occurred",
            error: error.message,
        });
    }
};

// @desc    Get New Year Bookings
// @route   GET /admin/newyear-bookings
// @access  Private
export const getNewYearBookings = async (req: Request, res: Response) => {
    try {
        const { skip = 0, limit = 100 } = req.query;
        const bookings = await NewYearBooking.find().skip(parseInt(skip as string)).limit(parseInt(limit as string)).sort({ createdAt: -1 });
        const total_bookings = await NewYearBooking.countDocuments();
        res.status(200).json({
            success: true,
            data: {
                total_bookings,
                skip,
                limit,
                bookings,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred', error: error.message });
    }
};

// @desc    Get New Year Statistics
// @route   GET /admin/newyear-statistics
// @access  Private (Main Admin)
export const getNewYearStatistics = async (req: Request, res: Response) => {
    try {
        const total_bookings = await NewYearBooking.countDocuments({});
        const confirmed_bookings = await NewYearBooking.countDocuments({ booking_status: 'CONFIRMED' });
        const pending_bookings = await NewYearBooking.countDocuments({ payment_status: 'PENDING' });
        const failed_bookings = await NewYearBooking.countDocuments({ payment_status: 'FAILED' });

        const revenueAgg = await NewYearBooking.aggregate([
            {
                $match: { booking_status: 'CONFIRMED' }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        const total_revenue = revenueAgg.length > 0 ? revenueAgg[0].total : 0;

        const available_passes = Math.max(0, 50 - confirmed_bookings);
        const success_rate = total_bookings > 0 ? parseFloat(((confirmed_bookings / total_bookings) * 100).toFixed(2)) : 0;

        const stats = {
            total_bookings,
            confirmed_bookings,
            pending_bookings,
            failed_bookings,
            total_revenue,
            available_passes,
            success_rate,
        };

        res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'An error occurred while fetching statistics', error: error.message });
    }
};