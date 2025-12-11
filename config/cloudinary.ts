import { v2 as cloudinary } from "cloudinary";
import type { ConfigOptions } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// TypeScript ke liye environment variables ko assert kar dete hain
const cloudinaryConfig: ConfigOptions = {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
    api_key: process.env.CLOUDINARY_API_KEY as string,
    api_secret: process.env.CLOUDINARY_API_SECRET as string,
};

// Cloudinary ko config karo
cloudinary.config(cloudinaryConfig);

export default cloudinary;
