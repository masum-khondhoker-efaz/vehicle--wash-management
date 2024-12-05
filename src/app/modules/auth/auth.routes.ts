import express from 'express';
import validateRequest from '../../middlewares/validateRequest';
import { AuthControllers } from '../auth/auth.controller';
import { authValidation } from '../auth/auth.validation';
import auth from '../../middlewares/auth';
const router = express.Router();

router.post(
  '/login',
  validateRequest(authValidation.loginUser),
  AuthControllers.loginUser,
);

router.post(
  '/logout',
  auth(),
  AuthControllers.logOutUser,
);

export const AuthRouters = router;
