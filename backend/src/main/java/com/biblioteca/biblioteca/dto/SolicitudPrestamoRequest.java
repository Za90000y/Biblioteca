package com.biblioteca.biblioteca.dto;

import jakarta.validation.constraints.NotNull;

public record SolicitudPrestamoRequest(@NotNull Long libroId) {
}
