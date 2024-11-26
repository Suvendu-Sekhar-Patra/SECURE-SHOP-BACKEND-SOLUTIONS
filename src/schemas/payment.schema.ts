import { number, object , string, TypeOf } from 'zod';


export const makePaymentSchema = object({
    body: object({
      customer_email: string({
        required_error: 'Email address is required',
      }).email('Invalid email address'),
      amount: number({  
        required_error: 'Amount is required',
      }).min(1, 'Amount must be at least 1'),
      expireByMinutes: number({
        required_error: 'Expiry time in minutes is required',
      }).int().min(16,'Time should be greater than 15 mins ' )
    }),
  });


  export const getPaymentStatusSchema = object({
    body: object({
      customer_email: string({
        required_error: 'Email address is required',
      }).email('Invalid email address'),
      paymentId: string({
        required_error: 'Payment id is required',
      }),
    }),
  });
  
export type MakePaymentInput = TypeOf<typeof makePaymentSchema>['body'];
export type GetPaymentStatusInput = TypeOf<typeof getPaymentStatusSchema>['body'];