# Biblioteca

Aplicación de biblioteca con backend Spring Boot y frontend Angular.

## Requisitos

- Java 17 y Maven
- Node.js y npm
- MySQL con la base de datos `biblioteca`

## Ejecución

1. Inicia MySQL y verifica la conexión configurada en `src/main/resources/application.properties`.
2. Inicia el backend Spring Boot desde NetBeans o con `mvn spring-boot:run`. La API debe quedar disponible en `http://localhost:8080`.
3. En otra terminal, ejecuta:

	```powershell
	cd frontend
	npm.cmd ci
	npm.cmd start
	```

4. Abre `http://localhost:4200`.

Angular reenvía `/api` al backend mediante `frontend/proxy.conf.json`. La interfaz consulta la API al iniciar y permanece bloqueada si Spring Boot no responde; no usa datos de demostración ni almacenamiento local.

## API conectada

- `/api/v1/autores`
- `/api/v1/libros`
- `/api/v1/usuarios`
- `/api/v1/prestamos`

El backend actual no implementa autenticación. Además, recibe `passwordHash` directamente y lo persiste sin aplicar un algoritmo de hash; no uses contraseñas reales hasta corregir ese comportamiento en el backend.
