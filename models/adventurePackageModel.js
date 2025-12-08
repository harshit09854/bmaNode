import mongoose from 'mongoose';

const adventurePackageSchema = new mongoose.Schema(
  {
    name: String,
    location: String,
    price: String, // Python me string tha
    description: String,
    Category: String,
    status: String,
    slots: String,
    reporting_time: String,
    starting_point: String,

    highlights: [String],  // Python: highlights
    Includes: [String],    // Python: Includes
    tags: [String],        // Python: tags
    certificate_name: String,
    images: [String],      // Python: images

    From: String,
    To: String,
  },
  { timestamps: true }
);

const AdventurePackage = mongoose.model(
  'AdventurePackage',
  adventurePackageSchema,
  'adventurePackages' // ← EXACT SAME COLLECTION NAME
);
export default AdventurePackage;
