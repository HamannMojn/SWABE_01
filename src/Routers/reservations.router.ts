import { Router, json } from 'express';
import { userRole } from '../models/User';
import { Create, Reservations, Delete, Patch } from '../Reservations/reservations-controller';
import { auth, authRole } from '../utils/auth-jwt';

const router = Router();
router.use(json());

router.get('', [authRole([userRole.manager, userRole.clerk])], Reservations.list);
router.get('/:uid', [auth], Reservations.read);
router.post('/', [auth], Create)
router.delete('/:uid', [authRole([userRole.manager, userRole.clerk])], Delete)
router.patch('/:uid', [authRole([userRole.manager, userRole.clerk])], Patch)

export { router as ReservationsRouter }