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

// ==================== STATIC FRONTEND ====================
const frontendPath = path.join(__dirname, 'frontend');
app.use(express.static(frontendPath));

// ==================== HEALTHCHECK ====================
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, rows) => {
        if (err) {
            console.error('DB ERROR:', err);
            return res.status(500).json({
                message: 'DB ERROR',
                error: err.message,
                code: err.code
            });
        }
        res.json({ success: true, result: rows[0].result });
    });
});


// ==================== DEFAULT PAGE ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
