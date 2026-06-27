import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfile } from '../models/auth.models';
import { TourSummary } from '../models/tour.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly usersApi = `${environment.apiUrl}/users`;
  private readonly wishlistApi = `${environment.apiUrl}/wishlist`;

  constructor(private http: HttpClient) {}

  getProfile() {
    return this.http.get<UserProfile>(`${this.usersApi}/me`);
  }

  updateProfile(request: UpdateProfileRequest) {
    return this.http.put<UserProfile>(`${this.usersApi}/me`, request);
  }

  changePassword(request: ChangePasswordRequest) {
    return this.http.patch<void>(`${this.usersApi}/me/password`, request);
  }

  deleteAccount() {
    return this.http.delete<void>(`${this.usersApi}/me`);
  }

  getWishlist() {
    return this.http.get<TourSummary[]>(this.wishlistApi);
  }

  addToWishlist(tourId: number) {
    return this.http.post<void>(`${this.wishlistApi}/${tourId}`, {});
  }

  removeFromWishlist(tourId: number) {
    return this.http.delete<void>(`${this.wishlistApi}/${tourId}`);
  }
}
