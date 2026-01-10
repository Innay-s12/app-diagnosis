// server.js
const express = require('express');
const app = express();
const cors = require('cors');
const db = require('./db'); // koneksi database yang sudah berhasil

app.use(cors());
app.use(express.json());

// Healthcheck endpoint Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});
// =====================
// Endpoint test DB
// =====================
app.get('/test-db', async (req, res) => {
    try {
        await db.execute('SELECT 1'); // query sederhana untuk cek koneksi
        res.json({ message: 'Database connection successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Database connection failed' });
    }
});

// =====================
// Endpoint Users
// =====================
app.get('/users', async (req, res) => {
    try {
        // tabelmu bernama 'name'
        const [users] = await db.execute('SELECT * FROM name'); 
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data pengguna' });
    }
});

// =====================
// Endpoint Diagnoses
// =====================
app.get('/diagnoses', async (req, res) => {
    try {
        // tabel diagnosis sesuai struktur yang ada
        const [diagnoses] = await db.execute('SELECT * FROM diagnosis'); 
        res.json(diagnoses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data diagnosa' });
    }
});

// =====================
// Endpoint Recommendations
// =====================
app.get('/recommendations', async (req, res) => {
    try {
        const [recs] = await db.execute('SELECT * FROM recommendations'); 
        res.json(recs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data rekomendasi' });
    }
});

// =====================
// Endpoint Symptoms
// =====================
app.get('/symptoms', async (req, res) => {
    try {
        const [symptoms] = await db.execute('SELECT * FROM symptoms'); 
        res.json(symptoms);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data gejala' });
    }
});

// =====================
// Optional Stats Endpoint
// =====================
app.get('/stats', async (req, res) => {
    try {
        const [[totalUsers]] = await db.execute('SELECT COUNT(*) AS total_users FROM name');
        const [[totalDiagnoses]] = await db.execute('SELECT COUNT(*) AS total_diagnoses FROM diagnosis');
        const [[totalRecommendations]] = await db.execute('SELECT COUNT(*) AS total_recommendations FROM recommendations');
        const [[totalSymptoms]] = await db.execute('SELECT COUNT(*) AS total_symptoms FROM symptoms');

        res.json({
            total_users: totalUsers.total_users,
            total_diagnoses: totalDiagnoses.total_diagnoses,
            total_recommendations: totalRecommendations.total_recommendations,
            total_symptoms: totalSymptoms.total_symptoms
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Gagal mengambil data statistik' });
    }
});

// =====================
// Jalankan server
// =====================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

