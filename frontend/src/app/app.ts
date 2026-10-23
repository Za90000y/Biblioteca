import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { BibliotecaApi, mensajeErrorApi } from './core/biblioteca-api.service';
import { Autores } from './modulo/autores/autores';
import { Libros } from './modulo/libros/libros';
import { Prestamos } from './modulo/prestamos/prestamos';
import { Usuarios } from './modulo/usuarios/usuarios';
import { Footer } from './estructura/footer/footer';
import { Header } from './estructura/header/header';
import { Nav } from './estructura/nav/nav';
import { Principal } from './estructura/principal/principal';

@Component({
  imports: [Header, Nav, Principal, Autores, Libros, Usuarios, Prestamos, Footer],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App implements OnInit {
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  conectado = false;
  comprobando = true;
  error = '';

  ngOnInit(): void {
    this.comprobarBackend();
  }

  comprobarBackend(): void {
    this.comprobando = true;
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
        this.error = mensajeErrorApi(error);
        this.changeDetector.markForCheck();
      },
    });
  }
}
