package com.biblioteca.biblioteca.repository;

import com.biblioteca.biblioteca.entidad.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}