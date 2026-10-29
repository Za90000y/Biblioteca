import { Component, Input } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-nav',
  styleUrl: './nav.css',
  templateUrl: './nav.html',
})
export class Nav {
  @Input() bibliotecario = false;
}
