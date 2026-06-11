import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.models';

const ACCESS_KEY  = 'tm_access';
const REFRESH_KEY = 'tm_refresh';
const USER_KEY    = 'tm_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/auth`;

  private _user = signal<AuthResponse | null>(this.loadUser());

  readonly user     = this._user.asReadonly();
  readonly isLoggedIn  = computed(() => !!this._user());
  readonly isManager   = computed(() => this._user()?.role === 'MANAGER');

  constructor(private http: HttpClient, private router: Router) {}

  register(request: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.api}/register`, request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  login(request: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.api}/login`, request).pipe(
      tap(res => this.saveSession(res))
    );
  }

  refresh() {
    const token = localStorage.getItem(REFRESH_KEY);
    if (!token) return null;
    return this.http.post<AuthResponse>(`${this.api}/refresh`, { refreshToken: token }).pipe(
      tap(res => this.saveSession(res))
    );
  }

  logout() {
    this.http.post(`${this.api}/logout`, {}).subscribe({ error: () => {} });
    this.clearSession();
    this.router.navigate(['/']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  private saveSession(res: AuthResponse) {
    localStorage.setItem(ACCESS_KEY, res.accessToken);
    localStorage.setItem(REFRESH_KEY, res.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(res));
    this._user.set(res);
  }

  private clearSession() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
    this._user.set(null);
  }

  private loadUser(): AuthResponse | null {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}
