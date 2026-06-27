export type BookingStatus = 'NEW' | 'CONFIRMED' | 'PAID' | 'COMPLETED' | 'CANCELLED';

export interface BookingItem {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: string;
  passportNumber: string;
  passportExpiry: string;
}

export interface ExtraService {
  id: number;
  name: string;
  description: string;
  price: number;
  type: 'INSURANCE' | 'TRANSFER' | 'EXCURSION';
}

export interface BookingSummary {
  id: number;
  tourId: number;
  tourTitle: string;
  country: string;
  imageUrl: string;
  durationNights: number;
  departureDate: string;
  returnDate: string;
  departureCity: string;
  status: BookingStatus;
  totalPrice: number;
  discount: number;
  touristsCount: number;
  createdAt: string;
}

export interface BookingDetail extends BookingSummary {
  hotelStars: number;
  mealType: string;
  tourists: BookingItem[];
  extraServices: ExtraService[];
  updatedAt: string;
}

export interface CreateReviewRequest {
  bookingId: number;
  rating: number;
  comment: string;
}

export interface CreateBookingRequest {
  tourDateId: number;
  tourists: {
    firstName: string;
    lastName: string;
    birthDate: string;
    passportNumber: string;
    passportExpiry: string;
  }[];
  extraServiceIds?: number[];
}
