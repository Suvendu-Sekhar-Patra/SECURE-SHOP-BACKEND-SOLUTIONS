import { NextFunction, Request, Response } from "express";
import { findUser, updateUser, sendEmail } from "../services/user.service";
import {
  editUserInput,
  changePasswordInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "../schemas/user.schema";
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    res.status(200).status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (err: any) {
    next(err);
  }
};

export const edituser = async (
  req: Request<{}, {}, editUserInput>,
  res: Response
) => {
  try {
    const user = await findUser({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    } else {
      await updateUser(
        {
          email: user.email,
        },
        {
          name: req.body.name,
          email: req.body.email,
          role: req.body.role,
        }
      );
    }
    return res.status(200).json({
      message: "user profile updated successfully",
    });
  } catch (err: any) {
    return res.status(500).json({
      message: "An error occurred while updating profile.",
      details: err,
    });
  }
};

export const changepassword = async (
  req: Request<{}, {}, changePasswordInput>,
  res: Response
) => {
  try {
    const user = await findUser({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Incorrect old password",
      });
    }
    const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);

    await updateUser(
      {
        email: user.email,
      },
      {
        password: hashedNewPassword,
      }
    );

    return res.status(200).json({
      message: "password changed successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while changing password.",
      details: err,
    });
  }
};

const JWT_SECRET = "your_jwt_secret_key";

export const request_for_forgotpassword = async (
  req: Request<{}, {}, ForgotPasswordInput>,
  res: Response
) => {
  try {
    const user = await findUser({
      email: req.body.email,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "15m" });

    var message = " Token for forgot password ";
    await sendEmail(user.email, message, token);

    return res.status(200).json({
      message: "Email along with Reset Token sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "An error occurred while requesting for forgot password.",
      details: err,
    });
  }
};

export const resetpassword = async (
  req: Request<
    ResetPasswordInput["params"],
    Record<string, never>,
    ResetPasswordInput["body"]
  >,
  res: Response
) => {
  try {
    const decoded = jwt.verify(req.params.resetToken, JWT_SECRET);

    const hashedPassword = await bcrypt.hash(req.body.New_password, 10);

    await updateUser(
      {
        id: decoded.id,
      },
      {
        password: hashedPassword,
      }
    );

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (err) {
    return res.status(400).json({
      message: "Invalid or expired token",
      details: err,
    });
  }
};
