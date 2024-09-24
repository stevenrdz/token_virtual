const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
  
    if (!authHeader) {
      return res.status(401).send('Token requerido');
    }
  
    // Elimina el prefijo "Bearer " y extrae solo el token
    const token = authHeader.split(' ')[1];
  
    if (!token) {
      return res.status(402).send('Token malformado');
    }
  
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error(err);
        return res.status(403).send('Error al autenticar el token');
      }
  
      req.userId = decoded.id;
      next(); 
    });
  }
  

module.exports = authMiddleware;
