import { Component, Input, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { HeaderComponent } from '../../../shared/components/header/header.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { MobileTabBarComponent } from '../../../shared/components/mobile-tab-bar/mobile-tab-bar.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

export type CabinetSection = 'bookings' | 'wishlist' | 'profile';

@Component({
  selector: 'app-cabinet-layout',
  imports: [CommonModule, RouterLink, HeaderComponent, FooterComponent, MobileTabBarComponent],
  templateUrl: './cabinet-layout.component.html',
  styleUrl: './cabinet-layout.component.scss',
})
export class CabinetLayoutComponent implements OnInit {
  @Input() activeSection: CabinetSection = 'bookings';

  private auth = inject(AuthService);
  private userService = inject(UserService);
  readonly user = this.auth.user;

  wishlistCount = signal(0);

  ngOnInit() {
    this.userService.getWishlist().subscribe({
      next: items => this.wishlistCount.set(items.length),
      error: () => {},
    });
  }

  get userInitial(): string {
    return this.user()?.firstName?.charAt(0)?.toUpperCase() ?? '?';
  }

  get userName(): string {
    const u = this.user();
    return u ? `${u.firstName} ${u.lastName}` : '';
  }

  get greeting(): string {
    return this.user()?.firstName ?? 'Гість';
  }

  logout() {
    this.auth.logout();
  }
}
