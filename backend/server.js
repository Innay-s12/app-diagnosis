const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FRONTEND (INI FIX UTAMA) ====================
const frontendPath = path.join(__dirname, '../frontend');
console.log('Frontend path:', frontendPath);

// JADIKAN FRONTEND SEBAGAI ROOT "/"
app.use('/', express.static(frontendPath));

// ==================== HEALTHCHECK ====================
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

// ==================== TEST DB ====================
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ result: rows[0].result });
    });
});

// ==================== FALLBACK (ANTI NOT FOUND) ====================
app.use((req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
