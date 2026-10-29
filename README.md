# Biblioteca

Proyecto dividido en dos aplicaciones independientes:

- `frontend/`: Angular. Solo consume la API HTTP; no se conecta a MySQL.
- `backend/`: Spring Boot. Expone la API y es el único componente que accede a MySQL.
- `database/schema.sql`: esquema de la base de datos.

El contrato entre aplicaciones es la API versionada en `/api/v1`. La configuración de Angular está en `frontend/src/environments/`; el backend puede cambiar de dirección sin modificar los servicios de la interfaz. Para apuntar la interfaz a otro backend, cambia `apiBaseUrl` en el entorno de Angular correspondiente. En producción, configura también `APP_CORS_ALLOWED_ORIGINS` en el backend. Para desarrollo, `/api/v1` usa el proxy de `frontend/proxy.conf.json`.

## Requisitos

- Java 17 y Maven
- Node.js y npm
- MySQL

## Base de datos y configuración

1. Ejecuta `database/schema.sql` en MySQL.
2. Configura el backend mediante variables de entorno:
   - `DB_URL` (opcional; por defecto `jdbc:mysql://localhost:3306/biblioteca`)
   - `DB_USERNAME` (opcional; por defecto `root`)
   - `DB_PASSWORD`
   - `JWT_SECRET`: clave aleatoria codificada en Base64, de al menos 32 bytes.
   - `JWT_EXPIRATION_MS` (opcional; por defecto una hora).
   - `APP_CORS_ALLOWED_ORIGINS` (opcional; por defecto `http://localhost:4200`; admite varios orígenes separados por comas).

Por ejemplo, en PowerShell:

```powershell
$env:JWT_SECRET = openssl rand -base64 32
$env:DB_PASSWORD = "tu-clave-local"
```

Las acciones `run` y `debug` de NetBeans usan una clave JWT fija solo para desarrollo local. No reutilices esa clave fuera de tu entorno local; en producción configura `JWT_SECRET` como variable de entorno.

## Ejecutar

Abre el `pom.xml` de la raíz como proyecto Maven en NetBeans; `backend` aparecerá como módulo con sus fuentes. También puedes abrir `backend/pom.xml` directamente. Para ejecutar desde la raíz:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

En otra terminal, inicia Angular:

```powershell
cd frontend
npm.cmd ci
npm.cmd start
```

La aplicación queda en `http://localhost:4200`; el proxy de desarrollo reenvía `/api` a `http://localhost:8080`.

## API y roles

`POST /api/v1/auth/registro` permite registrar lectores y `POST /api/v1/auth/login` inicia sesión. Las demás solicitudes requieren el token JWT en el encabezado `Authorization: Bearer TOKEN`.

- `LECTOR`: consulta el catálogo, solicita libros disponibles y devuelve sus préstamos; no puede superar tres préstamos activos.
- `BIBLIOTECARIO`: gestiona el catálogo y consulta lectores y sus préstamos activos.

Las contraseñas se guardan con BCrypt. El backend también convierte a BCrypt las contraseñas preexistentes en texto plano al iniciar sesión correctamente.
