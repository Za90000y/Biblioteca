import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Autor, BibliotecaApi, Libro, LibroRequest, Pagina, mensajeErrorApi } from '../../core/biblioteca-api.service';

@Component({
  imports: [FormsModule],
  selector: 'app-libros',
  styleUrl: './libros.css',
  templateUrl: './libros.html',
})
export class Libros implements OnInit {
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  autores: Autor[] = [];
  libros: Libro[] = [];
  paginaActual = 0;
  totalPaginas = 0;
  filtro = '';
  actualId: number | null = null;
  cargando = true;
  guardando = false;
  error = '';
  formulario: LibroRequest = this.formularioVacio();

  ngOnInit(): void {
    this.cargarAutores();
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.obtenerLibros(this.paginaActual, 10, this.filtro).subscribe({
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
