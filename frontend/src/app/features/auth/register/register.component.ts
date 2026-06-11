import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { Checkbox } from 'primeng/checkbox';
import { AuthService } from '../../../core/services/auth.service';

function passwordsMatch(ctrl: AbstractControl): ValidationErrors | null {
  const pw  = ctrl.get('password')?.value;
  const pw2 = ctrl.get('confirmPassword')?.value;
  return pw && pw2 && pw !== pw2 ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-register',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, InputText, Password, Checkbox],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(MessageService);

  loading = signal(false);

  form = this.fb.group({
    firstName:       ['', [Validators.required, Validators.minLength(2)]],
    lastName:        ['', [Validators.required, Validators.minLength(2)]],
    phone:           [''],
    email:           ['', [Validators.required, Validators.email]],
    password:        ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
    agree:           [false, Validators.requiredTrue],
  }, { validators: passwordsMatch });

  get f() { return this.form.controls; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    const { firstName, lastName, phone, email, password } = this.form.value;
    this.auth.register({ firstName: firstName!, lastName: lastName!, phone: phone || undefined, email: email!, password: password! }).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.detail || 'Не вдалося зареєструватись. Спробуйте знову.';
        this.toast.add({ severity: 'error', summary: 'Помилка реєстрації', detail: msg, life: 4000 });
      },
    });
  }

  stats = [
    { value: '500+', label: 'турів' },
    { value: '12K+', label: 'клієнтів' },
    { value: '4.9★', label: 'рейтинг' },
  ];
}
