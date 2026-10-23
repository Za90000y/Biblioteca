import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BibliotecaApi, Libro, Pagina, Prestamo, PrestamoRequest, Usuario, mensajeErrorApi } from '../../core/biblioteca-api.service';

@Component({
  imports: [FormsModule],
  selector: 'app-prestamos',
  styleUrl: './prestamos.css',
  templateUrl: './prestamos.html',
})
export class Prestamos implements OnInit {
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  libros: Libro[] = [];
  usuarios: Usuario[] = [];
  prestamos: Prestamo[] = [];
  filtro = '';
  paginaActual = 0;
  totalPaginas = 0;
  actualId: number | null = null;
  cargando = true;
  guardando = false;
  error = '';
  formulario: PrestamoRequest = this.formularioVacio();

  ngOnInit(): void {
    this.cargarReferencias();
    this.cargar();
  }

  cargarReferencias(): void {
    this.api.obtenerLibros(0, 100).subscribe({
      next: (pagina) => { this.libros = pagina.content; this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
    this.api.obtenerUsuarios().subscribe({
      next: (usuarios) => { this.usuarios = usuarios.filter((usuario) => usuario.estado === 'ACTIVO'); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.obtenerPrestamos(this.paginaActual, 10, this.filtro).subscribe({
      next: (pagina: Pagina<Prestamo>) => {
        this.prestamos = pagina.content;
        this.totalPaginas = pagina.totalPages;
        this.cargando = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.cargando = false; this.changeDetector.markForCheck(); },
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

  guardar(): void {
    this.guardando = true;
    this.error = '';
    const request = { ...this.formulario, fechaDevolucion: this.formulario.fechaDevolucion || null };
    const operacion = this.actualId === null
      ? this.api.crearPrestamo(request)
      : this.api.actualizarPrestamo(this.actualId, request);
    operacion.subscribe({
      next: () => { this.guardando = false; this.nuevo(); this.cargar(); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.guardando = false; this.changeDetector.markForCheck(); },
    });
  }

  editar(prestamo: Prestamo): void {
    this.actualId = prestamo.id;
    this.formulario = {
      libroId: prestamo.libro.id,
      usuarioId: prestamo.usuario.id,
      fechaPrestamo: prestamo.fechaPrestamo,
      fechaDevolucion: prestamo.fechaDevolucion,
      devuelto: prestamo.devuelto,
    };
  }

  eliminar(prestamo: Prestamo): void {
    if (!confirm(`¿Eliminar el préstamo #${prestamo.id}?`)) return;
    this.api.eliminarPrestamo(prestamo.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
  }

  nuevo(): void {
    this.actualId = null;
    this.formulario = this.formularioVacio();
  }

  private formularioVacio(): PrestamoRequest {
    return {
      libroId: 0,
      usuarioId: 0,
      fechaPrestamo: new Date().toISOString().slice(0, 10),
      fechaDevolucion: null,
      devuelto: false,
    };
  }
}
