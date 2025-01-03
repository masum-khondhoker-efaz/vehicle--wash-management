import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';
import { UserStatus } from '@prisma/client';



const loginUserFromDB = async (payload: {
  email: string;
  password: string;
  fcmToken: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
      status: UserStatus.ACTIVE,
    },
    select: {
      id: true,
      email: true,
      role: true,
      fullName: true,
      password: true,
      phoneNumber: true,
      profileImage: true,
    },
  });

  if (!userData.email) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Email not set for this user');
  }
  if(!userData.fullName){
    throw new AppError(httpStatus.BAD_REQUEST, 'Full Name not set for this user');
  }

  if (!userData.password) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password not set for this user');
  }

  const isCorrectPassword: boolean = await bcrypt.compare(
    payload.password,
    userData.password,
  );

  if (!isCorrectPassword) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Password incorrect');
  }

  const user = await prisma.user.update({
    where: {
      id: userData.id,
    },
    data: {
      fcmToken: payload.fcmToken,
    },
  });

  const accessToken = await generateToken(
    {
      id: userData.id,
      email: userData.email,
      role: userData.role,
    },
    config.jwt.access_secret as Secret,
    config.jwt.access_expires_in as string,
  );
  return {
    id: userData.id,
    fullName: userData.fullName,
    email: userData.email,
    role: userData.role,
    phoneNumber: userData.phoneNumber,
    profileImage: userData.profileImage,
    fcmToken: user.fcmToken,
    accessToken: accessToken,
  };
};

export const AuthServices = { loginUserFromDB };
