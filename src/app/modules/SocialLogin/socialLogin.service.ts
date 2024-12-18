import jwt, { Secret } from 'jsonwebtoken';

import config from '../../../config';
import prisma from '../../utils/prisma';
import { generateToken } from '../../utils/generateToken';
import { UserRoleEnum, UserStatus } from '@prisma/client';

// google login into db
const googleLoginIntoDb = async (user: any) => {
  // console.log(user);

  const isUserExist = await prisma.user.findFirst({
    where: {
      googleId: user.id,
    },
  });

  if (isUserExist) {
    const token = generateToken(
      {
        id: isUserExist.id,
        email: isUserExist.email,
        role: UserRoleEnum.CUSTOMER
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return { token };
  }
  if (!isUserExist) {
    const newUser = await prisma.user.create({
      data: {
        googleId: user.id,
        fullName: user?.displayName,
        email: user.emails ? user.emails[0].value : '',
        profileImage: user.photos[0].value,
        phoneNumber: user?.phoneNumber,
        status: UserStatus.ACTIVE,
        dateOfBirth: user?.dateOfBirth, 
      },
      select: {
        id: true,
        email: true,
        role: true,
        googleId: true,
        phoneNumber: true,
        fullName: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await prisma.customer.create({
      data: {
        userId: newUser.id,
      },
    });

    const token = generateToken(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return { token };
  }
};

// facebook login into db
const facebookLoginIntoDb = async (user: any) => {
  const isUserExist = await prisma.user.findFirst({
    where: {
      facebookId: user.id,
    },
  });
  console.log(user)
  if (isUserExist) {
    const token = generateToken(
      {
        id: isUserExist.id,
        email: isUserExist.email,
        role: isUserExist.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return token;
  }
  if (!isUserExist) {
    const newUser = await prisma.user.create({
      data: {
        facebookId: user.id,
        fullName: user?.displayName,
        email: user.emails ? user.emails[0].value : '',
        profileImage: user.photos[0].value,
        phoneNumber: user?.phoneNumber,
        status: UserStatus.ACTIVE,
        dateOfBirth: user?.dateOfBirth,
      },
      select: {
        id: true,
        email: true,
        role: true,
        facebookId: true,
        phoneNumber: true,
        fullName: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    await prisma.customer.create({
      data: {
        userId: newUser.id,
      },
    });

    const token = generateToken(
      {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return { token };
  }
};
export const SocialLoginService = {
  googleLoginIntoDb,
  facebookLoginIntoDb,
};
