import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

// 1. Define an interface for the Admin document
export interface IAdmin extends Document {
    adminServiceId: string;
    businessName: string;
    vendorName?: string;
    businessEmail: string;
    password?: string;
    'Admin-Role': string;
    bankAccountNumber?: string;
    ifscCode?: string;
    vendorCity?: string;
    vendorState?: string;
    pinCode?: string;
    acceptance?: string;
    createdAt: Date;
    updatedAt: Date;
    matchPassword(enteredPassword: string): Promise<boolean>;
}

// 2. Create the Mongoose schema
const adminSchema: Schema = new mongoose.Schema(
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

// 3. Add methods to the schema
adminSchema.methods.matchPassword = async function (this: IAdmin, enteredPassword: string): Promise<boolean> {
    if (!this.password) {
        return false;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

// 4. Add pre-save hook for password encryption
adminSchema.pre('save', async function (this: IAdmin, next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (!this.isModified('password')) {
        next();
    }
    if (this.password) { // Ensure password exists before hashing
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

// 5. Create and export the Mongoose Model
const Admin = mongoose.model<IAdmin>('Admin', adminSchema, 'admins');

export default Admin;