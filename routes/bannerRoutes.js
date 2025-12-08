import express from 'express';
import { getHeroBanners } from '../controllers/bannerController.js';

const router = express.Router();

router.get('/hero', getHeroBanners);

export default router;
