import type { HttpInterceptorFn } from '@angular/common/http';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = localStorage.getItem('authToken');

  if (authToken) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Token ${authToken}`,
      },
    });
    return next(clonedRequest); // Directly call next() with the modified request
  }

  return next(req); // Call next() normally if no token is found
};
