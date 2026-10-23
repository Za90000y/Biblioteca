import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BibliotecaApi, Usuario, UsuarioRequest, mensajeErrorApi } from '../../core/biblioteca-api.service';

@Component({
  imports: [FormsModule],
  selector: 'app-usuarios',
  styleUrl: './usuarios.css',
  templateUrl: './usuarios.html',
})
export class Usuarios implements OnInit {
  private readonly api = inject(BibliotecaApi);
  private readonly changeDetector = inject(ChangeDetectorRef);
  usuarios: Usuario[] = [];
  actualId: number | null = null;
  cargando = true;
  guardando = false;
  error = '';
  formulario: UsuarioRequest = this.formularioVacio();

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';
    this.api.obtenerUsuarios().subscribe({
      next: (usuarios) => { this.usuarios = usuarios; this.cargando = false; this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.cargando = false; this.changeDetector.markForCheck(); },
    });
  }

  guardar(): void {
    this.guardando = true;
    this.error = '';
    const request = { ...this.formulario };
    const operacion = this.actualId === null
      ? this.api.crearUsuario(request)
      : this.api.actualizarUsuario(this.actualId, request);
    operacion.subscribe({
      next: () => { this.guardando = false; this.nuevo(); this.cargar(); this.changeDetector.markForCheck(); },
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.guardando = false; this.changeDetector.markForCheck(); },
    });
  }

  editar(usuario: Usuario): void {
    this.actualId = usuario.id;
    this.formulario = {
      nombre: usuario.nombre,
      username: usuario.username,
      email: usuario.email,
      passwordHash: '',
      rol: usuario.rol,
      estado: usuario.estado,
    };
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`¿Eliminar el usuario ${usuario.username}?`)) return;
    this.api.eliminarUsuario(usuario.id).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => { this.error = mensajeErrorApi(error); this.changeDetector.markForCheck(); },
    });
  }

  nuevo(): void {
    this.actualId = null;
    this.formulario = this.formularioVacio();
  }

  private formularioVacio(): UsuarioRequest {
    return { nombre: '', username: '', email: '', passwordHash: '', rol: 'LECTOR', estado: 'ACTIVO' };
  }
}
