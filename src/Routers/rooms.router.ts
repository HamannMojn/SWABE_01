import { Router, json } from 'express';
import { userRole } from '../models/User';
import { Rooms, Create } from '../Rooms/rooms-controller';
import { auth, authRole } from '../utils/auth-jwt';

const router = Router();
router.use(json());

router.get('', [auth], Rooms.list);
router.get('/:uid', [auth], Rooms.read);
router.post('/:uid', [authRole([userRole.manager])], Create)

export { router as RoomsRouter }