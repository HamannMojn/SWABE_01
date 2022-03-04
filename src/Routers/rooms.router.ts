import { Router, json } from 'express';
import { userRole } from '../models/User';
import { Rooms, Create, Delete, Patch } from '../Rooms/rooms-controller';
import { auth, authRole } from '../utils/auth-jwt';

const router = Router();
router.use(json());

router.get('', [auth], Rooms.list);
router.get('/:uid', [auth], Rooms.read);
router.post('/:uid', [authRole([userRole.manager])], Create)
router.delete('/:uid', [authRole([userRole.manager])], Delete)
router.patch('/:uid', [authRole([userRole.manager, userRole.clerk])], Patch)

export { router as RoomsRouter }