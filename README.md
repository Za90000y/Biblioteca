# Biblioteca

Aplicación de biblioteca con backend Spring Boot y frontend Angular.

## Requisitos

- Java 17 y Maven
- Node.js y npm
- MySQL con la base de datos `biblioteca`

## Ejecución

1. Inicia MySQL y verifica la conexión configurada en `src/main/resources/application.properties`.
2. Configura `JWT_SECRET` con una clave aleatoria codificada en Base64 de al menos 32 bytes. Por ejemplo, con OpenSSL:

	```powershell
	$env:JWT_SECRET = openssl rand -base64 32
	```

	El token dura una hora por defecto; puedes cambiarlo con `JWT_EXPIRATION_MS` (milisegundos).
3. Inicia el backend Spring Boot desde NetBeans o con `mvn spring-boot:run`. La API debe quedar disponible en `http://localhost:8080`.
4. En otra terminal, ejecuta:

	```powershell
	cd frontend
	npm.cmd ci
	npm.cmd start
	```

5. Abre `http://localhost:4200`.

Angular reenvía `/api` al backend mediante `frontend/proxy.conf.json`. La interfaz consulta la API al iniciar y permanece bloqueada si Spring Boot no responde o si la API rechaza las solicitudes; no usa datos de demostración ni almacenamiento local.

## Autenticación de API

`POST /api/v1/auth/login` es público y recibe `{"username":"...","password":"..."}`. Devuelve un `accessToken` JWT junto con el tipo, vencimiento e información básica del usuario. Envía el token en las demás solicitudes:

```http
Authorization: Bearer TOKEN
```

Todos los demás endpoints `/api/v1/**` requieren un token válido. El backend guarda las contraseñas nuevas con BCrypt; si encuentra una contraseña previa en texto plano, la convierte a BCrypt después de un inicio de sesión exitoso.

La interfaz Angular todavía no implementa el formulario de login ni adjunta el token a sus solicitudes; por eso, sus llamadas a la API protegida recibirán `401` hasta integrar ese flujo en el frontend.
