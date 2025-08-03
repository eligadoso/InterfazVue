const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de Vue (cuando esté construido)
app.use(express.static(path.join(__dirname, 'dist')));

// Rutas de la API
app.get('/api/test', (req, res) => {
  res.json({ message: '¡Servidor Express funcionando correctamente!' });
});

app.get('/api/users', (req, res) => {
  res.json([
    { id: 1, name: 'Juan', email: 'juan@example.com' },
    { id: 2, name: 'María', email: 'maria@example.com' },
    { id: 3, name: 'Carlos', email: 'carlos@example.com' }
  ]);
});

app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  const newUser = {
    id: Date.now(),
    name,
    email
  };
  res.status(201).json(newUser);
});

// Manejar rutas de Vue (SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});