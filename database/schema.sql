CREATE DATABASE IF NOT EXISTS biblioteca;
USE biblioteca;

CREATE TABLE IF NOT EXISTS autor (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(80) NOT NULL,
    apellido VARCHAR(80) NOT NULL,
    nacionalidad VARCHAR(80) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS libro (
    id BIGINT NOT NULL AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    isbn VARCHAR(20) NOT NULL,
    anio INT NOT NULL,
    autor_id BIGINT NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_libro_isbn (isbn),
    CONSTRAINT fk_libro_autor FOREIGN KEY (autor_id) REFERENCES autor (id)
);

CREATE TABLE IF NOT EXISTS usuario (
    id BIGINT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(120) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(150) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(10) NOT NULL,
    estado VARCHAR(10) NOT NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_usuario_username (username),
    UNIQUE KEY uk_usuario_email (email)
);

CREATE TABLE IF NOT EXISTS prestamo (
    id BIGINT NOT NULL AUTO_INCREMENT,
    libro_id BIGINT NOT NULL,
    usuario_id BIGINT NOT NULL,
    fecha_prestamo DATE NOT NULL,
    fecha_devolucion DATE NULL,
    devuelto BOOLEAN NOT NULL DEFAULT FALSE,
    PRIMARY KEY (id),
    CONSTRAINT fk_prestamo_libro FOREIGN KEY (libro_id) REFERENCES libro (id),
    CONSTRAINT fk_prestamo_usuario FOREIGN KEY (usuario_id) REFERENCES usuario (id)
);