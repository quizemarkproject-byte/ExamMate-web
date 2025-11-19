import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ToastrService } from '../../services/toastr-service/toastr-service';

export const networkErrorInterceptor: HttpInterceptorFn = (req, next) => {
	const toastr = inject(ToastrService);

	return next(req).pipe(
		catchError((err: HttpErrorResponse) => {
			// Network-level failure (backend unreachable, CORS failure, etc.)
			if (err && err.status === 0) {
				const offline = typeof navigator !== 'undefined' && !navigator.onLine;
				if (offline) {
					toastr.error('No network connection — please check your internet.');
				} else {
					toastr.error('Unable to reach server. Try again later.');
				}
				return throwError(() => err);
			}

			// Client errors - show server-provided message when available
			if (err && err.status >= 400 && err.status < 500) {
				const serverMessage = err?.error.error;
				if (serverMessage) {
					toastr.error(String(serverMessage));
				}
				return throwError(() => err);
			}

			// Server errors - generic message
			if (err && err.status >= 500) {
				toastr.error('Server error. Please try again later.');
				return throwError(() => err);
			}

			// Fallback: rethrow
			return throwError(() => err);
		})
	);
};
