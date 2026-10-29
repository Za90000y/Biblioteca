package com.biblioteca.biblioteca.repository;

import com.biblioteca.biblioteca.entidad.Prestamo;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PrestamoRepository extends JpaRepository<Prestamo, Long> {

    boolean existsByLibro_Id(Long libroId);

    boolean existsByUsuario_Id(Long usuarioId);

    boolean existsByLibro_IdAndDevueltoFalse(Long libroId);

    boolean existsByLibro_IdAndDevueltoFalseAndIdNot(Long libroId, Long prestamoId);

    long countByUsuario_IdAndDevueltoFalse(Long usuarioId);

    long countByUsuario_IdAndDevueltoFalseAndIdNot(Long usuarioId, Long prestamoId);

    List<Prestamo> findByUsuario_UsernameAndDevueltoFalseOrderByFechaPrestamoDesc(String username);

    List<Prestamo> findByUsuario_IdAndDevueltoFalseOrderByFechaPrestamoDesc(Long usuarioId);

    @Query("select p from Prestamo p join p.usuario u "
            + "where (:usuario is null or lower(u.nombre) like lower(concat('%', :usuario, '%')) "
            + "or lower(u.username) like lower(concat('%', :usuario, '%'))) ")
    Page<Prestamo> buscarPorUsuario(@Param("usuario") String usuario, Pageable pageable);
}