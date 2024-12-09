import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import prisma from '../../utils/prisma';
import emailSender from '../../utils/emailSender';

interface UserWithOptionalPassword extends Omit<User, 'password'> {
  password?: string;
}

const registerUserIntoDB = async (payload: any) => {
  if(payload.email) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: payload.email,
      },
    });
    if (existingUser) {
      throw new Error('Email already exists!');
    }
  }

  const hashedPassword: string = await bcrypt.hash(payload.password, 12);

  const userData = {
    ...payload,
    password: hashedPassword,
  };

  const result = await prisma.$transaction(async (transactionClient: any) => {
    const user = await transactionClient.user.create({
      data: userData,
    });
    if (!user) {
      throw Error('User not created!');
    }

    const data = {
      userId: user.id,
    };

    if (payload.role === 'ADMIN') {
      const admin = await transactionClient.admin.create({
        data: data,
      });
      if (!admin) {
        throw Error('Admin not created!');
      }
    }

    if (payload.role === 'CUSTOMER') {
      const customer = await transactionClient.customer.create({
        data: data,
      });
      if (!customer) {
        throw Error('Customer not created!');
      }
    }

    if (payload.role === 'DRIVER') {
      const driver = await transactionClient.driver.create({
        data: data,
      });
      if (!driver) {
        throw Error('Driver not created!');
      }
    }
    if (payload.role === 'GARAGE_OWNER') {
      const garageOwner = await transactionClient.garageOwner.create({
        data: data,
      });
      if (!garageOwner) {
        throw Error('Garage Owner not created!');
      }
    }
    return { userId: user.id };
  });

  const user = await prisma.user.findUniqueOrThrow({
    where: {
      id: result.userId,
    },
  });

  const userWithOptionalPassword = user as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return user;
};

const getAllUsersFromDB = async (searchTerm?: string) => {
  const where: any = {};

  // If search term is provided, apply case-insensitive search on fullName and email
  if (searchTerm) {
    where.OR = [
      { fullName: { contains: searchTerm, mode: 'insensitive' } },
      { email: { contains: searchTerm, mode: 'insensitive' } },
    ];
  }

  const result = await prisma.user.findMany({
    where,
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if(!result) {
    throw new Error('Users not found!');
  }

  return result;
};


const getMyProfileFromDB = async (id: string) => {
  const Profile = await prisma.user.findUniqueOrThrow({
    where: {
      id: id,
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!Profile) {
    throw new Error('User not found!');
  }

  return Profile;
};

const getUserDetailsFromDB = async (id: string) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      fullName: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      // profile: true,
    },
  });
  if (!user) {
    throw new Error('User not found!');
  }
  return user;
};

const updateMyProfileIntoDB = async (id: string, payload: any) => {
  const userProfileData = payload.Profile;
  delete payload.Profile;

  const userData = payload;

  // update user data
  await prisma.$transaction(async (transactionClient: any) => {
    // Update user data
    const updatedUser = await transactionClient.user.update({
      where: { id },
      data: userData,
    });

    return { updatedUser };
  });

  // Fetch and return the updated user including the profile
  const updatedUser = await prisma.user.findUniqueOrThrow({
    where: { id },
    // include: { profile: true },
  });

  const userWithOptionalPassword = updatedUser as UserWithOptionalPassword;
  delete userWithOptionalPassword.password;

  return userWithOptionalPassword;
};

const updateUserRoleStatusIntoDB = async (id: string, payload: any) => {
  const result = await prisma.user.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return result;
};

const changePassword = async (user: any, payload: any) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.oldPassword,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new Error('Password incorrect!');
  }

  const hashedPassword: string = await bcrypt.hash(payload.newPassword, 12);

  await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: 'Password changed successfully!',
  };
};


const forgotPassword = async (payload: { email: string }) => {
  const userData = await prisma.user.findUnique({
    where: {
      email: payload.email,
    },
  });

  if (!userData) {
    throw new Error('User not found!');
  }

  const otp = Math.floor(1000+ Math.random() * 9000);
  const otpExpiresAt = new Date();
  otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 5);
  const otpExpiresAtString = otpExpiresAt.toISOString();

  await prisma.user.update({
    where: { email: payload.email },
    data: {
      otp: otp,
      otpExpiresAt: otpExpiresAtString,
    },
  });

  await emailSender(
    'Reset Your Password',
    userData.email,

    `<div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
    <table width="100%" style="border-collapse: collapse;">
    <tr>
      <td style="background-color: #FCC734; padding: 20px; text-align: center; color: #000000; border-radius: 10px 10px 0 0;">
        <h2 style="margin: 0; font-size: 24px;">Reset Your Password</h2>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px;">
        <p style="font-size: 16px; margin: 0;">Hello <strong>${
          userData.fullName
        }</strong>,</p>
        <p style="font-size: 16px;">We received a request to reset your password.</p>
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 18px;" >Reset password using this OTP: <span style="font-weight:bold"> ${otp} </span><br/> This OTP will be Expired in 5 minutes,</p>
        </div>
        <p style="font-size: 14px; color: #555;">If you did not request this change, please ignore this email. No further action is needed.</p>
        <p style="font-size: 16px; margin-top: 20px;">Thank you,<br>DEMOS</p>
      </td>
    </tr>
    <tr>
      <td style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888; border-radius: 0 0 10px 10px;">
        <p style="margin: 0;">&copy; ${new Date().getFullYear()} DEMOS Team. All rights reserved.</p>
      </td>
    </tr>
    </table>
  </div>

      `,
  );
  return { message: 'OTP sent via your email successfully' };
};

// verify otp
const verifyOtpInDB = async (bodyData: { email: string; otp: number }) => {
  const userData = await prisma.user.findUnique({
    where: { email: bodyData.email },
  });

  if (!userData) {
    throw new Error('User not found!');
  }
  const currentTime = new Date(Date.now());

  if (userData?.otp !== bodyData.otp) {
    throw new Error('Your OTP is incorrect!');
  } else if (!userData.otpExpiresAt || userData.otpExpiresAt <= currentTime) {
    throw new Error('Your OTP is expired, please send new otp');
  }

  return;
};
export const UserServices = {
  registerUserIntoDB,
  getAllUsersFromDB,
  getMyProfileFromDB,
  getUserDetailsFromDB,
  updateMyProfileIntoDB,
  updateUserRoleStatusIntoDB,
  changePassword,
  forgotPassword,
  verifyOtpInDB,
};
