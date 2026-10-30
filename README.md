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

## Ejecutar

Abre `backend/pom.xml` como proyecto Maven en NetBeans, o ejecuta desde la raíz:

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

## EJEMPLO AÑADIR CAMPO PRÓLOGO EN LIBROS


- Dentro de backend/src/main/java/com/biblioteca/biblioteca/:

1. entidad/Libro.java: aquí se define el libro que se guarda en la base de datos. Agregar el campo permite que el backend lo maneje como parte de cada libro.
2. dto/LibroRequest.java: define los datos que la API acepta al crear o editar un libro. Aquí se incorpora el campo y sus validaciones.
3. service/LibroService.java: aquí se copian los datos de la solicitud al libro, tanto al crear como al actualizarlo. Si no se incluye aquí, el prólogo podría recibirse pero no guardarse.
4. Base de datos: reservar espacio para el campo

- En database/:

1. schema.sql: describe la estructura inicial de las tablas. Agregar allí la columna permite que las instalaciones nuevas tengan el campo.
2. Si la base de datos ya existe, también hay que aplicar una migración para agregar la columna a esa tabla existente. Editar schema.sql no cambia por sí solo las bases ya creadas.
3. Frontend: enviar y mostrar el dato

- Dentro de frontend/src/app/:

1. core/biblioteca-api.service.ts: contiene las interfaces Libro y LibroRequest, que representan los datos recibidos y enviados por Angular. Se actualizan para que TypeScript reconozca prologo.
2. modulo/libros/libros.ts: gestiona el formulario y la edición. Se actualizan los valores iniciales y la carga del prólogo al editar.
3. modulo/libros/libros.html: contiene la pantalla de libros. Aquí se agrega el campo al formulario y se muestra en el detalle del libro.