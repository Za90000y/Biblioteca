import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from './api-config';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegistroRequest extends LoginRequest {
  nombre: string;
  username: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  username: string;
  nombre: string;
  rol: 'BIBLIOTECARIO' | 'LECTOR';
}

const TOKEN_KEY = 'biblioteca.accessToken';
const ROLE_KEY = 'biblioteca.rol';

export function obtenerTokenGuardado(): string | null {
  return typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  iniciarSesion(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/login`, request).pipe(
      tap((response) => this.guardarSesion(response)),
    );
  }

  registrar(request: RegistroRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE_URL}/auth/registro`, request).pipe(
      tap((response) => this.guardarSesion(response)),
    );
  }

  cerrarSesion(): void {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(ROLE_KEY);
    }
  }

  estaAutenticado(): boolean {
    return obtenerTokenGuardado() !== null && this.rol !== null;
  }

  get rol(): AuthResponse['rol'] | null {
    const rol = typeof sessionStorage === 'undefined' ? null : sessionStorage.getItem(ROLE_KEY);
    return rol === 'BIBLIOTECARIO' || rol === 'LECTOR' ? rol : null;
  }

  private guardarSesion(response: AuthResponse): void {
    sessionStorage.setItem(TOKEN_KEY, response.accessToken);
    sessionStorage.setItem(ROLE_KEY, response.rol);
  }
}
