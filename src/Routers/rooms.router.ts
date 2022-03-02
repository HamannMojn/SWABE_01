import { Router, json } from 'express';

const router = Router();
router.use(json());

export { router as RoomsRouter }