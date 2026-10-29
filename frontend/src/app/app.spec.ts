import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './core/auth.interceptor';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    sessionStorage.removeItem('biblioteca.accessToken');
    sessionStorage.removeItem('biblioteca.rol');
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    })
      .compileComponents();
  });

  afterEach(() => {
    sessionStorage.removeItem('biblioteca.accessToken');
    sessionStorage.removeItem('biblioteca.rol');
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows the login without calling protected endpoints when there is no session', () => {
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectNone((request) => request.url.startsWith('/api/v1/'));
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-login')).not.toBeNull();
  });

  it('sends the stored JWT when checking the backend', async () => {
    sessionStorage.setItem('biblioteca.accessToken', 'test-token');
    sessionStorage.setItem('biblioteca.rol', 'BIBLIOTECARIO');
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const request = http.expectOne('/api/v1/libros?page=0&size=1');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 1,
    });
    await fixture.whenStable();
    responderSolicitudesBiblioteca(http);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-nav')).not.toBeNull();
    http.verify();
  });

  it('shows readers only books and their own loan workflow', async () => {
    sessionStorage.setItem('biblioteca.accessToken', 'reader-token');
    sessionStorage.setItem('biblioteca.rol', 'LECTOR');
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/v1/libros?page=0&size=1').flush({
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: 0,
      size: 1,
    });
    await fixture.whenStable();
    fixture.detectChanges();

    http.expectNone((request) => request.url.startsWith('/api/v1/usuarios'));
    const nav = (fixture.nativeElement as HTMLElement).querySelector('app-nav');
    expect(nav?.textContent).not.toContain('Lectores');
    responderSolicitudesBiblioteca(http);
    await fixture.whenStable();
    http.verify();
  });

  it('returns to login when the stored JWT is rejected', async () => {
    sessionStorage.setItem('biblioteca.accessToken', 'expired-token');
    sessionStorage.setItem('biblioteca.rol', 'BIBLIOTECARIO');
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/v1/libros?page=0&size=1').flush(null, {
      status: 401,
      statusText: 'Unauthorized',
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect(sessionStorage.getItem('biblioteca.accessToken')).toBeNull();
    expect((fixture.nativeElement as HTMLElement).querySelector('app-login')).not.toBeNull();
    http.verify();
  });

  it('blocks the library when the backend is unavailable', async () => {
    sessionStorage.setItem('biblioteca.accessToken', 'test-token');
    sessionStorage.setItem('biblioteca.rol', 'BIBLIOTECARIO');
    const fixture = TestBed.createComponent(App);
    const http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    http.expectOne('/api/v1/libros?page=0&size=1').flush('unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
    });
    await fixture.whenStable();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Backend no disponible');
    http.verify();
  });
});

function responderSolicitudesBiblioteca(http: HttpTestingController): void {
  for (const request of http.match(() => true)) {
    const esPagina = request.request.urlWithParams.includes('page=');
    request.flush(esPagina
      ? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 }
      : []);
  }
}
