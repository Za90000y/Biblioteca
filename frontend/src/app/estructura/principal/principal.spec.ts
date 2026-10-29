import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Principal } from './principal';

describe('Principal', () => {
  let component: Principal;
  let fixture: ComponentFixture<Principal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Principal],
    }).compileComponents();

    fixture = TestBed.createComponent(Principal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows only books and loans to readers', () => {
    const headings = fixture.nativeElement.querySelectorAll('h3') as NodeListOf<HTMLHeadingElement>;
    const titles = Array.from(headings, (heading) => heading.textContent?.trim());

    expect(titles).toEqual(['Libros', 'Préstamos']);
  });

  it('shows authors and users but not loans to librarians', () => {
    fixture.componentRef.setInput('bibliotecario', true);
    fixture.detectChanges();

    const headings = fixture.nativeElement.querySelectorAll('h3') as NodeListOf<HTMLHeadingElement>;
    const titles = Array.from(headings, (heading) => heading.textContent?.trim());

    expect(titles).toEqual(['Autores', 'Libros', 'Usuarios']);
  });
});
