import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import config from '../../../config';
import AppError from '../../errors/AppError';
import { generateToken } from '../../utils/generateToken';
import prisma from '../../utils/prisma';



const loginUserFromDB = async (payload: {
  email: string;
  password: string;
}) => {
  const userData = await prisma.user.findUniqueOrThrow({
    where: {
      email: payload.email,
    },
  });
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
    accessToken: accessToken,
  };
};

export const AuthServices = { loginUserFromDB };
