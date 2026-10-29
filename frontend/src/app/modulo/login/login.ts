import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { mensajeErrorApi } from '../../core/biblioteca-api.service';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Output() readonly loginExitoso = new EventEmitter<void>();

  username = '';
  nombre = '';
  email = '';
  password = '';
  confirmarPassword = '';
  modoRegistro = false;
  error = '';
  ingresando = false;

  iniciarSesion(): void {
    this.ingresando = true;
    this.error = '';
    this.auth.iniciarSesion({ username: this.username.trim(), password: this.password }).subscribe({
      next: () => {
        this.ingresando = false;
        this.password = '';
        this.loginExitoso.emit();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof HttpErrorResponse && error.status === 401
          ? 'Usuario o contraseña incorrectos.'
          : mensajeErrorApi(error);
        this.ingresando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  registrar(): void {
    this.error = '';
    if (this.password !== this.confirmarPassword) {
      this.error = 'Las contraseñas no coinciden.';
      return;
    }

    this.ingresando = true;
    this.auth.registrar({
      nombre: this.nombre.trim(),
      email: this.email.trim(),
      username: this.username.trim(),
      password: this.password,
    }).subscribe({
      next: () => {
        this.ingresando = false;
        this.password = '';
        this.confirmarPassword = '';
        this.loginExitoso.emit();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.error = error instanceof HttpErrorResponse && error.status === 409
          ? 'Ese usuario o correo ya está registrado.'
          : mensajeErrorApi(error);
        this.ingresando = false;
        this.changeDetector.markForCheck();
      },
    });
  }

  mostrarRegistro(): void {
    this.modoRegistro = true;
    this.error = '';
  }

  mostrarLogin(): void {
    this.modoRegistro = false;
    this.error = '';
  }

  limpiar(): void {
    this.username = '';
    this.nombre = '';
    this.email = '';
    this.password = '';
    this.confirmarPassword = '';
    this.error = '';
  }
}
