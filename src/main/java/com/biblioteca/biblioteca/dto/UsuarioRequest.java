package com.biblioteca.biblioteca.dto;

import com.biblioteca.biblioteca.entidad.EstadoUsuario;
import com.biblioteca.biblioteca.entidad.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UsuarioRequest {

    @NotBlank
    @Size(max = 120)
    private String nombre;

    @NotBlank
    @Size(max = 50)
    private String username;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank
    @Size(max = 255)
    private String passwordHash;

    @NotNull
    private Rol rol;

    @NotNull
    private EstadoUsuario estado;
}