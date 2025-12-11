import type { Request, Response } from 'express';
import AdventurePackage from '../models/adventurePackageModel.ts';
import type { IAdventurePackage } from '../models/adventurePackageModel.ts';
import Admin from '../models/adminModel.ts';

// @desc    Get Trending Adventures
// @route   GET /api/adventures/trending-adventures
// @access  Public
export const getTrendingAdventures = async (req: Request, res: Response) => {
    console.log("Fetching trending adventures");
    try {
        const adventures: IAdventurePackage[] = await AdventurePackage.find({ status: 'Active' })
            .sort({ createdAt: -1 })
            .limit(5);
        console.log("Trending adventures retrieved:", adventures);
        res.status(200).json({ message: 'Adventures fetched successfully', data: adventures });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching trending adventures', error: error.message });
    }
};

// @desc    Get Adventure Details by name
// @route   GET /api/adventures/trending/adventure-details/:adventure_name
// @access  Public
export const getAdventureDetails = async (req: Request, res: Response) => {
    console.log("Fetching adventure details for:", req.params.adventure_name);
    try {
        const adventure: IAdventurePackage | null = await AdventurePackage.findOne({ name: req.params.adventure_name });
        if (adventure) {
            res.status(200).json({ message: 'Adventure fetched successfully', data: adventure });
        } else {
            res.status(404).json({ message: 'Adventure not found' });
        }
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching adventure details', error: error.message });
    }
};

const getDaysDifference = (from?: string, to?: string): number | null => {
    console.log("From:", from, "To:", to);
    if (!from || !to) return null;
    try {
        const fromDate = new Date(from);
        const toDate = new Date(to);
        const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    } catch (e) {
        return null;
    }
};

// @desc    Get Upcoming Adventures
// @route   GET /api/adventures/upcoming-adventures
// @access  Public
export const getUpcomingAdventures = async (req: Request, res: Response) => {
    console.log("Fetching upcoming adventures");
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to the beginning of the day

        const adventures: IAdventurePackage[] = await AdventurePackage.find({
            createdAt: { $gte: today },
            status: 'Active',
        }).sort({ From: 1 });

        const formattedAdventures = adventures.map(item => ({
            id: item._id,
            image: item.image_paths,
            name: item.name,
            price: item.price,
            days: getDaysDifference(item.From, item.To),
            place: item.location,
            description: item.description,
        }));

        res.status(200).json({ message: 'Upcoming adventures fetched successfully', data: formattedAdventures });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching upcoming adventures', error: error.message });
    }
};

// @desc    Get Homepage Upcoming Adventures
// @route   GET /api/adventures/homepage-upcoming-adventures
// @access  Public
export const getHomepageUpcomingAdventures = async (req: Request, res: Response) => {
    console.log("Fetching homepage upcoming adventures");
    try {
        const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD

        const adventures: IAdventurePackage[] = await AdventurePackage.find({
            From: { $gte: today },
            status: 'Active',
        }).sort({ From: 1 }).limit(4);

        const formattedAdventures = adventures.map(item => ({
            id: item._id,
            image: item.image_paths,
            name: item.name,
            price: item.price,
            days: getDaysDifference(item.From, item.To),
            place: item.location,
        }));

        res.status(200).json({ message: 'Upcoming adventures fetched successfully', data: formattedAdventures });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching homepage upcoming adventures', error: error.message });
    }
};

