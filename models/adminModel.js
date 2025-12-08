import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const adminSchema = mongoose.Schema(
    {
        adminServiceId: {
            type: String,
            default: () => uuidv4(),
            unique: true,
        },
        businessName: {
            type: String,
            required: true,
        },
        vendorName: {
            type: String,
        },
        businessEmail: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        'Admin-Role': {
            type: String,
            required: true,
        },
        bankAccountNumber: {
            type: String,
        },
        ifscCode: {
            type: String,
        },
        vendorCity: {
            type: String,
        },
        vendorState: {
            type: String,
        },
        pinCode: {
            type: String,
        },
        acceptance: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Match user entered password to hashed password in database
adminSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
adminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

const Admin = mongoose.model('Admin', adminSchema,'admins') // ← EXACT SAME COLLECTION NAME);

export default Admin;


