package com.biblioteca.biblioteca.repository;

import com.biblioteca.biblioteca.entidad.Autor;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AutorRepository extends JpaRepository<Autor, Long> {
}