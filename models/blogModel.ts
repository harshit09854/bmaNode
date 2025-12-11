import mongoose, { Document, Schema } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    slug: string;
    content: string;
    image_urls?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const blogSchema: Schema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
        },
        content: {
            type: String,
            required: true,
        },
        image_urls: {
            type: [String],
        },
    },
    {
        timestamps: true,
    }
);

const Blog = mongoose.model<IBlog>('Blog', blogSchema, 'blogs');

export default Blog;