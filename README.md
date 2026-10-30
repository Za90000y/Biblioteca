# Biblioteca

Proyecto dividido en dos aplicaciones independientes:

- `frontend/`: Angular. Consume la API HTTP; no se conecta directamente a MySQL.
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
$env:JWT_SECRET = (openssl rand -base64 32)
$env:DB_PASSWORD = "tu-clave-local"
```

Las acciones `run` y `debug` de NetBeans usan una clave JWT fija solo para desarrollo local. No reutilices esa clave fuera de tu entorno local; en producción configura `JWT_SECRET` como variable de entorno.

## Ejecutar

Abre el `pom.xml` de la raíz como proyecto Maven en NetBeans; `backend` aparecerá como módulo con sus fuentes. También puedes abrir `backend/pom.xml` directamente. Para ejecutar desde la raíz:

```powershell
mvn -f backend/pom.xml spring-boot:run
```

`spring-boot:run` es un objetivo del plugin de Spring Boot para Maven: compila y ejecuta la aplicación sin tener que crear y lanzar manualmente el JAR. Para ejecutar las pruebas del backend:

```powershell
mvn -f backend/pom.xml test
```

En otra terminal de PowerShell, inicia Angular desde el directorio del proyecto:

```powershell
Set-Location 'D:\Users\ANDRES\Documents\NetBeansProjects\Biblioteca\frontend'
npm.cmd start
```

`npm.cmd start` ejecuta el script `start` de `frontend/package.json` (`ng serve`) y deja el servidor de desarrollo activo mientras esa terminal siga abierta. La aplicación queda en `http://localhost:4200`; el proxy de desarrollo reenvía `/api` a `http://localhost:8080`. `npm.cmd ci` solo hace falta la primera vez o cuando se reinstalan las dependencias, no cada vez que se inicia el servidor.

## API y roles

- `POST /api/v1/auth/registro` permite registrar lectores.
- `POST /api/v1/auth/login` inicia sesión.
- Las demás solicitudes requieren el token JWT en el encabezado `Authorization`, usando el esquema `Bearer`.
- `LECTOR`: consulta el catálogo, solicita libros disponibles y devuelve sus préstamos; no puede superar tres préstamos activos.
- `BIBLIOTECARIO`: gestiona el catálogo y consulta lectores y sus préstamos activos.

Las contraseñas se guardan con BCrypt. El backend también convierte a BCrypt las contraseñas preexistentes en texto plano al iniciar sesión correctamente.

## Anotaciones y componentes de Spring que aparecen en el proyecto

En Java, muchas cosas que parecen “comandos” de Spring son **anotaciones**: empiezan por `@` y le indican al framework qué responsabilidad tiene una clase o método.

| Anotación | Para qué sirve | Ejemplo en esta aplicación |
|---|---|---|
| `@SpringBootApplication` | Marca el punto de entrada y activa la configuración automática de Spring Boot. | Clase principal `BibliotecaApplication`. |
| `@RestController` | Declara un controlador HTTP y convierte los valores devueltos en respuestas, normalmente JSON. | `UsuarioController`. |
| `@RequestMapping("/api/v1/usuarios")` | Define una ruta base compartida por los métodos del controlador. | Las rutas de usuarios comienzan con `/api/v1/usuarios`. |
| `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping` | Asocian un método Java con un verbo HTTP y, opcionalmente, una ruta. | Consultar, crear, actualizar y eliminar usuarios. |
| `@PathVariable` | Obtiene un valor que viene dentro de la ruta, como el identificador de un usuario. | `GET /api/v1/usuarios/{id}`. |
| `@RequestBody` | Convierte el JSON recibido en un objeto Java. | El JSON de creación se convierte en `UsuarioRequest`. |
| `@Valid` | Ejecuta las reglas de validación declaradas en el DTO antes de continuar. | Comprueba nombre, email y rol en `UsuarioRequest`. |
| `@Service` | Marca una clase que contiene lógica de negocio y puede ser inyectada por Spring. | `UsuarioService`. |
| `JpaRepository<Usuario, Long>` | Proporciona operaciones de persistencia como `findAll`, `findById`, `save` y `deleteById`. | `UsuarioRepository`. |
| `@Entity`, `@Id`, `@Column` | Mapean una clase y sus propiedades a una tabla y sus columnas. | `Usuario` se guarda en la tabla `usuario`. |
| `@Configuration`, `@Bean` | Permiten registrar configuración y objetos administrados por Spring. | `SecurityConfig` registra el filtro de seguridad y el codificador BCrypt. |

### Cómo viaja una petición

Por ejemplo, al crear un usuario:

1. Angular envía un `POST` con JSON a `/api/v1/usuarios`.
2. `UsuarioController` recibe el JSON con `@RequestBody` y valida el DTO con `@Valid`.
3. `UsuarioService` aplica las reglas de negocio y codifica la contraseña.
4. `UsuarioRepository.save(...)` persiste la entidad mediante JPA.
5. Spring devuelve el resultado como JSON y el controlador indica `201 Created`.

El controlador atiende HTTP, el servicio concentra la lógica de negocio y el repositorio se encarga del acceso a datos. Mantener separadas esas responsabilidades hace más fácil agregar cambios sin mezclar SQL, reglas de negocio y respuestas HTTP.
