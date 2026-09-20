import { z } from 'zod';
import { MIN_OFFERED_FEE_JOD, MAX_OFFERED_FEE_JOD } from '../config/constants';

// Phone regex: permissive Jordan format (+962 or 07)
export const phoneRegex = /^(\+962|00962|0)?7[789]\d{7}$/;
export const jordanPhoneRegex = phoneRegex;

// Password rules: at least 8 chars, 1 uppercase, 1 lowercase, 1 digit
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// 10 digits national ID
const nationalIdSchema = z
  .string()
  .regex(/^\d{10}$/, 'National ID must be exactly 10 digits');

export const sellerStep1Schema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    phone: z
      .string()
      .trim()
      .min(9, 'Please enter a valid phone number')
      .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
        message: 'Enter a valid Jordan mobile number (e.g. 0791234567 or +962791234567)',
      }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const sellerStep2Schema = z.object({
  storeName: z.string().trim().min(2, 'Store name must be at least 2 characters'),
  storeCategory: z.string().trim().min(1, 'Please select a store category'),
  governorate: z.string().trim().min(1, 'Please select a governorate'),
  commercialRegistration: z.string().trim().optional(),
  businessPhone: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || phoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Jordanian phone number',
    }),
});

export const sellerStep3Schema = z.object({
  pickupAddress: z.string().trim().min(3, 'Pickup address must be at least 3 characters'),
  pickupCity: z.string().trim().min(1, 'Pickup city or region is required'),
});

export const sellerRegisterSchema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    phoneNumber: z
      .string()
      .trim()
      .min(9, 'Please enter a valid phone number')
      .optional(),
    phone: z
      .string()
      .trim()
      .min(9, 'Please enter a valid phone number')
      .optional(),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => (data.phoneNumber || data.phone), {
    message: 'Please enter a valid phone number',
    path: ['phone'],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const driverStep1Schema = z
  .object({
    fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    phone: z
      .string()
      .trim()
      .min(9, 'Please enter a valid phone number')
      .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
        message: 'Enter a valid Jordan mobile number (e.g. 0791234567 or +962791234567)',
      }),
    password: passwordSchema,
    confirmPassword: z.string(),
    nationalId: nationalIdSchema,
    photoDataUrl: z.string().optional(),
    personalPhotoUrl: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const driverStep2Schema = z.object({
  vehicleType: z.enum(['CAR', 'MOTORCYCLE', 'VAN', 'BICYCLE']),
  vehicleModel: z.string().trim().min(2, 'Model name must be at least 2 characters (e.g. Toyota Prius 2021)'),
  vehicleColor: z.string().trim().min(2, 'Colour is required (e.g. Silver, White)'),
  plateNumber: z.string().trim().min(3, 'Plate number is required (e.g. 50-12345)'),
  preferredGovernorate: z.string().trim().optional(),
});

export const driverStep3Schema = z.object({
  licensePhotoDataUrl: z.string().min(1, "Jordanian Driver's Licence is required"),
  nationalIdCardDataUrl: z.string().optional(),
  vehicleRegistrationDataUrl: z.string().optional(),
});

export const driverStep4Schema = z.object({
  termsAccepted: z.literal(true),
});

export const geoPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  label: z.string().min(1, 'Location label is required'),
});

export const deliveryRequestSchema = z.object({
  productName: z.string().trim().min(3, 'Product name must be 3–80 characters').max(80, 'Product name must be 3–80 characters'),
  productDescription: z
    .string()
    .trim()
    .min(10, 'Description must be 10–500 characters')
    .max(500, 'Description must be 10–500 characters'),
  productImageUrl: z.string().optional(),
  pickup: geoPointSchema,
  delivery: geoPointSchema,
  recipientName: z.string().trim().min(2, 'Recipient name is required'),
  recipientPhone: z
    .string()
    .trim()
    .min(9, 'Recipient phone is required')
    .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Jordan mobile number',
    }),
  offeredFeeJod: z
    .number()
    .min(MIN_OFFERED_FEE_JOD, `Minimum fee is ${MIN_OFFERED_FEE_JOD} JOD`)
    .max(MAX_OFFERED_FEE_JOD, `Maximum fee is ${MAX_OFFERED_FEE_JOD} JOD`),
});

export const createRequestSchema = z.object({
  productName: z.string().trim().min(3, 'Product name must be 3–80 characters').max(80, 'Product name must be 3–80 characters'),
  productDescription: z
    .string()
    .trim()
    .min(10, 'Description must be 10–500 characters')
    .max(500, 'Description must be 10–500 characters'),
  productImageUrl: z.string().optional(),
  pickupLat: z.number(),
  pickupLng: z.number(),
  pickupLabel: z.string().min(1, 'Pickup location is required'),
  deliveryLat: z.number(),
  deliveryLng: z.number(),
  deliveryLabel: z.string().min(1, 'Delivery location is required'),
  recipientName: z.string().trim().min(2, 'Recipient name is required'),
  recipientPhone: z
    .string()
    .trim()
    .min(9, 'Recipient phone is required')
    .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Jordan mobile number',
    }),
  offeredFeeJod: z
    .number()
    .min(MIN_OFFERED_FEE_JOD, `Minimum fee is ${MIN_OFFERED_FEE_JOD} JOD`)
    .max(MAX_OFFERED_FEE_JOD, `Maximum fee is ${MAX_OFFERED_FEE_JOD} JOD`),
});

export const adminRejectReasonSchema = z.object({
  reason: z.string().trim().min(10, 'Rejection reason must be at least 10 characters').max(500, 'Reason cannot exceed 500 characters'),
});

export const sellerProfileEditSchema = z.object({
  fullName: z.string().trim().min(3, 'Full name must be at least 3 characters'),
  phoneNumber: z
    .string()
    .trim()
    .min(9, 'Please enter a valid phone number')
    .refine((val) => phoneRegex.test(val.replace(/\s+/g, '')), {
      message: 'Enter a valid Jordan mobile number',
    }),
});
