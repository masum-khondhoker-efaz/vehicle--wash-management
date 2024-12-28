import z, { date } from 'zod';
const registerUser = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'Name is required!',
    }).optional(),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }).optional(),
    password: z.string({
      required_error: 'Password is required!',
    }).optional(),

    phoneNumber: z.string({
      required_error: 'Phone number is required!',
    }).optional(),
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Name is required!',
      })
      .optional(),
    gender: z
      .string({
        required_error: 'Password is required!',
      })
      .optional(),
    phoneNumber: z
      .string({
        required_error: 'Phone number is required!',
      })
      .optional(),
  }),
    dateOfBirth: z
      .string({
        required_error: 'Date of birth is required!',
      })
      .optional(),
});

const forgetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
  }),
});

const verifyOtpSchema = z.object({
  body: z.object({
    otp: z.number({
      required_error: 'OTP is required!',
    }),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    newPassword: z.string({
      required_error: 'Password is required!',
    }),
  }),
});

const socialLoginSchema = z.object({
  body: z.object({
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }).optional(),
    fullName: z.string({
      required_error: 'Name is required!',
    }),
    fcmToken: z.string({
      required_error: 'Fcm token is required!',
    }),
    role: z.string({
      required_error: 'Role is required!',
    }),
    
  }),
});

export const UserValidations = {
  registerUser,
  updateProfileSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
  changePasswordSchema,
  socialLoginSchema,
};
