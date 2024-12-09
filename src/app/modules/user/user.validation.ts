import z from "zod";
const registerUser = z.object({
  body: z.object({
    fullName: z.string({
      required_error: 'Name is required!',
    }),
    email: z
      .string({
        required_error: 'Email is required!',
      })
      .email({
        message: 'Invalid email format!',
      }),
    password: z.string({
      required_error: 'Password is required!',
    }),

    dateOfBirth: z
      .string({
        required_error: 'Date of birth is required!',
      })
      ,
  }),
});

const updateProfileSchema = z.object({
  body: z.object({
    fullName: z
      .string({
        required_error: 'Name is required!',
      })
      .optional(),
    password: z
      .string({
        required_error: 'Password is required!',
      })
      .optional(),
    phoneNumber: z
      .string({
        required_error: 'Phone number is required!',
      }).optional(),
  }),
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
    })
  })
});


export const UserValidations = {
  registerUser,
  updateProfileSchema,
  forgetPasswordSchema,
  verifyOtpSchema,
};
