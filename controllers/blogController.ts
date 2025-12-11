import type { Request, Response } from 'express';
import Blog from '../models/blogModel.ts';
import type { IBlog } from '../models/blogModel.ts';

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req: Request, res: Response) => {
    try {
        const blogs: IBlog[] = await Blog.find({}).sort({ createdAt: -1 });
        res.status(200).json({ message: 'Blogs fetched successfully.', data: blogs });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching blogs', error: error.message });
    }
};

// @desc    Get last 5 blog titles and slugs
// @route   GET /api/blogs/know-more
// @access  Public
export const getKnowMoreAboutAdventure = async (req: Request, res: Response) => {
    try {
        const blogs: IBlog[] = await Blog.find({}).sort({ createdAt: -1 }).limit(5).select('title slug');
        res.status(200).json({ message: 'Success', data: blogs });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
};