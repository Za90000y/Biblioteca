import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Autor, BibliotecaApi, Libro, LibroRequest, Pagina, Prestamo, mensajeErrorApi } from '../../core/biblioteca-api.service';

@Component({
  imports: [FormsModule],
  selector: 'app-libros',
  styleUrl: './libros.css',
  templateUrl: './libros.html',
})
export class Libros implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  readonly esBibliotecario = this.auth.rol === 'BIBLIOTECARIO';
  autores: Autor[] = [];
  libros: Libro[] = [];
  prestamosActivos: Prestamo[] = [];
  paginaActual = 0;
  totalPaginas = 0;
  filtro = '';
  filtroAutor = '';
  detalleId: number | null = null;
  actualId: number | null = null;
  cargando = true;
  guardando = false;
  error = '';
  mensajeSolicitud = '';
  solicitandoLibroId: number | null = null;
  formulario: LibroRequest = this.formularioVacio();

  ngOnInit(): void {
    if (this.esBibliotecario) {
      this.cargarAutores();
    } else {
      this.cargarPrestamosActivos();
      this.api.prestamosCambiaron$.subscribe(() => this.cargarPrestamosActivos());
    }
    this.cargar();
  }

  cargarPrestamosActivos(): void {
    this.api.obtenerMisPrestamos().subscribe({
      next: (prestamos) => {
        this.prestamosActivos = prestamos;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = mensajeErrorApi(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  solicitar(libro: Libro): void {
    this.solicitandoLibroId = libro.id;
    this.mensajeSolicitud = '';
    this.api.solicitarPrestamo(libro.id).subscribe({
      next: (prestamo) => {
        this.prestamosActivos = [...this.prestamosActivos, prestamo];
        this.solicitandoLibroId = null;
        this.mensajeSolicitud = `Solicitaste “${libro.titulo}”.`;
        this.api.notificarPrestamosActualizados();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.solicitandoLibroId = null;
        this.mensajeSolicitud = error instanceof HttpErrorResponse && error.status === 409
          ? 'No se pudo solicitar: el libro no está disponible o ya alcanzaste el límite de tres préstamos.'
          : mensajeErrorApi(error);
        this.changeDetector.markForCheck();
      },
    });
  }

  yaLoTengo(libroId: number): boolean {
    return this.prestamosActivos.some((prestamo) => prestamo.libro.id === libroId);
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.obtenerLibros(this.paginaActual, 10, this.filtro, this.filtroAutor).subscribe({
      next: (pagina: Pagina<Libro>) => {
        this.libros = pagina.content;
        this.totalPaginas = pagina.totalPages;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.cargando = false; this.changeDetector.markForCheck(); },
    });
  }

  cargarAutores(): void {
    this.api.obtenerAutores().subscribe({
      next: (autores) => { this.autores = autores; this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
  }

  buscar(): void {
    this.paginaActual = 0;
    this.cargar();
  }

  cambiarPagina(pagina: number): void {
    this.paginaActual = pagina;
    this.cargar();
  }

  alternarDetalle(libro: Libro): void {
    this.detalleId = this.detalleId === libro.id ? null : libro.id;
  }

  guardar(): void {
    this.guardando = true;
    this.error = '';
    const request = { ...this.formulario };
    const operacion = this.actualId === null
      ? this.api.crearLibro(request)
      : this.api.actualizarLibro(this.actualId, request);
    operacion.subscribe({
      next: () => { this.guardando = false; this.nuevo(); this.cargar(); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.guardando = false; this.changeDetector.markForCheck(); },
    });
  }

  editar(libro: Libro): void {
    this.actualId = libro.id;
    this.formulario = {
      titulo: libro.titulo,
      isbn: libro.isbn,
      anio: libro.anio,
      autorId: libro.autor.id,
    };
  }

  eliminar(libro: Libro): void {
    if (!confirm(`¿Eliminar el libro “${libro.titulo}”?`)) return;
    this.api.eliminarLibro(libro.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
  }

  nuevo(): void {
    this.actualId = null;
    this.formulario = this.formularioVacio();
  }

  private formularioVacio(): LibroRequest {
    return { titulo: '', isbn: '', anio: new Date().getFullYear(), autorId: 0 };
  }
}
