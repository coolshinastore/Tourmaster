import { BookingStatus } from './booking.models';

export interface AdminTour {
  id: number;
  title: string;
  country: string;
  hotelName: string;
  hotelStars: number;
  mealType: string;
  durationNights: number;
  priceFrom: number;
  badge?: string;
  imageUrl: string;
  status: 'ACTIVE' | 'ARCHIVED';
  activeDatesCount: number;
  createdAt: string;
}

export interface AdminBooking {
  id: number;
  clientFullName: string;
  clientEmail: string;
  clientPhone: string;
  tourId: number;
  tourTitle: string;
  country: string;
  departureDate: string;
  returnDate: string;
  totalPrice: number;
  status: BookingStatus;
  touristsCount: number;
  createdAt: string;
}

export interface AdminClient {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalBookings: number;
}

export interface SalesReport {
  totalRevenue: number;
  totalBookings: number;
  newBookings: number;
  confirmedBookings: number;
  paidBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  dailyRevenue: { date: string; revenue: number; bookings: number }[];
  topTours: { tourId: number; title: string; bookings: number; revenue: number }[];
}
