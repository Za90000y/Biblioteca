package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entidad.Libro;
import com.biblioteca.biblioteca.entidad.Autor;
import com.biblioteca.biblioteca.dto.LibroRequest;
import com.biblioteca.biblioteca.repository.AutorRepository;
import com.biblioteca.biblioteca.repository.LibroRepository;
import com.biblioteca.biblioteca.repository.PrestamoRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class LibroService {

    private final LibroRepository libroRepository;
    private final AutorRepository autorRepository;
    private final PrestamoRepository prestamoRepository;

    public LibroService(LibroRepository libroRepository, AutorRepository autorRepository,
            PrestamoRepository prestamoRepository) {
        this.libroRepository = libroRepository;
        this.autorRepository = autorRepository;
        this.prestamoRepository = prestamoRepository;
    }

    public Page<Libro> buscar(String titulo, String autor, Pageable pageable) {
        return libroRepository.buscar(vacioANull(titulo), vacioANull(autor), pageable);
    }

    public Optional<Libro> obtenerPorId(Long id) {
        return libroRepository.findById(id);
    }

    public Optional<Libro> guardar(LibroRequest request) {
        return autorRepository.findById(request.getAutorId()).map(autor -> {
            Libro libro = new Libro();
            copiarDatos(request, libro);
            libro.setAutor(autor);
            return libroRepository.save(libro);
        });
    }

    public Optional<Libro> actualizar(Long id, LibroRequest request) {
        Optional<Libro> libroExistente = libroRepository.findById(id);
        Optional<Autor> autor = autorRepository.findById(request.getAutorId());
        if (libroExistente.isEmpty() || autor.isEmpty()) {
            return Optional.empty();
        }
        Libro libro = libroExistente.get();
        copiarDatos(request, libro);
        libro.setAutor(autor.get());
        return Optional.of(libroRepository.save(libro));
    }

    public boolean eliminar(Long id) {
        if (!libroRepository.existsById(id)) {
            return false;
        }
        if (prestamoRepository.existsByLibro_Id(id)) {
            throw new IllegalStateException("No se puede eliminar un libro con préstamos asociados.");
        }
        libroRepository.deleteById(id);
        return true;
    }

    private void copiarDatos(LibroRequest request, Libro libro) {
        libro.setTitulo(request.getTitulo());
        libro.setIsbn(request.getIsbn());
        libro.setAnio(request.getAnio());
    }

    private String vacioANull(String valor) {
        return valor == null || valor.isBlank() ? null : valor;
    }
}