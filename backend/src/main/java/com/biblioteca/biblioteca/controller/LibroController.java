package com.biblioteca.biblioteca.controller;

import com.biblioteca.biblioteca.dto.LibroRequest;
import com.biblioteca.biblioteca.entidad.Libro;
import com.biblioteca.biblioteca.service.IsbnDuplicadoException;
import com.biblioteca.biblioteca.service.LibroService;
import jakarta.validation.Valid;
import java.util.Map;
import org.hibernate.exception.ConstraintViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/libros")
public class LibroController {

    private final LibroService libroService;

    public LibroController(LibroService libroService) {
        this.libroService = libroService;
    }

    @GetMapping
        public Page<Libro> buscar(@RequestParam(required = false) String titulo,
            @RequestParam(required = false) String autor,
            @PageableDefault(size = 10, sort = "titulo", direction = Sort.Direction.ASC) Pageable pageable) {
        return libroService.buscar(titulo, autor, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Libro> obtenerPorId(@PathVariable Long id) {
        return libroService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody LibroRequest request) {
        try {
            return libroService.guardar(request)
                    .map(guardado -> ResponseEntity.status(HttpStatus.CREATED).body(guardado))
                    .orElseGet(() -> ResponseEntity.badRequest().build());
        } catch (IsbnDuplicadoException exception) {
            return conflictoPorIsbn();
        } catch (DataIntegrityViolationException exception) {
            if (esRestriccionUnicaDeIsbn(exception)) {
                return conflictoPorIsbn();
            }
            throw exception;
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Libro> actualizar(@PathVariable Long id, @Valid @RequestBody LibroRequest request) {
        return libroService.actualizar(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            return libroService.eliminar(id)
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.notFound().build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private ResponseEntity<Map<String, String>> conflictoPorIsbn() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("mensaje", IsbnDuplicadoException.MENSAJE));
    }

    private boolean esRestriccionUnicaDeIsbn(Throwable exception) {
        for (Throwable causa = exception; causa != null; causa = causa.getCause()) {
            if (causa instanceof ConstraintViolationException violation
                    && "uk_libro_isbn".equalsIgnoreCase(violation.getConstraintName())) {
                return true;
            }
        }
        return false;
    }
}