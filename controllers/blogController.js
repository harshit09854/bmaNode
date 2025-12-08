import Blog from '../models/blogModel.js';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: 'Blogs fetched successfully.', data: blogs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// @desc    Get last 5 blog titles and slugs
// @route   GET /api/blogs/know-more
// @access  Public
export const getKnowMoreAboutAdventure = async (req, res) => {
    try {
        const blogs = await Blog.find({}).sort({ createdAt: -1 }).limit(5).select('title slug');
        res.status(200).json({ message: 'Success', data: blogs });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
};
