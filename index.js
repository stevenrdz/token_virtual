const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const authMiddleware = require('./authMiddleware'); 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
      openapi: '3.0.0',
      info: {
        title: 'API de Token Virtual',
        version: '1.0.0',
        description: 'API para la generación y uso de tokens virtuales',
        contact: {
          name: 'Tu Nombre',
        },
        servers: [
          {
            url: `http://localhost:${process.env.PORT}`,
          },
        ],
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', 
          },
        },
      },
      security: [
        {
          bearerAuth: [], 
        },
      ],
    },
    apis: ['./index.js'], 
  };

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos MySQL');
});

function generarToken() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Registro de usuarios
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario registrado correctamente
 *       500:
 *         description: Error en el registro (Conexión o duplicado)
 */
app.post('/register', (req, res) => {
  const { nombre, email, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 8);
  
  const sql = 'INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [nombre, email, hashedPassword], (err, result) => {
    if (err) {
      console.error('Error al registrar el usuario:', err);
      return res.status(500).send('Error en el registro');
    }
    res.send('Usuario registrado correctamente');
  });
});

// Login de usuarios
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Autenticar un usuario
 *     tags: [Usuarios]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Autenticación exitosa, retorna token JWT
 *       401:
 *         description: Contraseña incorrecta
 *       400:
 *         description: Usuario no encontrado
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  connection.query(sql, [email], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send('Usuario no encontrado');
    }

    const user = results[0];
    const passwordIsValid = bcrypt.compareSync(password, user.password);

    if (!passwordIsValid) {
      return res.status(401).send('Contraseña incorrecta');
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: 86400, // 24 horas
    });

    res.json({ auth: true, token });
  });
});

// Generar un token nuevo o devolver uno no expirado
/**
 * @swagger
 * /generarToken:
 *   post:
 *     summary: Generar un nuevo token o retornar el existente si aún no ha expirado
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token generado o retornado con éxito
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   example: "123456"
 *                 tiempo_restante:
 *                   type: number
 *                   example: 30
 *       500:
 *         description: Error al generar o consultar el token
 *       401:
 *         description: Token requerido
 *       402:
 *         description: Token malformado
 *       403:
 *         description: Error al autenticar el token
 */
app.post('/generarToken', authMiddleware, (req, res) => {
  const token = generarToken();
  const usuario_id = req.userId;
  const fechaExpiracion = new Date(Date.now() + process.env.TOKEN_EXPIRATION * 1000);

  const sql = 'SELECT * FROM tokens WHERE usuario_id = ? AND usado = FALSE AND fecha_expiracion > NOW()';
  connection.query(sql, [usuario_id], (err, results) => {
    if (err) {
      return res.status(500).send('Error al consultar tokens');
    }

    if (results.length > 0) {
        
        const remainingTime = Math.floor(Math.max((new Date(results[0].fecha_expiracion) - new Date()) / 1000, 0));
        return res.json({ token: results[0].token, tiempo_restante: remainingTime });
    }

    const insertSql = 'INSERT INTO tokens (token, usuario_id, fecha_expiracion) VALUES (?, ?, ?)';
    connection.query(insertSql, [token, usuario_id, fechaExpiracion], (err, result) => {
      if (err) {
        return res.status(500).send('Error al generar el token');
      }
      res.json({ token, tiempo_restante: 60 });
    });
  });
});

// Usar un token existente
/**
 * @swagger
 * /usarToken:
 *   post:
 *     summary: Usar un token generado previamente
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Token de 6 dígitos
 *     responses:
 *       200:
 *         description: Token usado correctamente
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error al actualizar el token
 *       401:
 *         description: Token requerido
 *       402:
 *         description: Token malformado
 *       403:
 *         description: Error al autenticar el token
 */
app.post('/usarToken', authMiddleware, (req, res) => {
  const { token } = req.query;
  const usuario_id = req.userId;

  const sql = 'SELECT * FROM tokens WHERE token = ? AND usuario_id = ? AND usado = FALSE AND fecha_expiracion > NOW()';
  connection.query(sql, [token, usuario_id], (err, results) => {
    if (err || results.length === 0) {
      return res.status(400).send('Token inválido o expirado');
    }

    const updateSql = 'UPDATE tokens SET usado = TRUE WHERE id = ?';
    connection.query(updateSql, [results[0].id], (err, result) => {
      if (err) {
        return res.status(500).send('Error al actualizar el token');
      }
      res.send('Token usado correctamente');
    });
  });
});

/**
 * @swagger
 * /tokens:
 *   get:
 *     summary: Obtener todos los tokens generados por el usuario autenticado
 *     tags: [Tokens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tokens generados por el usuario
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID del token
 *                   token:
 *                     type: string
 *                     description: Token de 6 dígitos
 *                   fecha_expiracion:
 *                     type: string
 *                     format: date-time
 *                     description: Fecha de expiración del token
 *                   usado:
 *                     type: boolean
 *                     description: Indica si el token ha sido utilizado
 *       401:
 *         description: Token requerido
 *       403:
 *         description: Error al autenticar el token
 *       500:
 *         description: Error al consultar los tokens
 */
app.get('/tokens', authMiddleware, (req, res) => {
    const usuario_id = req.userId;
  
    const sql = 'SELECT * FROM tokens WHERE usuario_id = ?';
    connection.query(sql, [usuario_id], (err, results) => {
      if (err) {
        return res.status(500).send('Error al consultar los tokens');
      }
      res.json(results);
    });
  });
  
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
