import { ObjectId } from 'mongodb';

export interface IBooking {
    services: string[];
    totalAmount: number;
    bookingStatus: string;
    carId: ObjectId;
    ownerNumber: string;
    carName: string;
    serviceDate: Date;
    location: string;
    latitude?: number;
    longitude?: number;
    estimatedTime: string;
    serviceStatus: string;
    paymentStatus: string;
    paymentId?: ObjectId;
    bookingTime: string;
    
}