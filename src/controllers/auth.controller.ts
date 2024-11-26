import crypto from 'crypto';
import { CookieOptions, NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import {
  ForgotPasswordInput,
  LoginUserInput,
  RegisterUserInput,
  ResetPasswordInput,
  VerifyOtpAndEmailInput,
} from '../schemas/user.schema';
import {
  createUser,
  findUniqueUser,
  findUser,
  // signTokens,
  updateUser,
  sendEmail
} from '../services/user.service';
// import { Prisma } from '@prisma/client';
import config from 'config';
import AppError from '../utils/appError';
// import redisClient from '../utils/connectRedis';
import { signJwt, verifyJwt } from '../utils/jwt';
import { generateOTP, sendOTP, verifyOTP } from '../utils/sendOTP';
// import Email from '../utils/email';

const cookiesOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
};

if (process.env.NODE_ENV === 'production') cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('accessTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('accessTokenExpiresIn') * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>('refreshTokenExpiresIn') * 60 * 1000
  ),
  maxAge: config.get<number>('refreshTokenExpiresIn') * 60 * 1000,
};

export const registerUserHandler = async (
  req: Request<{}, {}, RegisterUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verifyCode = crypto.randomBytes(32).toString('hex');
    const verificationCode = crypto
      .createHash('sha256')
      .update(verifyCode)
      .digest('hex');

    const existingUser = await findUniqueUser(
      { email: req.body.email.toLowerCase() }
    );

    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email already exist, please use another email address'
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 12);

    const user = await createUser({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: hashedPassword,
      verificationCode,
      mobile_number: req.body.mobile_number,
      dob: req.body.dob
    });

    /*const redirectUrl = `${config.get<string>(
       'origin'
     )}/verifyemail/${verifyCode}`;
     try {
       await new Email(user, redirectUrl).sendVerificationCode();
       await updateUser({ id: user.id }, { verificationCode });
 
       res.status(201).json({
         status: 'success',
         message:
           'An email with a verification code has been sent to your email',
       });
     } catch (error) {
       await updateUser({ id: user.id }, { verificationCode: null });
       return res.status(500).json({
         status: 'error',
         message: 'There was an error sending email, please try again',
       });
     }*/
    var message = "verification code for login";
    await sendEmail(req.body.email, message, verifyCode);

    const OTP = await generateOTP();
    const msg = await sendOTP(req.body.mobile_number, OTP);
    console.log(msg)

    res.status(200).json({
      status: 'success',
      message: 'User Registered & sending Verification code  via email successful . also otp sended to the phone no.'
    });

  } catch (err: any) {
    return res.status(409).json({
      status: 'fail',
      message: 'Error occoured while registeering user',
      error: err.message
    });
  }
};

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {

    const user = await findUniqueUser(
      { email: req.body.email.toLowerCase() },
      { id: true, email: true, mobile_number: true, verified: true, password: true }
    );

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }


    // Check if user is verified
    if (!user.verified) {
      return next(
        new AppError(
          401,
          'You are not verified, please verify your email and phone otp to login'
        )
      );
    }

    if (!(await bcrypt.compare(req.body.password, user.password))) {
      return next(new AppError(400, 'Invalid email or password'));
    }

    // Sign Tokens
    // const { access_token, refresh_token } = await signTokens(user);
    // res.cookie('access_token', access_token, accessTokenCookieOptions);
    // res.cookie('refresh_token', refresh_token, refreshTokenCookieOptions);
    /*res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });
    */

    res.status(200).json({
      status: 'Login successful',
      data: user
      // access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = 'Could not refresh access token';

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      'refreshTokenPublicKey'
    );

    if (!decoded) {
      return next(new AppError(403, message));
    }

    // Check if user has a valid session
    // const session = await redisClient.get(decoded.sub);

    // if (!session) {
    //   return next(new AppError(403, message));
    // }

    // Check if user still exist
    // const user = await findUniqueUser({ id: JSON.parse(session).id });
    const user = await findUniqueUser({ id: decoded.sub });
    if (!user) {
      return next(new AppError(403, message));
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, 'accessTokenPrivateKey', {
      expiresIn: `${config.get<number>('accessTokenExpiresIn')}m`,
    });

    // 4. Add Cookies
    res.cookie('access_token', access_token, accessTokenCookieOptions);
    res.cookie('logged_in', true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 5. Send response
    res.status(200).json({
      status: 'success',
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

function logout(res: Response) {
  res.cookie('access_token', '', { maxAge: 1 });
  res.cookie('refresh_token', '', { maxAge: 1 });
  res.cookie('logged_in', '', { maxAge: 1 });
}

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // await redisClient.del(res.locals.user.id);
    logout(res);

    res.status(200).json({
      status: 'success',
    });
  } catch (err: any) {
    next(err);
  }
};

export const verifyOtpAndEmailHandler = async (
  req: Request<VerifyOtpAndEmailInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const verificationCode = crypto
      .createHash('sha256')
      .update(req.params.verificationCode)
      .digest('hex');

    const user = await findUser({ verificationCode });

    if (!user) {
      return next(new AppError(401, 'Could not verify email & otp'));
    }


    const otpResult = verifyOTP(user.mobile_number, req.params.otp);

    if (otpResult.status !== 'success') {
      return res.status(400).json({
        status: otpResult.status,
        message: otpResult.message,
        otpSent: otpResult.otpSent || false, 
      });
    }
    await updateUser(
      { verificationCode },
      { verified: true, verificationCode: null },
      { email: true }
    );



    res.status(200).json({
      status: 'success',
      message: 'Email & otp verified successfully',
    });
  } catch (err: any) {
    if (err.code === 'P2025') {
      return res.status(403).json({
        status: 'fail',
        message: `Verification code is invalid or user doesn't exist`,
      });
    }
    next(err);
  }
};
/*
export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get the user from the collection
    const user = await findUser({ email: req.body.email.toLowerCase() });
    const message =
      'You will receive a reset email if user with that email exist';
    if (!user) {
      return res.status(200).json({
        status: 'success',
        message,
      });
    }

    if (!user.verified) {
      return res.status(403).json({
        status: 'fail',
        message: 'Account not verified',
      });
    }

    if (user.provider) {
      return res.status(403).json({
        status: 'fail',
        message:
          'We found your account. It looks like you registered with a social auth account. Try signing in with social auth.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await updateUser(
      { id: user.id },
      {
        passwordResetToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { email: true }
    );

    try {
      const url = `${config.get<string>('origin')}/resetpassword/${resetToken}`;
      await new Email(user, url).sendPasswordResetToken();

      res.status(200).json({
        status: 'success',
        message,
      });
    } catch (err: any) {
      await updateUser(
        { id: user.id },
        { passwordResetToken: null, passwordResetAt: null },
        {}
      );
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending email',
      });
    }
  } catch (err: any) {
    next(err);
  }
};
*/

export const forgotPasswordHandler = async (
  req: Request<
    Record<string, never>,
    Record<string, never>,
    ForgotPasswordInput
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await findUser({ email: req.body.email.toLowerCase() });
    const message =
      'You will receive a reset email if user with that email exist';

    if (!user || !user.verified) {
      return res.status(404).json({
        status: 'Fail',
        message: 'user does not exist or  Account not verified',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    await updateUser(
      { id: user.id },
      {
        passwordResetToken,
        passwordResetAt: new Date(Date.now() + 10 * 60 * 1000),
      },
      { email: true }
    );

    try {
      var info = "password reset token"
      await sendEmail(user.email, info, resetToken);

      res.status(200).json({
        status: 'success',
        message,
      });
    } catch (err: any) {
      await updateUser(
        { id: user.id },
        { passwordResetToken: null, passwordResetAt: null },
        {}
      );
      return res.status(500).json({
        status: 'error',
        message: 'There was an error sending email',
      });
    }
  } catch (err: any) {
    next(err);
  }
};



export const resetPasswordHandler = async (
  req: Request<
    ResetPasswordInput['params'],
    Record<string, never>,
    ResetPasswordInput['body']
  >,
  res: Response,
  next: NextFunction
) => {
  try {
    const passwordResetToken = crypto
      .createHash('sha256')
      .update(req.params.resetToken)
      .digest('hex');

    const user = await findUser({
      passwordResetToken,
      passwordResetAt: {
        gt: new Date(),
      },
    });

    if (!user) {
      return res.status(403).json({
        status: 'fail',
        message: 'Invalid token or token has expired',
      });
    }

    const hashedPassword = await bcrypt.hash(req.body.New_password, 12);
    // Change password data
    await updateUser(
      {
        id: user.id,
      },
      {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetAt: null,
      },
      { email: true }
    );

    logout(res);
    res.status(200).json({
      status: 'success',
      message: 'Password data updated successfully',
    });
  } catch (err: any) {
    next(err);
  }
};
