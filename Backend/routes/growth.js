const express = require('express');
const router = express.Router();
const pool = require('../database/db');
const authenticateToken = require('../middleware/auth');
const { calculateGrowth } = require('../utils/growth');

// GET /api/growth
// Returns current portfolio value and projections for all 3 risk profiles
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all roundups for this user
    const result = await pool.query(
      'SELECT roundup_amount, created_at FROM roundups WHERE user_id = $1',
      [userId]
    );

    const roundups = result.rows;

    if (roundups.length === 0) {
      return res.status(200).json({
        message: 'No roundups found. Upload transactions and calculate roundups first.',
        data: null,
      });
    }

    const growthData = calculateGrowth(roundups);

    res.status(200).json({
      roundup_count: roundups.length,
      data: growthData,
    });

  } catch (err) {
    console.error('Growth calculation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;