import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';
import { AdminService } from '../../../core/services/admin.service';
import { AdminClient } from '../../../core/models/admin.models';

@Component({
  selector: 'app-admin-clients',
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-clients.component.html',
  styleUrl: './admin-clients.component.scss',
})
export class AdminClientsComponent implements OnInit {
  private adminService = inject(AdminService);

  clients = signal<AdminClient[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  filterLoyalty = signal<'ALL' | 'GOLD' | 'SILVER' | 'BRONZE'>('ALL');

  filteredClients = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.clients().filter(c => {
      const name = `${c.firstName} ${c.lastName}`.toLowerCase();
      const matchQ = !q || name.includes(q) || c.email.toLowerCase().includes(q);
      const matchL = this.filterLoyalty() === 'ALL' || this.loyaltyLevel(c.loyaltyPoints) === this.filterLoyalty();
      return matchQ && matchL;
    });
  });

  ngOnInit() {
    this.loadClients();
  }

  private loadClients() {
    this.loading.set(true);
    this.adminService.getClients().subscribe({
      next: res => {
        this.clients.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  loyaltyLevel(points: number): 'GOLD' | 'SILVER' | 'BRONZE' {
    if (points >= 3000) return 'GOLD';
    if (points >= 1000) return 'SILVER';
    return 'BRONZE';
  }

  loyaltyConfig(level: string): { label: string; bg: string; color: string; icon: string } {
    const map: Record<string, { label: string; bg: string; color: string; icon: string }> = {
      GOLD:   { label: 'Золотий',   bg: 'rgba(245,158,11,.12)', color: '#92610A', icon: '🥇' },
      SILVER: { label: 'Срібний',   bg: '#EEF0F3',              color: '#4B5563', icon: '🥈' },
      BRONZE: { label: 'Бронзовий', bg: 'rgba(180,100,50,.1)',  color: '#7B3F00', icon: '🥉' },
    };
    return map[level] ?? { label: level, bg: '#EEF0F3', color: '#4B5563', icon: '·' };
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }
}
