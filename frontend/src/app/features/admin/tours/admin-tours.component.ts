import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminLayoutComponent } from '../layout/admin-layout.component';
import { AdminService } from '../../../core/services/admin.service';
import { AdminTour } from '../../../core/models/admin.models';

@Component({
  selector: 'app-admin-tours',
  imports: [CommonModule, FormsModule, AdminLayoutComponent],
  templateUrl: './admin-tours.component.html',
  styleUrl: './admin-tours.component.scss',
})
export class AdminToursComponent implements OnInit {
  private adminService = inject(AdminService);

  tours = signal<AdminTour[]>([]);
  loading = signal(true);
  searchQuery = signal('');
  filterStatus = signal<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');
  archiveConfirmId = signal<number | null>(null);

  filteredTours = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.tours().filter(t => {
      const matchQ = !q || t.title.toLowerCase().includes(q) || t.country.toLowerCase().includes(q);
      const matchS = this.filterStatus() === 'ALL' || t.status === this.filterStatus();
      return matchQ && matchS;
    });
  });

  ngOnInit() {
    this.loadTours();
  }

  private loadTours() {
    this.loading.set(true);
    this.adminService.getTours().subscribe({
      next: res => {
        this.tours.set(res.content);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  archiveTour(id: number) {
    this.adminService.archiveTour(id).subscribe({
      next: () => {
        this.tours.update(list => list.map(t => t.id === id ? { ...t, status: 'ARCHIVED' as const } : t));
        this.archiveConfirmId.set(null);
      },
      error: () => this.archiveConfirmId.set(null),
    });
  }

  restoreTour(id: number) {
    this.tours.update(list => list.map(t => t.id === id ? { ...t, status: 'ACTIVE' as const } : t));
  }

  formatPrice(n: number): string {
    return n.toLocaleString('uk-UA') + ' ₴';
  }

  starsOf(n: number): number[] {
    return Array(n).fill(0);
  }
}
