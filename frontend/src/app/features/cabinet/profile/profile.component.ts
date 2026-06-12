import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { CabinetLayoutComponent } from '../layout/cabinet-layout.component';
import { AuthService } from '../../../core/services/auth.service';

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
export class ProfileComponent {
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  readonly user = this.auth.user;

  profileSaved = signal(false);
  profileSaving = signal(false);
  passwordSaved = signal(false);
  passwordSaving = signal(false);
  passwordError = signal('');

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

  saveProfile() {
    if (this.profileForm.invalid) { this.profileForm.markAllAsTouched(); return; }
    this.profileSaving.set(true);
    setTimeout(() => {
      this.profileSaving.set(false);
      this.profileSaved.set(true);
      setTimeout(() => this.profileSaved.set(false), 3000);
    }, 800);
  }

  changePassword() {
    if (this.passwordForm.invalid) { this.passwordForm.markAllAsTouched(); return; }
    this.passwordSaving.set(true);
    this.passwordError.set('');
    setTimeout(() => {
      this.passwordSaving.set(false);
      this.passwordSaved.set(true);
      this.passwordForm.reset();
      setTimeout(() => this.passwordSaved.set(false), 3000);
    }, 800);
  }

  get f() { return this.profileForm.controls; }
  get p() { return this.passwordForm.controls; }

  hasError(ctrl: AbstractControl | null): boolean {
    return !!(ctrl?.invalid && ctrl?.touched);
  }
}
