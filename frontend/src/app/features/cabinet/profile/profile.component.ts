import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';

function passwordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const pw = ctrl.get('newPassword')?.value;
  const confirm = ctrl.get('confirmPassword')?.value;
  return pw && confirm && pw !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-profile',
  imports: [CommonModule, ReactiveFormsModule, CabinetLayoutComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  readonly user = this.auth.user;

  profileSaved = signal(false);
  profileSaving = signal(false);
  passwordSaved = signal(false);
  passwordSaving = signal(false);
  passwordError = signal('');
  showDeleteConfirm = signal(false);
  deleteError = signal('');

  profileForm = this.fb.group({
    firstName: [this.user()?.firstName ?? '', [Validators.required, Validators.minLength(2)]],
    lastName:  [this.user()?.lastName ?? '',  [Validators.required, Validators.minLength(2)]],
    email:     [{ value: this.user()?.email ?? '', disabled: true }],
    phone:     ['', Validators.pattern(/^\+?[0-9\s\-()]{7,20}$/)],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required, Validators.minLength(6)]],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  }, { validators: passwordsMatch });

  ngOnInit() {
    this.userService.getProfile().subscribe({
      next: profile => {
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          phone: profile.phone ?? '',
        });
      },
      error: () => {},
    });
  }

  saveProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.profileSaving.set(true);
    const { firstName, lastName, phone } = this.profileForm.value;
    this.userService.updateProfile({ firstName: firstName!, lastName: lastName!, phone: phone ?? undefined }).subscribe({
      next: updated => {
        this.auth.patchUser({ firstName: updated.firstName, lastName: updated.lastName });
        this.profileSaving.set(false);
        this.profileSaved.set(true);
        setTimeout(() => this.profileSaved.set(false), 3000);
      },
      error: () => this.profileSaving.set(false),
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.passwordSaving.set(true);
    this.passwordError.set('');
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.userService.changePassword({ currentPassword: currentPassword!, newPassword: newPassword! }).subscribe({
      next: () => {
        this.passwordSaving.set(false);
        this.passwordSaved.set(true);
        this.passwordForm.reset();
        setTimeout(() => this.passwordSaved.set(false), 3000);
      },
      error: (err) => {
        this.passwordSaving.set(false);
        this.passwordError.set(err?.error?.message ?? 'Не вдалося змінити пароль');
      },
    });
  }

  deleteAccount() {
    this.deleteError.set('');
    this.userService.deleteAccount().subscribe({
      next: () => {
        this.auth.logout();
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.showDeleteConfirm.set(false);
        this.deleteError.set(err?.error?.message ?? 'Не вдалося видалити акаунт. Спробуйте пізніше.');
      },
    });
  }

  get f() { return this.profileForm.controls; }
  get p() { return this.passwordForm.controls; }

  hasError(ctrl: AbstractControl | null): boolean {
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
