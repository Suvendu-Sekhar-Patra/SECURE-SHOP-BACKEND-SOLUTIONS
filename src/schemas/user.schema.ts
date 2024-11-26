import { object , string, TypeOf, z } from 'zod';

enum RoleEnumType {
  ADMIN = 'admin',
  USER = 'user',
}

export const registerUserSchema = object({
  body: object({
    name: string({
      required_error: 'Name is required',
    }),
    email: string({
      required_error: 'Email address is required',
    }).email('Invalid email address'),
    mobile_number: string({
      required_error: 'Mobile number is required',
    }).length(10, 'Mobile number must be exactly 10 characters'),
    dob: string({
      required_error: 'Date of birth is required',
    }),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Password must be more than 8 characters')
      .max(32, 'Password must be less than 32 characters'),
    passwordConfirm: string({
      required_error: 'Please confirm your password',
    }),
    role: z.optional(z.nativeEnum(RoleEnumType)),
  }).refine((data) => data.password === data.passwordConfirm, {
    path: ['passwordConfirm'],
    message: 'Passwords do not match',
  }),
});

export const loginUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email address is required',
    }).email('Invalid email address'),
    password: string({
      required_error: 'Password is required',
    }).min(8, 'Invalid email or password')
  }),
});

export const editUserSchema = object({
  body: object({
    email: string({
      required_error: 'Email address is required',
    }).email('Invalid email address'),
    name: string({
      required_error: 'Name is required',
    }),
    role: z.optional(z.nativeEnum(RoleEnumType)),
  }),
});

export const verifyOtpAndEmailSchema = object({
  params: object({
    verificationCode: string(),
    otp:string(),
  }),
});

export const updateUserSchema = object({
  body: object({
    name: string({}),
    email: string({}).email('Invalid email address'),
    password: string({})
      .min(8, 'Password must be more than 8 characters')
      .max(32, 'Password must be less than 32 characters'),
    passwordConfirm: string({}),
    role: z.optional(z.nativeEnum(RoleEnumType)),
  })
    .partial()
    .refine((data) => data.password === data.passwordConfirm, {
      path: ['passwordConfirm'],
      message: 'Passwords do not match',
    }),
});

export const forgotPasswordSchema = object({
  body: object({
    email: string({
      required_error: 'Email is required',
    }).email('Email is invalid'),
  }),
});

export const resetPasswordSchema = object({
  params: object({
    resetToken: string(),
  }),
  body: object({
    New_password: string({
      required_error: 'New Password is required',
    }).min(8, 'Password must be more than 8 characters'),
    passwordConfirm: string({
      required_error: 'Please confirm your password',
    }),
  }).refine((data) => data.New_password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  }),
});

export const changePasswordSchema = object({
  body: object({
    email: string({
      required_error: 'Email address is required',
    }).email('Invalid email address'),
    oldPassword: string({
      required_error: 'Old password is required',
    }).min(8, 'Old password must be more than 8 characters'),
    newPassword: string({
      required_error: 'New password is required',
    }).min(8, 'New password must be more than 8 characters'),
  }).refine((data) => data.oldPassword !== data.newPassword, {
    message: 'New password cannot be the same as the old password',
    path: ['newPassword'],
  }),
});

export type RegisterUserInput = Omit<
  TypeOf<typeof registerUserSchema>['body'],
  'passwordConfirm'
>;

export type LoginUserInput = TypeOf<typeof loginUserSchema>['body'];
export type editUserInput = TypeOf<typeof editUserSchema>['body'];
export type changePasswordInput = TypeOf<typeof changePasswordSchema>['body'];
export type VerifyOtpAndEmailInput = TypeOf<typeof verifyOtpAndEmailSchema>['params'];
export type UpdateUserInput = TypeOf<typeof updateUserSchema>['body'];

export type ForgotPasswordInput = TypeOf<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
