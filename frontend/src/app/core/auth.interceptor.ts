import { HttpInterceptorFn } from '@angular/common/http';
import { obtenerTokenGuardado } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const token = obtenerTokenGuardado();
  if (!token || !request.url.startsWith('/api/v1/') || request.url.endsWith('/api/v1/auth/login')) {
    return next(request);
  }

  return next(request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  }));
};
