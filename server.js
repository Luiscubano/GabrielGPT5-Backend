// GabrielGPT5 - Backend
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch(err => console.log('❌ Error de conexión:', err));

const Usuario = mongoose.model('Usuario', new mongoose.Schema({
  nombre: String,
  correo: String,
  password: String,
  wallet: String,
  balance: Number
}));

const Apuesta = mongoose.model('Apuesta', new mongoose.Schema({
  usuario: String,
  numero: String,
  monto: Number,
  tipo: String,
  resultado: String,
  fecha: Date
}));

app.post('/api/registro', async (req, res) => {
  const { nombre, correo, password, wallet } = req.body;
  const yaExiste = await Usuario.findOne({ correo });
  if (yaExiste) return res.status(400).json({ error: 'Usuario ya existe' });

  const nuevo = new Usuario({ nombre, correo, password, wallet, balance: 0 });
  await nuevo.save();
  res.json({ mensaje: 'Registrado correctamente' });
});

app.post('/api/login', async (req, res) => {
  const { correo, password } = req.body;
  const user = await Usuario.findOne({ correo, password });
  if (!user) return res.status(401).json({ error: 'Datos incorrectos' });
  res.json(user);
});

app.post('/api/apostar', async (req, res) => {
  const { correo, numero, monto, tipo } = req.body;
  const user = await Usuario.findOne({ correo });
  if (!user || user.balance < monto) return res.status(400).json({ error: 'Saldo insuficiente' });

  const apuesta = new Apuesta({
    usuario: correo,
    numero,
    monto,
    tipo,
    resultado: 'pendiente',
    fecha: new Date()
  });

  user.balance -= monto;
  await user.save();
  await apuesta.save();
  res.json({ mensaje: 'Apuesta registrada' });
});

app.get('/api/apuestas/:correo', async (req, res) => {
  const apuestas = await Apuesta.find({ usuario: req.params.correo });
  res.json(apuestas);
});

app.listen(5000, () => console.log('GabrielGPT5 corriendo en puerto 5000'));
