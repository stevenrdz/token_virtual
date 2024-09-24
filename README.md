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
