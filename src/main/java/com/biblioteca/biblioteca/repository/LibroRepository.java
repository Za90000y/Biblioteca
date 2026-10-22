package com.biblioteca.biblioteca.repository;

import com.biblioteca.biblioteca.entidad.Libro;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LibroRepository extends JpaRepository<Libro, Long> {

    boolean existsByAutor_Id(Long autorId);

    @Query("select l from Libro l join l.autor a "
            + "where (:titulo is null or lower(l.titulo) like lower(concat('%', :titulo, '%'))) "
            + "and (:autor is null or lower(a.nombre) like lower(concat('%', :autor, '%')) "
            + "or lower(a.apellido) like lower(concat('%', :autor, '%')) "
            + "or lower(concat(a.nombre, ' ', a.apellido)) like lower(concat('%', :autor, '%'))) ")
    Page<Libro> buscar(@Param("titulo") String titulo, @Param("autor") String autor, Pageable pageable);
}