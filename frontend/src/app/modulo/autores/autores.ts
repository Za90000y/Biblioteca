import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Autor, AutorRequest, BibliotecaApi, mensajeErrorApi } from '../../core/biblioteca-api.service';

@Component({
  imports: [FormsModule],
  selector: 'app-autores',
  styleUrl: './autores.css',
  templateUrl: './autores.html',
})
export class Autores implements OnInit {
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  autores: Autor[] = [];
  actualId: number | null = null;
  cargando = true;
  guardando = false;
  error = '';
  formulario: AutorRequest = this.formularioVacio();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.obtenerAutores().subscribe({
      next: (autores) => { this.autores = autores; this.cargando = false; this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.cargando = false; this.changeDetector.markForCheck(); },
    });
  }

  guardar(): void {
    this.guardando = true;
    this.error = '';
    const request = { ...this.formulario };
    const operacion = this.actualId === null
      ? this.api.crearAutor(request)
      : this.api.actualizarAutor(this.actualId, request);
    operacion.subscribe({
      next: () => { this.guardando = false; this.nuevo(); this.cargar(); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.guardando = false; this.changeDetector.markForCheck(); },
    });
  }

  editar(autor: Autor): void {
    this.actualId = autor.id;
    this.formulario = {
      nombre: autor.nombre,
      apellido: autor.apellido,
      nacionalidad: autor.nacionalidad,
      fechaNacimiento: autor.fechaNacimiento,
    };
  }

  eliminar(autor: Autor): void {
    if (!confirm(`¿Eliminar a ${autor.nombre} ${autor.apellido}?`)) return;
    this.api.eliminarAutor(autor.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
  }

  nuevo(): void {
    this.actualId = null;
    this.formulario = this.formularioVacio();
  }

  private formularioVacio(): AutorRequest {
    return { nombre: '', apellido: '', nacionalidad: '', fechaNacimiento: '' };
  }
}
