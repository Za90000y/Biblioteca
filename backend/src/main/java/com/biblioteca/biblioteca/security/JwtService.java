package com.biblioteca.biblioteca.security;

import com.biblioteca.biblioteca.entidad.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final SecretKey signingKey;
    private final long expirationMs;

    public JwtService(@Value("${jwt.secret}") String base64Secret,
            @Value("${jwt.expiration-ms:3600000}") long expirationMs) {
        this.signingKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(base64Secret));
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("jwt.expiration-ms debe ser mayor que cero.");
        }
        this.expirationMs = expirationMs;
    }

    public String generarToken(Usuario usuario) {
        Date ahora = new Date();
        return Jwts.builder()
                .subject(usuario.getUsername())
                .claim("rol", usuario.getRol().name())
                .issuedAt(ahora)
                .expiration(new Date(ahora.getTime() + expirationMs))
                .signWith(signingKey)
                .compact();
    }

    public Claims validarToken(String token) {
        Jws<Claims> claims = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token);
        return claims.getPayload();
    }

    public long obtenerDuracionMs() {
        return expirationMs;
    }
}
