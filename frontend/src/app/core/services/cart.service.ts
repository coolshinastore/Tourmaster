import { Injectable, signal, computed } from '@angular/core';
import { TourDate, TourSummary } from '../models/tour.models';
import { ExtraService } from '../models/booking.models';

export interface CartState {
  tour: TourSummary | null;
  tourDate: TourDate | null;
  touristsCount: number;
  extraServices: ExtraService[];
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private _state = signal<CartState>({
    tour: null,
    tourDate: null,
    touristsCount: 1,
    extraServices: [],
  });

  readonly state = this._state.asReadonly();

  readonly totalPrice = computed(() => {
    const s = this._state();
    if (!s.tourDate) return 0;
    const base = s.tourDate.price * s.touristsCount;
    const extra = s.extraServices.reduce((sum, e) => sum + e.price, 0) * s.touristsCount;
    return base + extra;
  });

  setTour(tour: TourSummary, date: TourDate, touristsCount: number) {
    this._state.update(s => ({ ...s, tour, tourDate: date, touristsCount }));
  }

  toggleExtraService(service: ExtraService) {
    this._state.update(s => {
      const exists = s.extraServices.some(e => e.id === service.id);
      return {
        ...s,
        extraServices: exists
          ? s.extraServices.filter(e => e.id !== service.id)
          : [...s.extraServices, service],
      };
    });
  }

  clear() {
    this._state.set({ tour: null, tourDate: null, touristsCount: 1, extraServices: [] });
  }
}
