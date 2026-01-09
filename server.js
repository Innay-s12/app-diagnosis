const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== DATABASE (RAILWAY) ====================
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB saat startup
db.getConnection((err, conn) => {
    if (err) {
        console.error('❌ DB ERROR:', err.message);
    } else {
        console.log('✅ MySQL connected (Railway)');
        conn.release();
    }
});

// ==================== HEALTHCHECK (WAJIB) ====================
app.get('/', (req, res) => {
    res.status(200).send('API OK');
});

// ==================== TEST DATABASE ====================
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ db: 'connected', result: rows[0].result });
    });
});

// ==================== USERS ====================
app.get('/users', (req, res) => {
    db.query('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/users', (req, res) => {
    const { nama_lengkap, usia, jenis_kelamin } = req.body;
    if (!nama_lengkap || !usia || !jenis_kelamin) {
        return res.status(400).json({ error: 'Data tidak lengkap' });
    }

    db.query(
        'INSERT INTO users (nama_lengkap, usia, jenis_kelamin) VALUES (?, ?, ?)',
        [nama_lengkap, usia, jenis_kelamin],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        }
    );
});

// ==================== SYMPTOMS ====================
app.get('/symptoms', (req, res) => {
    db.query('SELECT * FROM symptoms ORDER BY id', (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// ==================== DIAGNOSIS (FORWARD CHAINING) ====================
app.post('/diagnosis/process', (req, res) => {
    const { user_id } = req.body;
    if (!user_id) {
        return res.status(400).json({ error: 'user_id wajib' });
    }

    const sql = `
        SELECT s.kode_gejala, s.bobot
        FROM user_symptoms us
        JOIN symptoms s ON us.symptom_id = s.id
        WHERE us.user_id = ?
    `;

    db.query(sql, [user_id], (err, rows) => {
        if (err || rows.length === 0) {
            return res.status(500).json({ error: 'Gejala tidak ditemukan' });
        }

        const kode = rows.map(r => r.kode_gejala);
        let risiko = 'Rendah';

        if (kode.includes('G01') && kode.includes('G02')) risiko = 'Tinggi';
        else if (kode.includes('G01')) risiko = 'Sedang';

        let skor = rows.reduce((t, r) => t + Number(r.bobot), 0);

        db.query(
            'INSERT INTO diagnoses (user_id, tingkat_risiko, skor_akhir) VALUES (?, ?, ?)',
            [user_id, risiko, skor],
            () => {
                res.json({
                    success: true,
                    metode: 'Forward Chaining',
                    tingkat_risiko: risiko,
                    skor_akhir: skor
                });
            }
        );
    });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: err.message });
});

// ==================== START SERVER ====================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
