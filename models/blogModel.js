
import mongoose from 'mongoose';

const blogSchema = mongoose.Schema(
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
            type: Array,
        },
    },
    {
        timestamps: true,
    }
);

const Blog = mongoose.model('Blog', blogSchema, 'blogs');



export default Blog;
