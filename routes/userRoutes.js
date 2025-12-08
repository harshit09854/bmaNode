
import express from 'express';
import {
    googleLogin,
    userRegister,
    userLogin,
    validateUser,
    customerLogout,
    updateUserDetails,
    viewUserDetails,
    subscribeByUser,
} from '../controllers/userController.js';
import { protectUser } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post('/auth/google-login', googleLogin);
router.post('/auth/user-register', userRegister);
router.post('/auth/user-login', userLogin);
router.post('/auth/validate-user', protectUser, validateUser);
router.delete('/customer-logout', protectUser, customerLogout);
router.put('/update-user-details', protectUser, upload.single('profileImage'), updateUserDetails);
router.get('/view-user-details', protectUser, viewUserDetails);
router.post('/subscribe', subscribeByUser);


export default router;
