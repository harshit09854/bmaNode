import mongoose from 'mongoose';

const adventureRatingSchema = new mongoose.Schema({
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

const AdventureRating = mongoose.model('AdventureRating', adventureRatingSchema,'adventureRatings');

export default AdventureRating;
