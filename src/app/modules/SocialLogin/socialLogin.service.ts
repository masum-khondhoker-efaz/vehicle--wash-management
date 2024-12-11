import jwt, { Secret } from "jsonwebtoken";
import prisma from "../../utils/prisma";
import { generateToken } from '../../utils/generateToken';
import config from "../../../config";


// google login into db
const googleLoginIntoDb = async (user: any) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (isUserExist) {
    const token =  generateToken(
      {
        id: isUserExist?.id,
        email: isUserExist?.email,
        role: isUserExist?.role,
        fullName: user?.fullName,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string
    );
    return token;
  }

  if (!isUserExist) {
    const newUser = await prisma.user.create({
      data: {
        googleId: user.id,
        email: user?.emails,
        fullName: user?.fullName,
        dateOfBirth: user?.dateOfBirth ,
        profileImage: user?.profileImage ,
        
      },
    });

    const token = generateToken(
      {
        id: newUser?.id,
        email: newUser?.email,
        role: newUser?.role,
        fullName: user?.fullName,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return token;
  }
};

// facebook login into db
const facebookLoginIntoDb = async (user: any) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (isUserExist) {
    const token = generateToken(
      {
        id: isUserExist?.id,
        email: isUserExist?.email,
        role: isUserExist?.role,
        fullName: user?.fullName,
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
        email: user?.emails,
        fullName: user?.fullName ,
        dateOfBirth: user?.dateOfBirth ,
        profileImage: user?.profileImage ,
      },
    });

    const token = generateToken(
      {
        id: newUser?.id,
        email: newUser?.email,
        role: newUser?.role,
        fullName: user.fullName,
      },
      config.jwt.access_secret as Secret,
      config.jwt.access_expires_in as string,
    );
    return token;
  }
};
export const SocialLoginService = {
  googleLoginIntoDb,
  facebookLoginIntoDb,
};
