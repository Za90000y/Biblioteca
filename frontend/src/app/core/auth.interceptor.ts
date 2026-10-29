import { HttpInterceptorFn } from '@angular/common/http';
import { obtenerTokenGuardado } from './auth.service';
import { API_BASE_URL } from './api-config';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = obtenerTokenGuardado();
  if (!token || !request.url.startsWith(`${API_BASE_URL}/`)
    || request.url.endsWith(`${API_BASE_URL}/auth/login`)) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
