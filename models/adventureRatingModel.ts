import mongoose, { Document, Schema, Types } from 'mongoose';

// 1. Define an interface for the AdventureRating document
export interface IAdventureRating extends Document {
    adventure: Types.ObjectId;
    user: Types.ObjectId;
    username: string;
    rating: number;
    comment: string;
    createdAt: Date;
    updatedAt: Date;
}

// 2. Create the Mongoose schema
const adventureRatingSchema: Schema = new mongoose.Schema({
    adventure: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AdventurePackage',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5,
    },
    comment: {
        type: String,
        required: true,
    },
}, {
    timestamps: true, // Adds createdAt and updatedAt timestamps
});

// 3. Create and export the Mongoose Model
const AdventureRating = mongoose.model<IAdventureRating>('AdventureRating', adventureRatingSchema, 'adventureRatings');

export default AdventureRating;