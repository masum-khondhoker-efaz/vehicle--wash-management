import { JwtPayload } from 'jsonwebtoken';
import prisma from '../../utils/prisma';


// Function to get companies within a bounding box around the given coordinates
const getCompaniesFromDb = async (
  latitude?: number,
  longitude?: number,
  garageName?: string,
) => {
  if (latitude && longitude) {
    const garages = await prisma.garages.findMany();
    const nearbyGarages = garages.filter(garage => {
      if (garage.latitude === null || garage.longitude === null) {
        return false;
      }
      const garageLocation = {
        latitude: garage.latitude,
        longitude: garage.longitude,
      };
      const distance = (
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number,
      ) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371; // Radius of the Earth in km
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c; // Distance in km
      };

      return (
        distance(
          latitude,
          longitude,
          garageLocation.latitude,
          garageLocation.longitude,
        ) <= 200
      );
    });

    return nearbyGarages;
  } else if (garageName && garageName.trim()) {
    const garages = await prisma.garages.findMany();
    const filteredCompanies = garages.filter(garage => {
      return garage.garageName.toLowerCase().includes(garageName.toLowerCase());
    });

    return filteredCompanies;
  } else {
    throw new Error(
      'Either latitude/longitude or a valid garage name must be provided',
    );
  }
};


export const MapServices = {
  getCompaniesFromDb,
};
