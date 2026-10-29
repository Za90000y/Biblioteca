package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.entidad.Autor;
import com.biblioteca.biblioteca.dto.AutorRequest;
import com.biblioteca.biblioteca.repository.AutorRepository;
import com.biblioteca.biblioteca.repository.LibroRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class AutorService {

    private final AutorRepository autorRepository;
    private final LibroRepository libroRepository;

    public AutorService(AutorRepository autorRepository, LibroRepository libroRepository) {
        this.autorRepository = autorRepository;
        this.libroRepository = libroRepository;
    }

    public List<Autor> obtenerTodos() {
        return autorRepository.findAll();
    }

    public Optional<Autor> obtenerPorId(Long id) {
        return autorRepository.findById(id);
    }

    public Autor guardar(AutorRequest request) {
        Autor autor = new Autor();
        copiarDatos(request, autor);
        return autorRepository.save(autor);
    }

    public Optional<Autor> actualizar(Long id, AutorRequest request) {
        return autorRepository.findById(id).map(autor -> {
            copiarDatos(request, autor);
            return autorRepository.save(autor);
        });
    }

    public boolean eliminar(Long id) {
        if (!autorRepository.existsById(id)) {
            return false;
        }
        if (libroRepository.existsByAutor_Id(id)) {
            throw new IllegalStateException("No se puede eliminar un autor que tiene libros asociados.");
        }
        autorRepository.deleteById(id);
        return true;
    }

    private void copiarDatos(AutorRequest request, Autor autor) {
        autor.setNombre(request.getNombre());
        autor.setApellido(request.getApellido());
        autor.setNacionalidad(request.getNacionalidad());
        autor.setFechaNacimiento(request.getFechaNacimiento());
    }
}