import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AccountServices } from '../_services/account-services';
import { catchError, throwError } from 'rxjs';
import Swal from 'sweetalert2';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const accountService = inject(AccountServices);

  return next(req).pipe(
    catchError((error: any) => {
      let errorMsg = '';

      if (error.status === 401) {
        accountService.Logout();
        router.navigate(['/login']);
        errorMsg = 'Your session has expired. Please login again.';
      } else if (error.status === 403) {
        errorMsg = 'You do not have permission to access this resource.';
      } else if (error.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else {
        errorMsg = error.error?.message || 'Something went wrong';
      }

      const Toast = Swal.mixin({
                   toast: true,
                   position: 'top-end',
                   showConfirmButton: false,
                   timer: 3000,
                   timerProgressBar: true,
                   didOpen: (toast) => {
                     toast.onmouseenter = Swal.stopTimer;
                     toast.onmouseleave = Swal.resumeTimer;
                   },
                 });
                 Toast.fire({
                   icon: 'error',
                   title: errorMsg,
                 });

      return throwError(() => error);
    })
  );
};
