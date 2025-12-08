import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
            unique: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        userphone: {
            type: String,
        },
        password: {
            type: String,
        },
        profile_picture: {
            type: String,
        },
        bio: {
            type: String,
        },
        'T&C': {
            type: Boolean,
            default: true,
        },
        issuer: {
            type: String,
        },
        authorized_party: {
            type: String,
        },
        subject: {
            type: String,
        },
        jwtID: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', userSchema, 'customer'); // Explicitly setting collection name to 'customer'

export default User;
