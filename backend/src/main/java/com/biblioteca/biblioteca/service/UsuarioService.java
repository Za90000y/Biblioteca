package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.dto.UsuarioRequest;
import com.biblioteca.biblioteca.entidad.Usuario;
import com.biblioteca.biblioteca.repository.PrestamoRepository;
import com.biblioteca.biblioteca.repository.UsuarioRepository;
import java.util.List;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PrestamoRepository prestamoRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PrestamoRepository prestamoRepository,
            PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.prestamoRepository = prestamoRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Usuario> obtenerTodos() {
        return usuarioRepository.findAll();
    }

    public Optional<Usuario> obtenerPorId(Long id) {
        return usuarioRepository.findById(id);
    }

    public Usuario guardar(UsuarioRequest request) {
        Usuario usuario = new Usuario();
        copiarDatos(request, usuario);
        return usuarioRepository.save(usuario);
    }

    public Optional<Usuario> actualizar(Long id, UsuarioRequest request) {
        return usuarioRepository.findById(id).map(usuario -> {
            copiarDatos(request, usuario);
            return usuarioRepository.save(usuario);
        });
    }

    public boolean eliminar(Long id) {
        if (!usuarioRepository.existsById(id)) {
            return false;
        }
        if (prestamoRepository.existsByUsuario_Id(id)) {
            throw new IllegalStateException("No se puede eliminar un usuario con préstamos asociados.");
        }
        usuarioRepository.deleteById(id);
        return true;
    }

    private void copiarDatos(UsuarioRequest request, Usuario usuario) {
        usuario.setNombre(request.getNombre());
        usuario.setUsername(request.getUsername());
        usuario.setEmail(request.getEmail());
        if (request.getPasswordHash() != null && !request.getPasswordHash().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(request.getPasswordHash()));
        }
        usuario.setRol(request.getRol());
        usuario.setEstado(request.getEstado());
    }
}