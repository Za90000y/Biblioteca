import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from '../../core/auth.interceptor';
import { Login } from './login';

describe('Login', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;

  afterEach(() => {
    sessionStorage.removeItem('biblioteca.accessToken');
    sessionStorage.removeItem('biblioteca.rol');
  });

  beforeEach(async () => {
    sessionStorage.removeItem('biblioteca.accessToken');
    sessionStorage.removeItem('biblioteca.rol');
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('authenticates with the backend and stores the access token', () => {
    const http = TestBed.inject(HttpTestingController);
    component.email = ' lector@example.com ';
    component.password = 'secreto';

    component.iniciarSesion();

    const request = http.expectOne('/api/v1/auth/login');
    expect(request.request.body).toEqual({ email: 'lector@example.com', password: 'secreto' });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({
      accessToken: 'jwt-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      userId: 1,
      username: 'lector',
      nombre: 'Lector',
      rol: 'LECTOR',
    });

    expect(sessionStorage.getItem('biblioteca.accessToken')).toBe('jwt-token');
    expect(sessionStorage.getItem('biblioteca.rol')).toBe('LECTOR');
    expect(component.password).toBe('');
    http.verify();
  });

  it('registers a reader and stores the returned session', () => {
    const http = TestBed.inject(HttpTestingController);
    component.nombre = ' Lector ';
    component.email = ' lector@example.com ';
    component.username = ' lector ';
    component.password = 'secreto123';
    component.confirmarPassword = 'secreto123';

    component.registrar();

    const request = http.expectOne('/api/v1/auth/registro');
    expect(request.request.body).toEqual({
      nombre: 'Lector',
      email: 'lector@example.com',
      username: 'lector',
      password: 'secreto123',
    });
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({
      accessToken: 'reader-token',
      tokenType: 'Bearer',
      expiresIn: 3600,
      userId: 2,
      username: 'lector',
      nombre: 'Lector',
      rol: 'LECTOR',
    });

    expect(sessionStorage.getItem('biblioteca.accessToken')).toBe('reader-token');
    expect(sessionStorage.getItem('biblioteca.rol')).toBe('LECTOR');
    http.verify();
  });
});
