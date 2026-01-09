const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== HEALTHCHECK (WAJIB RAILWAY) ====================
app.get('/health', async (req, res) => {
    try {
        await db.query('SELECT 1');
        res.status(200).send('OK');
    } catch (err) {
        console.error(err);
        res.status(500).send('DB ERROR');
    }
});

// ==================== TEST DATABASE ====================
app.get('/test-db', async (req, res) => {
    try {
        const rows = await db.query('SELECT 1 + 1 AS result');
        res.json({ db: 'connected', result: rows[0].result });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== USERS ====================
app.get('/users', async (req, res) => {
    try {
        const rows = await db.query(
            'SELECT * FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/users', async (req, res) => {
    const { nama_lengkap, usia, jenis_kelamin } = req.body;

    if (!nama_lengkap || !usia || !jenis_kelamin) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    try {
        const result = await db.query(
            'INSERT INTO users (nama_lengkap, usia, jenis_kelamin) VALUES (?, ?, ?)',
            [nama_lengkap, usia, jenis_kelamin]
        );

        res.json({ success: true, id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== SYMPTOMS ====================
app.get('/symptoms', async (req, res) => {
    try {
        const rows = await db.query(
            'SELECT * FROM symptoms ORDER BY id'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== DIAGNOSIS (FORWARD CHAINING) ====================
app.post('/diagnosis/process', async (req, res) => {
    const { user_id } = req.body;

    if (!user_id) {
        return res.status(400).json({ error: 'user_id wajib' });
    }

    try {
        const rows = await db.query(`
            SELECT s.kode_gejala, s.bobot
            FROM user_symptoms us
            JOIN symptoms s ON us.symptom_id = s.id
            WHERE us.user_id = ?
        `, [user_id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Gejala tidak ditemukan' });
        }

        const kode = rows.map(r => r.kode_gejala);
        let risiko = 'Rendah';

        if (kode.includes('G01') && kode.includes('G02')) risiko = 'Tinggi';
        else if (kode.includes('G01')) risiko = 'Sedang';

        const skor = rows.reduce((t, r) => t + Number(r.bobot), 0);

        await db.query(
            'INSERT INTO diagnoses (user_id, tingkat_risiko, skor_akhir) VALUES (?, ?, ?)',
            [user_id, risiko, skor]
        );

        res.json({
            success: true,
            metode: 'Forward Chaining',
            tingkat_risiko: risiko,
            skor_akhir: skor
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
