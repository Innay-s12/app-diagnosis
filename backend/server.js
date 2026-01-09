const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== STATIC FRONTEND ====================
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// ==================== HEALTHCHECK ====================
app.get('/health', (req, res) => {
    res.send('OK');
});

// ==================== ROOT ====================
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// ==================== CATCH ALL (PENTING!) ====================
app.get('*', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
