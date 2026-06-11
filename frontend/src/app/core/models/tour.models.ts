export interface TourSummary {
  id: number;
  title: string;
  country: string;
  city: string;
  hotelName: string;
  hotelStars: number;
  mealType: string;
  durationNights: number;
  priceFrom: number;
  oldPrice?: number;
  badge?: string;
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  status: string;
}

export interface TourDate {
  id: number;
  departureDate: string;
  returnDate: string;
  departureCity: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
}

export interface Review {
  id: number;
  authorFirstName: string;
  authorLastLetter: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface TourDetail extends TourSummary {
  description: string;
  galleryUrls: string[];
  dates: TourDate[];
  latestReviews: Review[];
}

export interface TourFilter {
  q?: string;
  country?: string;
  priceMin?: number;
  priceMax?: number;
  stars?: number[];
  mealType?: string[];
  durationMin?: number;
  durationMax?: number;
  departureDateFrom?: string;
  departureDateTo?: string;
  badge?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
