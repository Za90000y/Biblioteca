package com.biblioteca.biblioteca.dto;

import com.biblioteca.biblioteca.entidad.Rol;

public record AuthResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        Long userId,
        String username,
        String nombre,
        Rol rol) {
}
