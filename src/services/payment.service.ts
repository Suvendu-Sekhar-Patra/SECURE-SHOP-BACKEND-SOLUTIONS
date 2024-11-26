import axios from "axios";
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID!;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET!;

export const createPaymentLink = async (
    payment_url: string,
    user: any,
    params: any
) => {
    try {
        const response = await axios.post(
            payment_url,
            {
                amount: params.amount * 100,
                currency: "INR",
                accept_partial: true,
                reference_id: user.id,
                expire_by: Math.floor(Date.now() / 1000) + params.expireByMinutes * 60,
                customer: {
                    name: user.name,
                    contact: user.mobile_number,
                    email: user.email,
                },
                notify: {
                    sms: true,
                    email: true,
                },
                reminder_enable: true,
            },
            {
                auth: {
                    username: RAZORPAY_KEY_ID,
                    password: RAZORPAY_KEY_SECRET,
                },
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        return {
            data: response.data,
        };
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return {
                code: 500,
                message: "An error occurred while creating the payment link.",
                details: err.response?.data || err.message,
            };
        } else {
            return {
                code: 500,
                details: (err as Error).message,
            };
        }
    }
};

export const getPaymentStatus = async (paymentLinkId: string) => {
    // if(paymentLinkId==null){
    //     return {
    //         code: 400,
    //         message: "Payment link id is required",
    //     };
    // }
    try {
      const response = await axios.get(
        `https://api.razorpay.com/v1/payment_links/${paymentLinkId}`,
        {
          auth: {
            username: RAZORPAY_KEY_ID,
            password: RAZORPAY_KEY_SECRET,
          },
        }
      );
  
      const paymentStatus = response.data.status;
  
      return paymentStatus;
    } catch (err) {
        if (axios.isAxiosError(err)) {
            return {
                code: 500,
                message: "An error occurred while creating the payment link.",
                details: err.response?.data || err.message,
            };
        } else {
            return {
                code: 500,
                details: (err as Error).message,
            };
        }
    }
  };
