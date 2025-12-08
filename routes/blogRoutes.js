import express from 'express';
import {
    getBlogs,
    getKnowMoreAboutAdventure,
} from '../controllers/blogController.js';

const router = express.Router();

router.get('/', getBlogs);
router.get('/know-more', getKnowMoreAboutAdventure);

export default router;
