package com.biblioteca.biblioteca.controller;

import com.biblioteca.biblioteca.dto.UsuarioRequest;
import com.biblioteca.biblioteca.entidad.Prestamo;
import com.biblioteca.biblioteca.entidad.Usuario;
import com.biblioteca.biblioteca.service.PrestamoService;
import com.biblioteca.biblioteca.service.UsuarioService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final PrestamoService prestamoService;

    public UsuarioController(UsuarioService usuarioService, PrestamoService prestamoService) {
        this.usuarioService = usuarioService;
        this.prestamoService = prestamoService;
    }

    @GetMapping
    public List<Usuario> obtenerTodos() {
        return usuarioService.obtenerTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/prestamos")
    public ResponseEntity<List<Prestamo>> obtenerPrestamosActivos(@PathVariable Long id) {
        return usuarioService.obtenerPorId(id)
                .map(usuario -> ResponseEntity.ok(prestamoService.obtenerActivosDelLector(id)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Usuario> crear(@Valid @RequestBody UsuarioRequest request) {
        if (request.getPasswordHash() == null || request.getPasswordHash().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.guardar(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Usuario> actualizar(@PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request) {
        return usuarioService.actualizar(id, request)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        try {
            return usuarioService.eliminar(id)
                    ? ResponseEntity.noContent().build()
                    : ResponseEntity.notFound().build();
        } catch (IllegalStateException exception) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }
}