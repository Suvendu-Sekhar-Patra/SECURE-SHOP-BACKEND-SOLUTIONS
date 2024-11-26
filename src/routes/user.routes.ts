import express from 'express';
import { getMeHandler, edituser, changepassword, request_for_forgotpassword, resetpassword } from '../controllers/user.controller';
// import { deserializeUser } from '../middleware/deserializeUser';
// import { requireUser } from '../middleware/requireUser';
import { validate } from '../middleware/validate';
import { editUserSchema, changePasswordSchema, forgotPasswordSchema, resetPasswordSchema } from '../schemas/user.schema'

const router = express.Router();

// router.use(deserializeUser, requireUser);

router.get('/me', getMeHandler);

router.post('/edituser', validate(editUserSchema), edituser);
router.post('/changePassword', validate(changePasswordSchema), changepassword);
router.post('/forgotPassword', validate(forgotPasswordSchema), request_for_forgotpassword);
router.post('/resetPassword/:resetToken', validate(resetPasswordSchema), resetpassword);

export default router;
