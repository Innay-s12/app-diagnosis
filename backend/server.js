// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



// Test koneksi
db.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected!');
    connection.release();
  }
});

// =====================
// ROUTES
// =====================

// Health check (untuk Railway)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Get all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get all symptoms
app.get('/symptoms', (req, res) => {
  db.query('SELECT * FROM symptoms', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Add new user
app.post('/users', (req, res) => {
  const { nama_lengkap, usia, jenis_kelamin } = req.body;
  db.query(
    'INSERT INTO users (nama_lengkap, usia, jenis_kelamin) VALUES (?, ?, ?)',
    [nama_lengkap, usia, jenis_kelamin],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: 'User added', id: result.insertId });
    }
  );
});

// Get all diagnoses
app.get('/diagnoses', (req, res) => {
  db.query('SELECT * FROM diagnoses', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

// Get recommendations by risk
app.get('/recommendations/:risk', (req, res) => {
  const risk = req.params.risk;
  db.query(
    'SELECT * FROM recommendations WHERE untuk_tingkat_risiko = ?',
    [risk],
    (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    }
  );
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
