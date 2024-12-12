import jwt, { Secret } from 'jsonwebtoken';

import config from '../../../config';
import prisma from '../../utils/prisma';
import { generateToken } from '../../utils/generateToken';

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
        role: isUserExist.role,
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
        fullName: user.displayName,
        email: user.emails ? user.emails[0].value : '',
        profileImage: user.photos[0].value,
      },
    });

    const token = generateToken(
      {
        id: newUser?.id,
        email: newUser?.email,
        role: newUser?.role,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return { token };
  }
};

// facebook login into db
const facebookLoginIntoDb = async (user: any) => {
  // const isUserExist = await prisma.user.findUnique({
  //   where: {
  //     facebookId: user.id,
  //   },
  // });
  // if (isUserExist) {
  //   const token = jwtHelpers.generateToken(
  //     {
  //       id: isUserExist?.id,
  //       email: isUserExist?.email,
  //       role: isUserExist?.role,
  //     },
  //     config.jwt.jwt_secret as Secret,
  //     config.jwt.expires_in as string
  //   );
  //   return token;
  // }
  // if (!isUserExist) {
  //   const newUser = await prisma.user.create({
  //     data: {
  //       facebookId: user.id,
  //       email: user.emails ? user.emails[0].value : "",
  //     },
  //   });
  //   const token = jwtHelpers.generateToken(
  //     {
  //       id: newUser?.id,
  //       email: newUser?.email,
  //       role: newUser?.role,
  //     },
  //     config.jwt.jwt_secret as Secret,
  //     config.jwt.expires_in as string
  //   );
  //   return token;
  // }
};
export const SocialLoginService = {
  googleLoginIntoDb,
  facebookLoginIntoDb,
};
