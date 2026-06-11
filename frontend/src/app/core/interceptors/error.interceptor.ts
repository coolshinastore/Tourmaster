import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 0) {
        messages.add({ severity: 'error', summary: 'Помилка з\'єднання', detail: 'Сервер недоступний' });
      } else if (error.status >= 500) {
        messages.add({ severity: 'error', summary: 'Помилка сервера', detail: 'Спробуйте пізніше' });
      }
      return throwError(() => error);
    })
  );
};
