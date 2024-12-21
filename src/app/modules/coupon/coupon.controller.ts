import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { couponService } from './coupon.service';


const addCoupon = catchAsync(async (req, res) => {
    const user = req.user as any;
    const data = req.body;
    const result = await couponService.addCouponIntoDB(user.id, data);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        message: 'Coupon added successfully',
        data: result,
    });
});

const getCouponList = catchAsync(async (req, res) => {
    const user = req.user as any;
    const coupons = await couponService.getCouponListFromDB();
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Coupon list',
        data: coupons,
    });
});

const getCouponById = catchAsync(async (req, res) => {
    const user = req.user as any;
    const couponId = req.params.couponId;
    const coupon = await couponService.getCouponByIdFromDB( couponId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Coupon details',
        data: coupon,
    });
});

const updateCoupon = catchAsync(async (req, res) => {
    const couponId = req.params.couponId;
    const user = req.user as any;
    const data = req.body;
    const result = await couponService.updateCouponIntoDB(user.id, couponId, data);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Coupon updated successfully',
        data: result,
    });
});

const deleteCoupon = catchAsync(async (req, res) => {
    const couponId = req.params.couponId;
    const result = await couponService.deleteCouponFromDB(couponId);
    sendResponse(res, {
        statusCode: httpStatus.OK,
        message: 'Coupon deleted successfully',
        data: result,
    });
});

export const couponController = {
    addCoupon,
    getCouponList,
    getCouponById,
    updateCoupon,
    deleteCoupon,
};
