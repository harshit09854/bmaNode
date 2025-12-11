import mongoose, { Document, Schema } from 'mongoose';

// 1. Define an interface for the AdventurePackage document
export interface IAdventurePackage extends Document {
  name?: string;
  location?: string;
  price?: string; // Python me string tha
  description?: string;
  Category?: string;
  status?: string;
  slots?: string;
  reporting_time?: string;
  starting_point?: string;
  highlights?: string[];
  Includes?: string[];
  tags?: string[];
  certificate_name?: string;
  images?: string[];
  From?: string;
  To?: string;
  createdAt: Date;
  updatedAt: Date;
  serviceProvider?: string; // Added serviceProvider as observed in adminController
  image_paths?: string[]; // Added image_paths as observed in adminController
}

// 2. Create the Mongoose schema
const adventurePackageSchema: Schema = new mongoose.Schema(
  {
    name: { type: String },
    location: { type: String },
    price: { type: String },
    description: { type: String },
    Category: { type: String },
    status: { type: String },
    slots: { type: String },
    reporting_time: { type: String },
    starting_point: { type: String },

    highlights: { type: [String] },
    Includes: { type: [String] },
    tags: { type: [String] },
    certificate_name: { type: String },
    images: { type: [String] },
    image_paths: { type: [String] }, // Added as observed in adminController
    serviceProvider: { type: String }, // Added as observed in adminController

    From: { type: String },
    To: { type: String },
  },
  { timestamps: true }
);

// 3. Create and export the Mongoose Model
const AdventurePackage = mongoose.model<IAdventurePackage>(
  'AdventurePackage',
  adventurePackageSchema,
  'adventurePackages'
);
export default AdventurePackage;