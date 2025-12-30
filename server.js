const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// Setup Database SQLite
const db = new sqlite3.Database('./barber.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Terhubung ke database SQLite.');
});

// Buat Tabel jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT,
    d INTEGER, r INTEGER, a INTEGER,
    p1 INTEGER, p2 INTEGER, p3 INTEGER
)`);

// --- API ENDPOINTS ---

// 1. Ambil semua data (bisa difilter per bulan di frontend)
app.get('/api/records', (req, res) => {
    db.all("SELECT * FROM records ORDER BY date DESC", [], (err, rows) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ data: rows });
    });
});

// 2. Tambah Data Harian
app.post('/api/records', (req, res) => {
    const { date, d, r, a, p1, p2, p3 } = req.body;
    const sql = `INSERT INTO records (date, d, r, a, p1, p2, p3) VALUES (?,?,?,?,?,?,?)`;
    db.run(sql, [date, d, r, a, p1, p2, p3], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ id: this.lastID });
    });
});

// 3. Hapus Semua Data (Reset Database)
app.delete('/api/clear', (req, res) => {
    db.run("DELETE FROM records", [], (err) => {
        if (err) return res.status(400).json({ error: err.message });
        // Reset sequence ID
        db.run("DELETE FROM sqlite_sequence WHERE name='records'"); 
        res.json({ message: "Database berhasil dibersihkan" });
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
