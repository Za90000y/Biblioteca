package com.biblioteca.biblioteca.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import java.time.LocalDate;
import lombok.Data;

@Data
public class PrestamoRequest {

    @NotNull
    private Long libroId;

    @NotNull
    private Long usuarioId;

    @NotNull
    @PastOrPresent
    private LocalDate fechaPrestamo;

    private LocalDate fechaDevolucion;

    private boolean devuelto;

    @AssertTrue(message = "La fecha de devolución no puede ser anterior al préstamo")
    public boolean isFechaDevolucionValida() {
        return fechaDevolucion == null || fechaPrestamo == null
                || !fechaDevolucion.isBefore(fechaPrestamo);
    }

    @AssertTrue(message = "Un préstamo devuelto debe tener fecha de devolución")
    public boolean isFechaDevolucionPresente() {
        return !devuelto || fechaDevolucion != null;
    }
}