const express = require('express');
const router = express.Router();
const multer = require('multer');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const pool = require('../database/db');
const authenticateToken = require('../middleware/auth');

// Multer config — save CSV to uploads/ folder
const upload = multer({ dest: path.join(__dirname, '../uploads/') });

// POST /api/transactions/upload — CSV upload
router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const results = [];
  const errors = [];

  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (row) => {
      const amount = parseFloat(row.amount);

      if (!row.merchant || isNaN(amount) || amount <= 0) {
        errors.push({ row, reason: 'Missing merchant or invalid amount' });
        return;
      }

      results.push({
        merchant: row.merchant,
        amount,
        category: row.category || 'General',
        date: row.date || new Date().toISOString().split('T')[0],
      });
    })
    .on('end', async () => {
      // Delete the temp file
      fs.unlinkSync(req.file.path);

      if (results.length === 0) {
        return res.status(400).json({ error: 'No valid rows found', errors });
      }

      try {
        const inserted = [];

        for (const tx of results) {
          const result = await pool.query(
            `INSERT INTO transactions (user_id, merchant, amount, category, date)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [req.user.id, tx.merchant, tx.amount, tx.category, tx.date]
          );
          inserted.push(result.rows[0]);
        }

        res.status(201).json({
          message: `${inserted.length} transaction(s) imported successfully`,
          skipped: errors.length,
          transactions: inserted,
        });

      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error during import' });
      }
    });
});

// POST /api/transactions — add a single transaction manually
router.post('/', authenticateToken, async (req, res) => {
  const { merchant, amount, category, date } = req.body;

  if (!merchant || !amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return res.status(400).json({ error: 'Merchant and a valid amount are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO transactions (user_id, merchant, amount, category, date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [
        req.user.id,
        merchant,
        parseFloat(amount),
        category || 'General',
        date || new Date().toISOString().split('T')[0],
      ]
    );

    res.status(201).json({ transaction: result.rows[0] });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/transactions — fetch all transactions for the logged-in user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC`,
      [req.user.id]
    );

    res.json({ transactions: result.rows });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;