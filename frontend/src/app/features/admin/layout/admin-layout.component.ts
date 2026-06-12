import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

export type AdminSection = 'dashboard' | 'tours' | 'bookings' | 'clients';

@Component({
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss',
})
export class AdminLayoutComponent {
  @Input() activeSection: AdminSection = 'dashboard';

  private auth = inject(AuthService);
  readonly user = this.auth.user;

  get userInitial(): string {
    return this.user()?.firstName?.charAt(0)?.toUpperCase() ?? 'A';
  }

  get userName(): string {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : 'Менеджер';
  }

  logout() {
    this.auth.logout();
  }
}
