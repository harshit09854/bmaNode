import express from 'express';
import { getHeroBanners } from '../controllers/bannerController.ts';

const router = express.Router();

router.get('/hero', getHeroBanners);

export default router;