const express = require('express');
const path = require('path');
const cors = require('cors');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC FRONTEND ================= */
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

/* ================= HEALTH ================= */
app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

/* ================= DB TEST ================= */
app.get('/test-db', (req, res) => {
    db.query('SELECT 1 + 1 AS result', (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, result: rows[0].result });
    });
});

app.post('/admin/login', (req, res) => {
    const { name, sandi } = req.body;

    // Query ke table admin di database
    const sql = 'SELECT * FROM admin WHERE name = ? AND password = ?';
    db.query(sql, [name, sandi], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Terjadi kesalahan server' });
        }

        if (rows.length > 0) {
            // Login berhasil
            const adminData = rows[0];
            const token = 'admin-token-123'; // Bisa diganti JWT jika mau

            return res.json({
                success: true,
                admin: { id: adminData.id, name: adminData.name },
                token
            });
        } else {
            // Login gagal
            return res.status(401).json({ error: 'Nama atau password salah' });
        }
    });
});


/* ================= USERS ================= */
app.post('/users', (req, res) => {
    const { nama_lengkap, usia, jenis_kelamin } = req.body;

    db.query(
        'INSERT INTO users (nama_lengkap, usia, jenis_kelamin) VALUES (?, ?, ?)',
        [nama_lengkap, usia, jenis_kelamin],
        (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ id: result.insertId });
        }
    );
});

/* ================= SYMPTOMS ================= */
app.get('/symptoms', (req, res) => {
    db.query('SELECT * FROM symptoms ORDER BY id', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

/* ================= USER SYMPTOMS ================= */
app.post('/user-symptoms', (req, res) => {
    const { user_id, symptom_id } = req.body;

    db.query(
        'INSERT INTO user_symptoms (user_id, symptom_id) VALUES (?, ?)',
        [user_id, symptom_id],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true });
        }
    );
});

/* ================= DIAGNOSIS ================= */
app.post('/diagnoses', (req, res) => {
    const { user_id, tingkat_risiko, skor_akhir, rekomendasi_khusus } = req.body;

    db.query(
        `INSERT INTO diagnoses 
        (user_id, tingkat_risiko, skor_akhir, rekomendasi_khusus)
        VALUES (?, ?, ?, ?)`,
        [user_id, tingkat_risiko, skor_akhir, rekomendasi_khusus],
        (err) => {
            if (err) return res.status(500).json(err);
            res.json({ success: true });
        }
    );
});

/* ================= RECOMMENDATIONS ================= */
app.get('/recommendations', (req, res) => {
    db.query('SELECT * FROM recommendations ORDER BY kategori', (err, rows) => {
        if (err) return res.status(500).json(err);
        res.json(rows);
    });
});

/* ================= DEFAULT PAGE ================= */
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

/* ================= START SERVER ================= */
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});



