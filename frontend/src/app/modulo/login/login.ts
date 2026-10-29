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
  password = '';
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

  limpiar(): void {
    this.username = '';
    this.password = '';
    this.error = '';
  }
}
