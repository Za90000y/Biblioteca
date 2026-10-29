package com.biblioteca.biblioteca.service;

import com.biblioteca.biblioteca.dto.AuthResponse;
import com.biblioteca.biblioteca.dto.LoginRequest;
import com.biblioteca.biblioteca.dto.RegistroRequest;
import com.biblioteca.biblioteca.entidad.EstadoUsuario;
import com.biblioteca.biblioteca.entidad.Rol;
import com.biblioteca.biblioteca.entidad.Usuario;
import com.biblioteca.biblioteca.repository.UsuarioRepository;
import com.biblioteca.biblioteca.security.JwtService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final Pattern BCRYPT_HASH =
            Pattern.compile("\\A\\$2[aby]\\$\\d{2}\\$[./A-Za-z0-9]{53}\\z");

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Optional<AuthResponse> iniciarSesion(LoginRequest request) {
        Optional<Usuario> resultado = usuarioRepository.findByUsername(request.username())
                .filter(usuario -> usuario.getEstado() == EstadoUsuario.ACTIVO)
                .filter(usuario -> validarPassword(usuario, request.password()));

        return resultado.map(this::crearRespuesta);
    }

    public Optional<AuthResponse> registrar(RegistroRequest request) {
        String username = request.username().trim();
        String email = request.email().trim();
        if (usuarioRepository.existsByUsername(username) || usuarioRepository.existsByEmail(email)) {
            return Optional.empty();
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre().trim());
        usuario.setUsername(username);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setRol(Rol.LECTOR);
        usuario.setEstado(EstadoUsuario.ACTIVO);
        return Optional.of(crearRespuesta(usuarioRepository.save(usuario)));
    }

    private AuthResponse crearRespuesta(Usuario usuario) {
        String token = jwtService.generarToken(usuario);
        return new AuthResponse(token, "Bearer", jwtService.obtenerDuracionMs() / 1000,
                usuario.getId(), usuario.getUsername(), usuario.getNombre(), usuario.getRol());
    }

    private boolean validarPassword(Usuario usuario, String password) {
        String almacenada = usuario.getPasswordHash();
        if (BCRYPT_HASH.matcher(almacenada).matches()) {
            return passwordEncoder.matches(password, almacenada);
        }
        if (almacenada.startsWith("$2")) {
            return false;
        }

        boolean coincide = MessageDigest.isEqual(
                almacenada.getBytes(StandardCharsets.UTF_8),
                password.getBytes(StandardCharsets.UTF_8));
        if (coincide) {
            usuario.setPasswordHash(passwordEncoder.encode(password));
            usuarioRepository.save(usuario);
        }
        return coincide;
    }
}
