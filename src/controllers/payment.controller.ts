import { Request, Response } from "express";
import { findUser, sendEmail, updateUser } from "../services/user.service";
import { MakePaymentInput, GetPaymentStatusInput } from "../schemas/payment.schema"

import {
  createPaymentLink,
  getPaymentStatus,
} from "../services/payment.service";


export const makeUpiPayment = async (req: Request<{}, {}, MakePaymentInput>, res: Response) => {
  const { amount, customer_email, expireByMinutes } = req.body;

  try {
    const user = await findUser({
      email: customer_email,
    });
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: "User not found.",
      });
    }

    const result = await createPaymentLink(
      process.env.RAZORPAY_pAYMENT_LINK!,
      user,
      {
        amount,
        expireByMinutes,
      }
    );

    var subject = "Your UPI Payment Link";
    await sendEmail(user.email, subject, result.data.short_url);

    return res.status(201).json({
      code: 201,
      message: "Payment link created and sended over email",
      data: result,
    });
  } catch (err) {
    return res.status(500).json({
      details: err,
    });
  }
};




export const checkpaymentStatus = async (req: Request<{}, {}, GetPaymentStatusInput>, res: Response) => {
  try {
    const user = await findUser({
      email: req.body.customer_email,
    });
    if (!user) {
      return res.send({
        status: 404,
        message: "User not found.",
      });
    }

    const paymentStatus = await getPaymentStatus(req.body.paymentId);

    if (paymentStatus === "paid") {
      await updateUser(
        {
          email: user.email,
        },
        {
          isactive: true,
        }
      );
      return res.status(200).json({
        code: 200,
        message: "Payment received. User status updated to active.",
      });
    } else {
      return res.status(400).json({
        code: 400,
        message: "Payment not completed.",
      });
    }
  } catch (statusError) {
    return res.status(500).json({
      code: 500,
      message: "Incorrect payment id or An error occurred while checking payment status.",
      details: statusError,
    });
  }
}
