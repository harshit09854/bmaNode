import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// 1. Define an interface for the User document
export interface IUser extends Document {
    name: string;
    username: string;
    email: string;
    userphone?: string;
    password?: string; // Password can be optional for Google login, but will be hashed if provided
    profile_picture?: string;
    bio?: string;
    'T&C'?: boolean;
    issuer?: string;
    authorized_party?: string;
    subject?: string;
    jwtID?: string;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

// 2. Create the Mongoose schema
const userSchema: Schema = new mongoose.Schema(
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

// 3. Add methods to the schema
userSchema.methods.matchPassword = async function (this: IUser, enteredPassword: string): Promise<boolean> {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Add pre-save hook for password encryption
userSchema.pre('save', async function (this: IUser, next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) {
        next();
    }
    if (this.password) { // Ensure password exists before hashing
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// 5. Create and export the Mongoose Model
const User = mongoose.model<IUser>('User', userSchema, 'customer');

export default User;
