const express = require('express');
const path = require('path');
const cors = require('cors');

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

// ==================== DEFAULT PAGE ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
