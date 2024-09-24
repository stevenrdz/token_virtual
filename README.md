# API de Token Virtual

Este proyecto es una API para la generación y uso de tokens virtuales, diseñada con **Node.js**, **Express**, y **MySQL**. La API incluye funcionalidades de autenticación de usuarios, generación de tokens, uso de tokens y una vista de historial de tokens generados por los usuarios.

## Requisitos Previos

Para ejecutar este proyecto en tu entorno local, necesitarás tener instalados los siguientes programas:

- [Node.js](https://nodejs.org/)
- [MySQL](https://www.mysql.com/)
- [npm](https://www.npmjs.com/)

## Configuración del Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables de entorno para conectar la base de datos y configurar la aplicación:

```bash
PORT=3001
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=nombre_de_tu_base_de_datos
JWT_SECRET=tu_secreto_jwt
TOKEN_EXPIRATION=60 # Expiración del token en segundos (por defecto 60)
```

## Instalación

### Clona el repositorio y navega a la carpeta del proyecto:

```bash

git clone https://github.com/stevenrdz/token_virtual.git
cd token-virtual
```

### Instala las dependencias del proyecto con:
```bash
npm install
```

## Ejecutar la Aplicación en Desarrollo

Para ejecutar la aplicación en modo de desarrollo, utiliza:

```bash

npm start
La API estará disponible en http://localhost:3001.
```

## Documentación de la API
Puedes acceder a la documentación de la API generada con Swagger en:

```bash
http://localhost:3001/api-docs/
```

## Endpoints Principales

### Registro de Usuarios
```bash
URL: /register
Método: POST
Descripción: Registra a un nuevo usuario.
Body:
{
  "nombre": "Tu Nombre",
  "email": "tu_email@example.com",
  "password": "tu_password"
}
```

### Login de Usuarios
```bash
URL: /login
Método: POST
Descripción: Autentica a un usuario y retorna un token JWT.
Body:
{
  "email": "tu_email@example.com",
  "password": "tu_password"
}
```

### Generar Token
```bash
URL: /generarToken
Método: POST
Descripción: Genera un nuevo token o devuelve uno existente si aún no ha expirado.
Headers: Authorization: Bearer <tu_token_jwt>
```

### Usar Token
```bash
URL: /usarToken
Método: POST
Descripción: Usa un token generado previamente.
Query Param: token=123456
Headers: Authorization: Bearer <tu_token_jwt>
```

### Historial de Tokens
```bash
URL: /tokens
Método: GET
Descripción: Muestra los tokens generados por el usuario autenticado.
Headers: Authorization: Bearer <tu_token_jwt>
```

## Base de Datos

Asegúrate de tener una base de datos MySQL configurada con las siguientes tablas:

```bash
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255)
);

CREATE TABLE tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(6),
  usuario_id INT,
  fecha_generacion datetime DEFAULT CURRENT_TIMESTAMP,
  fecha_expiracion datetime,
  usado BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);
```

## React Frontend

Para desplegar el frontend en react, debes:

* Configurar las variables de entorno en tu servidor.
* Asegurarte de que tu servidor esté accesible.
* Ejecutar el siguiente comando:

```bash
npm run build
```
## Dependencias

* bcryptjs: Para encriptar las contraseñas de los usuarios.
* cors: Para permitir solicitudes CORS.
* dotenv: Para manejar variables de entorno.
* express: Framework de Node.js para construir la API.
* jsonwebtoken: Para la generación y verificación de tokens JWT.
* mysql2: Para conectarse a la base de datos MySQL.
* node-cron: Para tareas programadas (si lo necesitas en el futuro).
* swagger-jsdoc: Para generar la documentación de la API.
* swagger-ui-express: Para servir la documentación de Swagger en la API.

## Flujo

En la carpeta assets se visualiza el flujo del proyecto.

* /login
* /register
* /generateToken
* /history