// @desc    Get Adventures By Category
// @route   GET /api/adventures/adventures-by-category/:category
// @access  Public
export const getAdventuresByCategory = async (req: Request, res: Response) => {

    console.log("Category Slug:", req.params.category);
    try {
        const category_mapping: { [key: string]: string | string[] } = {
            "land-adventures": "Land Adventures",
            "water-adventures": "Water Adventures",
            "air-adventure": "Air Adventures",
            "courses": "Courses & Training",
            "extreme-adventures": "Extreme Adventures",
            "caravan": "Caravan",
            "adventure-trips": ["Extreme Adventures", "Air Adventures", "Water Adventures"],
            "adventure-park": ["Extreme Adventures", "Urban & Cultural Adventures"]
        };

        const categorySlug = req.params.category.toLowerCase();
        const categoryName = category_mapping[categorySlug];

        if (!categoryName) {
            return res.status(400).json({ message: "Invalid category slug" });
        }

        const query: any = {
            Category: Array.isArray(categoryName) ? { $in: categoryName } : categoryName,
            status: "Active"
        };

        const adventures: IAdventurePackage[] = await AdventurePackage.find(query);

        const formattedAdventures = adventures.map(item => ({
            id: item._id,
            image: item.image_paths,
            name: item.name,
            price: item.price,
            days: getDaysDifference(item.From, item.To),
            place: item.location,
            category: item.Category,
            description: item.description,
            slots: item.slots
        }));

        res.status(200).json({
            message: `Adventures fetched successfully for ${categorySlug}`,
            data: formattedAdventures,
        });

    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching adventures by category', error: error.message });
    }
};

// @desc    Get Adventure Courses
// @route   GET /api/adventures/get-adventure-courses
// @access  Public
export const getAdventureCourses = async (req: Request, res: Response) => {
    console.log("Fetching adventure courses");
    try {
        const courses: IAdventurePackage[] = await AdventurePackage.find({
            Category: "Courses & Training",
            status: "Active"
        });

        const formattedCourses = courses.map(item => ({
            id: item._id,
            image: item.image_paths,
            name: item.name,
            price: item.price,
            days: getDaysDifference(item.From, item.To),
            place: item.location,
            description: item.description,
            certificate_name: item.certificate_name
        }));

        res.status(200).json({
            message: "Adventure courses fetched successfully",
            data: formattedCourses
        });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching adventure courses', error: error.message });
    }
};

// @desc    View all Adventure Packages
// @route   GET /api/adventures/view-adventure-packages
// @access  Public
export const viewAdventurePackages = async (req: Request, res: Response) => {
    console.log("Fetching all adventure packages");
    try {
        const packages: IAdventurePackage[] = await AdventurePackage.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: 'Adventures fetched successfully', data: packages });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching packages', error: error.message });
    }
};

// @desc    Fetch Homepage Vendors
// @route   GET /api/adventures/fetch-homepage-vendors
// @access  Public
export const fetchHomepageVendors = async (req: Request, res: Response) => {
    console.log("Fetching homepage vendors");
    try {
        const vendors = await Admin.find({ 'Admin-Role': { $ne: 'main-admin-001' } });
        
        const results = [];

        for (const vendor of vendors) {
            const latestPackage = await AdventurePackage.findOne({ serviceProvider: vendor.adminServiceId })
                .sort({ createdAt: -1 });
            
            const packageCount = await AdventurePackage.countDocuments({ serviceProvider: vendor.adminServiceId });

            results.push({
                businessName: vendor.businessName,
                adminServiceId: vendor.adminServiceId,
                thumbnail: latestPackage && latestPackage.image_paths ? latestPackage.image_paths[0] : null,
                packageCount: packageCount,
            });
        }
        
        res.status(200).json(results);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching homepage vendors', error: error.message });
    }
};

// @desc    Fetch Vendor Packages
// @route   GET /api/adventures/fetch-vendor-packages
// @access  Public
export const fetchVendorPackages = async (req: Request, res: Response) => {
    console.log("Fetching vendor packages for ID:", req.query.id);
    try {
        const serviceProviderId = req.query.id as string;
        if (!serviceProviderId) {
            return res.status(400).json({ message: 'Service provider ID is required' });
        }

        const packages: IAdventurePackage[] = await AdventurePackage.find({ serviceProvider: serviceProviderId });

        if (!packages || packages.length === 0) {
            return res.status(404).json({ message: 'No packages found for this provider' });
        }
        
        const formattedPackages = packages.map(pkg => ({
            _id: pkg._id,
            name: pkg.name,
            description: pkg.description,
            image_paths: pkg.image_paths,
            price: pkg.price,
            location: pkg.location,
        }));

        res.status(200).json({ packages: formattedPackages });

    } catch (error: any) {
        res.status(500).json({ message: 'An error occurred while fetching vendor packages', error: error.message });
    }
};
