
import User from '../models/userModel.js';
import Newsletter from '../models/newsletterModel.js';
import { createAccessToken } from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

const client = new OAuth2Client(process.env.CLIENT_ID);

// @desc    Google Login
// @route   POST /api/auth/google-login
// @access  Public
export const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.CLIENT_ID,
        });
        const { name, email, picture, sub, azp, jti, given_name } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                username: given_name,
                profile_picture: picture,
                subject: sub,
                authorized_party: azp,
                jwtID: jti,
                'T&C': true,
            });
            await user.save();
        }

        const userToken = createAccessToken({
            userId: user._id,
            userName: user.name,
            userEmail: user.email,
        });

        res.status(200).json({ token: userToken });

    } catch (error) {
        res.status(400).json({ message: 'Invalid Google token.' });
    }
};

// @desc    User Register
// @route   POST /api/auth/user-register
// @access  Public
export const userRegister = async (req, res) => {
    const { firstname, lastname, useremail, userphone, password } = req.body;

    try {
        const userExists = await User.findOne({ email: useremail });

        if (userExists) {
            return res.status(400).json({ message: 'User already created!' });
        }

        let username = firstname + userphone.slice(-2);
        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            const randomNumber = Math.floor(Math.random() * 200) + 1;
            username = `${username}${String(randomNumber).padStart(2, '0')}`;
        }

        const user = new User({
            name: `${firstname} ${lastname}`,
            username,
            email: useremail,
            userphone,
            password,
            'T&C': true,
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        const createdUser = await user.save();

        const token = createAccessToken({
            userId: createdUser._id,
            userEmail: createdUser.email,
        });

        res.status(201).json({ token, username });

    } catch (error) {
        res.status(500).json({ message: 'Server error during registration.', error: error.message });
    }
};

// @desc    User Login
// @route   POST /api/auth/user-login
// @access  Public
export const userLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            const token = createAccessToken({
                userId: user._id,
                userEmail: user.email,
            });
            res.status(200).json({ accesstoken: token, success: true });
        } else {
            res.status(400).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during login.', error: error.message });
    }
};

// @desc    Validate User
// @route   POST /api/auth/validate-user
// @access  Private
export const validateUser = (req, res) => {
    if (req.user) {
        res.status(200).json({ success: true, customer_name: req.user.name });
    } else {
        res.status(404).json({ message: 'User not found' });
    }
};

// @desc    Customer Logout
// @route   DELETE /api/customer-logout
// @access  Private
export const customerLogout = (req, res) => {
    res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Update User Details
// @route   PUT /api/update-user-details
// @access  Private
export const updateUserDetails = async (req, res) => {
    const { nickname, email, phone, userbio } = req.body;
    const userId = req.user._id;

    try {
        const user = await User.findById(userId);

        if (user) {
            user.username = nickname || user.username;
            user.email = email || user.email;
            user.userphone = phone || user.userphone;
            user.bio = userbio || user.bio;

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'user-profile',
                    transformation: [{ width: 800, quality: 'auto' }],
                });
                user.profile_picture = result.secure_url;
            }

            const updatedUser = await user.save();

            res.status(200).json({
                status: 'success',
                message: 'Profile updated successfully.',
                data: updatedUser,
            });
        } else {
            res.status(404).json({ status: 'error', message: 'User not found.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
};

// @desc    View User Details
// @route   GET /api/view-user-details
// @access  Private
export const viewUserDetails = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            const userData = {
                id: user._id,
                name: user.name,
                email: user.email,
                given_name: user.username,
                userphone: user.userphone,
                profileBio: user.bio,
                profilePic: user.profile_picture,
            };
            res.status(200).json({ data: userData });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred. Not Authenticated.' });
    }
};

// @desc    Subscribe to newsletter
// @route   POST /api/users/subscribe
// @access  Public
export const subscribeByUser = async (req, res) => {
    try {
        const { email, deviceInfo } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required.' });
        }

        const existingSubscriber = await Newsletter.findOne({ email });
        if (existingSubscriber) {
            return res.status(200).json({ message: 'Already subscribed!' });
        }

        const newSubscriber = new Newsletter({
            email,
            deviceInfo,
        });

        await newSubscriber.save();
        res.status(201).json({ message: 'Subscribed successfully!' });

    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error.', error: error.message });
    }
};
