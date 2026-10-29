import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './core/auth.service';
import { BibliotecaApi, mensajeErrorApi } from './core/biblioteca-api.service';
import { Autores } from './modulo/autores/autores';
import { Libros } from './modulo/libros/libros';
import { Prestamos } from './modulo/prestamos/prestamos';
import { Usuarios } from './modulo/usuarios/usuarios';
import { Footer } from './estructura/footer/footer';
import { Header } from './estructura/header/header';
import { Nav } from './estructura/nav/nav';
import { Principal } from './estructura/principal/principal';
import { Login } from './modulo/login/login';

@Component({
  imports: [Header, Nav, Principal, Autores, Libros, Usuarios, Prestamos, Footer, Login],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  conectado = false;
  comprobando = true;
  requiereLogin = false;
  error = '';

  get esBibliotecario(): boolean {
    return this.auth.rol === 'BIBLIOTECARIO';
  }

  ngOnInit(): void {
    if (!this.auth.estaAutenticado()) {
      this.requiereLogin = true;
      this.comprobando = false;
      return;
    }
    this.comprobarBackend();
  }

  comprobarBackend(): void {
    this.comprobando = true;
    this.requiereLogin = false;
    this.error = '';
    this.api.obtenerAutores().subscribe({
      next: () => {
        this.conectado = true;
        this.comprobando = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.conectado = false;
        this.comprobando = false;
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.auth.cerrarSesion();
          this.requiereLogin = true;
          this.error = '';
        } else {
          this.error = mensajeErrorApi(error);
        }
        this.changeDetector.markForCheck();
      },
    });
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.conectado = false;
    this.requiereLogin = true;
    this.error = '';
  }
}
