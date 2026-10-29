import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface Autor {
  id: number;
  nombre: string;
  apellido: string;
  nacionalidad: string;
  fechaNacimiento: string;
}

export interface Libro {
  id: number;
  titulo: string;
  isbn: string;
  anio: number;
  autor: Autor;
}

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  rol: 'BIBLIOTECARIO' | 'LECTOR';
  estado: 'ACTIVO' | 'INACTIVO';
}

export interface Prestamo {
  id: number;
  libro: Libro;
  usuario: Usuario;
  fechaPrestamo: string;
  fechaDevolucion: string | null;
  devuelto: boolean;
}

export interface Pagina<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface LibroRequest {
  titulo: string;
  isbn: string;
  anio: number;
  autorId: number;
}

export interface AutorRequest {
  nombre: string;
  apellido: string;
  nacionalidad: string;
  fechaNacimiento: string;
}

export interface UsuarioRequest {
  nombre: string;
  username: string;
  email: string;
  passwordHash?: string;
  rol: Usuario['rol'];
  estado: Usuario['estado'];
}

export interface PrestamoRequest {
  libroId: number;
  usuarioId: number;
  fechaPrestamo: string;
  fechaDevolucion: string | null;
  devuelto: boolean;
}

@Injectable({ providedIn: 'root' })
export class BibliotecaApi {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/v1';
  private readonly prestamosCambiaron = new Subject<void>();

  readonly prestamosCambiaron$ = this.prestamosCambiaron.asObservable();

  notificarPrestamosActualizados(): void {
    this.prestamosCambiaron.next();
  }

  obtenerAutores(): Observable<Autor[]> {
    return this.http.get<Autor[]>(`${this.baseUrl}/autores`);
  }

  crearAutor(request: AutorRequest): Observable<Autor> {
    return this.http.post<Autor>(`${this.baseUrl}/autores`, request);
  }

  actualizarAutor(id: number, request: AutorRequest): Observable<Autor> {
    return this.http.put<Autor>(`${this.baseUrl}/autores/${id}`, request);
  }

  eliminarAutor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/autores/${id}`);
  }

  obtenerLibros(page = 0, size = 10, titulo = '', autor = ''): Observable<Pagina<Libro>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (titulo.trim()) params = params.set('titulo', titulo.trim());
    if (autor.trim()) params = params.set('autor', autor.trim());
    return this.http.get<Pagina<Libro>>(`${this.baseUrl}/libros`, { params });
  }

  crearLibro(request: LibroRequest): Observable<Libro> {
    return this.http.post<Libro>(`${this.baseUrl}/libros`, request);
  }

  actualizarLibro(id: number, request: LibroRequest): Observable<Libro> {
    return this.http.put<Libro>(`${this.baseUrl}/libros/${id}`, request);
  }

  eliminarLibro(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/libros/${id}`);
  }

  obtenerUsuarios(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.baseUrl}/usuarios`);
  }

  crearUsuario(request: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(`${this.baseUrl}/usuarios`, request);
  }

  actualizarUsuario(id: number, request: UsuarioRequest): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/usuarios/${id}`, request);
  }

  eliminarUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/usuarios/${id}`);
  }

  obtenerPrestamos(page = 0, size = 10, usuario = ''): Observable<Pagina<Prestamo>> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (usuario.trim()) params = params.set('usuario', usuario.trim());
    return this.http.get<Pagina<Prestamo>>(`${this.baseUrl}/prestamos`, { params });
  }

  crearPrestamo(request: PrestamoRequest): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.baseUrl}/prestamos`, request);
  }

  solicitarPrestamo(libroId: number): Observable<Prestamo> {
    return this.http.post<Prestamo>(`${this.baseUrl}/prestamos/solicitar`, { libroId });
  }

  obtenerMisPrestamos(): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/prestamos/mios`);
  }

  devolverPrestamo(id: number): Observable<Prestamo> {
    return this.http.patch<Prestamo>(`${this.baseUrl}/prestamos/${id}/devolver`, {});
  }

  obtenerPrestamosDelUsuario(usuarioId: number): Observable<Prestamo[]> {
    return this.http.get<Prestamo[]>(`${this.baseUrl}/usuarios/${usuarioId}/prestamos`);
  }

  actualizarPrestamo(id: number, request: PrestamoRequest): Observable<Prestamo> {
    return this.http.put<Prestamo>(`${this.baseUrl}/prestamos/${id}`, request);
  }

  eliminarPrestamo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/prestamos/${id}`);
  }
}

export function mensajeErrorApi(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado al comunicarse con el backend.';
  }
  if (error.status === 0) {
    return 'No hay conexión con el backend. Inicia Spring Boot en http://localhost:8080 e inténtalo de nuevo.';
  }
  if (error.status === 409) {
    return 'El backend no puede completar la operación porque el registro tiene datos asociados.';
  }
  if (error.status === 400) {
    return 'El backend rechazó los datos. Revisa los campos e inténtalo de nuevo.';
  }
  if (error.status === 401) {
    return 'Tu sesión venció o no tienes autorización. Inicia sesión de nuevo.';
  }
  if (error.status === 403) {
    return 'Tu rol no tiene permiso para realizar esta acción.';
  }
  return `El backend respondió con el error ${error.status}.`;
}