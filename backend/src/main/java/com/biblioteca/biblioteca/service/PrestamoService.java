package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.dto.PrestamoRequest;
import com.biblioteca.biblioteca.entidad.EstadoUsuario;
import com.biblioteca.biblioteca.entidad.Prestamo;
import com.biblioteca.biblioteca.repository.LibroRepository;
import com.biblioteca.biblioteca.repository.PrestamoRepository;
import com.biblioteca.biblioteca.repository.UsuarioRepository;
import java.util.Optional;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public List<Prestamo> obtenerActivosDelUsuario(String username) {
        return prestamoRepository.findByUsuario_UsernameAndDevueltoFalseOrderByFechaPrestamoDesc(username);
    }

    public List<Prestamo> obtenerActivosDelLector(Long usuarioId) {
        return prestamoRepository.findByUsuario_IdAndDevueltoFalseOrderByFechaPrestamoDesc(usuarioId);
    }

    @Transactional
    public Optional<Prestamo> solicitar(Long libroId, String username) {
        var usuario = usuarioRepository.findByUsernameForUpdate(username);
        var libro = libroRepository.findByIdForUpdate(libroId);
        if (usuario.isEmpty() || libro.isEmpty()) {
            return Optional.empty();
        }
        if (usuario.get().getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalStateException("El usuario no está activo.");
        }
        if (prestamoRepository.countByUsuario_IdAndDevueltoFalse(usuario.get().getId()) >= 3) {
            throw new IllegalStateException("No puedes tener más de tres préstamos activos.");
        }
        if (prestamoRepository.existsByLibro_IdAndDevueltoFalse(libroId)) {
            throw new IllegalStateException("Ese libro ya está prestado.");
        }

        Prestamo prestamo = new Prestamo();
        prestamo.setLibro(libro.get());
        prestamo.setUsuario(usuario.get());
        prestamo.setFechaPrestamo(LocalDate.now());
        prestamo.setDevuelto(false);
        return Optional.of(prestamoRepository.save(prestamo));
    }

    @Transactional
    public Optional<Prestamo> devolver(Long id, String username) {
        Optional<Prestamo> resultado = prestamoRepository.findById(id)
                .filter(prestamo -> prestamo.getUsuario().getUsername().equals(username))
                .filter(prestamo -> !prestamo.isDevuelto());
        return resultado.map(prestamo -> {
            prestamo.setDevuelto(true);
            prestamo.setFechaDevolucion(LocalDate.now());
            return prestamoRepository.save(prestamo);
        });
    }

    @Transactional
    public Optional<Prestamo> guardar(PrestamoRequest request) {
        var usuario = usuarioRepository.findByIdForUpdate(request.getUsuarioId());
        var libro = libroRepository.findByIdForUpdate(request.getLibroId());
        if (libro.isEmpty() || usuario.isEmpty()) {
            return Optional.empty();
        }
        if (usuario.get().getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalStateException("No se pueden registrar préstamos para usuarios inactivos.");
        }
        validarLimite(usuario.get().getId(), request.isDevuelto(), null);
        if (!request.isDevuelto() && prestamoRepository.existsByLibro_IdAndDevueltoFalse(request.getLibroId())) {
            throw new IllegalStateException("Ese libro ya está prestado.");
        }

        Prestamo prestamo = new Prestamo();
        copiarDatos(request, prestamo);
        prestamo.setLibro(libro.get());
        prestamo.setUsuario(usuario.get());
        return Optional.of(prestamoRepository.save(prestamo));
    }

    @Transactional
    public Optional<Prestamo> actualizar(Long id, PrestamoRequest request) {
        Optional<Prestamo> existente = prestamoRepository.findById(id);
        var usuario = usuarioRepository.findByIdForUpdate(request.getUsuarioId());
        var libro = libroRepository.findByIdForUpdate(request.getLibroId());
        if (existente.isEmpty() || libro.isEmpty() || usuario.isEmpty()) {
            return Optional.empty();
        }
        if (usuario.get().getEstado() != EstadoUsuario.ACTIVO) {
            throw new IllegalStateException("No se pueden registrar préstamos para usuarios inactivos.");
        }
        validarLimite(usuario.get().getId(), request.isDevuelto(), id);
        if (!request.isDevuelto()
                && prestamoRepository.existsByLibro_IdAndDevueltoFalseAndIdNot(request.getLibroId(), id)) {
            throw new IllegalStateException("Ese libro ya está prestado.");
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

    private void validarLimite(Long usuarioId, boolean devuelto, Long prestamoId) {
        if (devuelto) {
            return;
        }
        long activos = prestamoId == null
                ? prestamoRepository.countByUsuario_IdAndDevueltoFalse(usuarioId)
                : prestamoRepository.countByUsuario_IdAndDevueltoFalseAndIdNot(usuarioId, prestamoId);
        if (activos >= 3) {
            throw new IllegalStateException("Un lector no puede tener más de tres préstamos activos.");
        }
    }
}