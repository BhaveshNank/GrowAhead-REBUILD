const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const authenticateToken = require('../middleware/auth');
const { calculateRoundup } = require('../utils/roundup');
const Decimal = require('decimal.js');

// Calculate and store roundups for all transactions
router.post('/calculate', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all transactions for this user
        const transactions = await pool.query(
            'SELECT * FROM transactions WHERE user_id = $1',
            [userId]
        );

        if (transactions.rows.length === 0) {
            return res.status(400).json({ message: 'No transactions found' });
        }

        let inserted = 0;

        for (const transaction of transactions.rows) {
            const roundupAmount = calculateRoundup(transaction.amount);

            // Skip if roundup is 0 (whole number transaction)
            if (roundupAmount.equals(0)) continue;

            // Avoid duplicates — skip if roundup already exists for this transaction
            const existing = await pool.query(
                'SELECT id FROM roundups WHERE transaction_id = $1',
                [transaction.id]
            );

            if (existing.rows.length > 0) continue;

            await pool.query(
                'INSERT INTO roundups (user_id, transaction_id, roundup_amount) VALUES ($1, $2, $3)',
                [userId, transaction.id, roundupAmount.toFixed(2)]
            );

            inserted++;
        }

        res.json({ message: `${inserted} roundups calculated and stored` });

    } catch (error) {
        console.error('Roundup calculate error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all roundups for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;

        const result = await pool.query(
            `SELECT r.id, r.transaction_id, r.roundup_amount, r.current_value, r.created_at,
                    t.merchant, t.amount as transaction_amount, t.category
             FROM roundups r
             JOIN transactions t ON r.transaction_id = t.id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [userId]
        );

        res.json({ roundups: result.rows });

    } catch (error) {
        console.error('Get roundups error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;