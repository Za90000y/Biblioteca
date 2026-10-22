package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.dto.PrestamoRequest;
import com.biblioteca.biblioteca.entidad.EstadoUsuario;
import com.biblioteca.biblioteca.entidad.Prestamo;
import com.biblioteca.biblioteca.repository.LibroRepository;
import com.biblioteca.biblioteca.repository.PrestamoRepository;
import com.biblioteca.biblioteca.repository.UsuarioRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class PrestamoService {

    private final PrestamoRepository prestamoRepository;
    private final LibroRepository libroRepository;
    private final UsuarioRepository usuarioRepository;

    public PrestamoService(PrestamoRepository prestamoRepository, LibroRepository libroRepository,
            UsuarioRepository usuarioRepository) {
        this.prestamoRepository = prestamoRepository;
        this.libroRepository = libroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Page<Prestamo> buscarPorUsuario(String usuario, Pageable pageable) {
        String filtro = usuario == null || usuario.isBlank() ? null : usuario;
        return prestamoRepository.buscarPorUsuario(filtro, pageable);
    }

    public Optional<Prestamo> obtenerPorId(Long id) {
        return prestamoRepository.findById(id);
    }

    public Optional<Prestamo> guardar(PrestamoRequest request) {
        var libro = libroRepository.findById(request.getLibroId());
        var usuario = usuarioRepository.findById(request.getUsuarioId());
        if (libro.isEmpty() || usuario.isEmpty()) {
            return Optional.empty();
        }
        if (usuario.get().getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalStateException("No se pueden registrar préstamos para usuarios inactivos.");
        }

        Prestamo prestamo = new Prestamo();
        copiarDatos(request, prestamo);
        prestamo.setLibro(libro.get());
        prestamo.setUsuario(usuario.get());
        return Optional.of(prestamoRepository.save(prestamo));
    }

    public Optional<Prestamo> actualizar(Long id, PrestamoRequest request) {
        Optional<Prestamo> existente = prestamoRepository.findById(id);
        var libro = libroRepository.findById(request.getLibroId());
        var usuario = usuarioRepository.findById(request.getUsuarioId());
        if (existente.isEmpty() || libro.isEmpty() || usuario.isEmpty()) {
            return Optional.empty();
        }
        if (usuario.get().getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalStateException("No se pueden registrar préstamos para usuarios inactivos.");
        }

        Prestamo prestamo = existente.get();
        copiarDatos(request, prestamo);
        prestamo.setLibro(libro.get());
        prestamo.setUsuario(usuario.get());
        return Optional.of(prestamoRepository.save(prestamo));
    }

    public boolean eliminar(Long id) {
        if (!prestamoRepository.existsById(id)) {
            return false;
        }
        prestamoRepository.deleteById(id);
        return true;
    }

    private void copiarDatos(PrestamoRequest request, Prestamo prestamo) {
        prestamo.setFechaPrestamo(request.getFechaPrestamo());
        prestamo.setFechaDevolucion(request.getFechaDevolucion());
        prestamo.setDevuelto(request.isDevuelto());
    }
}