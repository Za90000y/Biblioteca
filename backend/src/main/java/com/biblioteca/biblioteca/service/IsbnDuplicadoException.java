package com.biblioteca.biblioteca.service;

public class IsbnDuplicadoException extends RuntimeException {

    public static final String MENSAJE = "Ya existe un libro con ese ISBN.";

    public IsbnDuplicadoException() {
        super(MENSAJE);
    }
}
