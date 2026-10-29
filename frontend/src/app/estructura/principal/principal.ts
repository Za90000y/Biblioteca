import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-principal',
  styleUrl: './principal.css',
  templateUrl: './principal.html',
})
export class Principal {
  @Input() bibliotecario = false;
}
