import { Component, signal, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { InputText } from 'primeng/inputtext';
import { Password } from 'primeng/password';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [CommonModule, RouterLink, ReactiveFormsModule, InputText, Password],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private fb      = inject(FormBuilder);
  private auth    = inject(AuthService);
  private router  = inject(Router);
  private route   = inject(ActivatedRoute);
  private toast   = inject(MessageService);

  loading = signal(false);

  stats = [
    { value: '500+', label: 'турів' },
    { value: '12K+', label: 'клієнтів' },
    { value: '4.9★', label: 'рейтинг' },
  ];

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  get email()    { return this.form.controls.email; }
  get password() { return this.form.controls.password; }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    this.auth.login({ email: this.email.value!, password: this.password.value! }).subscribe({
      next: () => {
        const ret = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.router.navigateByUrl(ret);
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.detail || 'Невірний email або пароль';
        this.toast.add({ severity: 'error', summary: 'Помилка входу', detail: msg, life: 4000 });
      },
    });
  }
}
