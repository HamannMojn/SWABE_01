import { Router, json } from 'express';
import { Create, Login, Users } from "../Authentication/authentication-controller"

const router = Router();
router.use(json());

router.post('/user', Create);
router.post('/login', Login);
router.get('/users', Users.list);
router.get('/users/:uid', Users.read);

export { router as AuthenticationRouter }
