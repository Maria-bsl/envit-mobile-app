import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, timeout } from 'rxjs';

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  let timeoutDuration = 30000;
  return next(req).pipe(timeout(timeoutDuration));
};
