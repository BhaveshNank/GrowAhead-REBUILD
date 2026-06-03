const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../database/db');

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: 2525,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// REGISTER
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate email verification token
    const verificationToken = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Insert user into database
    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, verification_token) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, email, hashedPassword, verificationToken]
    );

    // Send verification email
    await transporter.sendMail({
      from: 'noreply@growahead.com',
      to: email,
      subject: 'Verify your GrowAhead account',
      html: `<p>Click <a href="http://localhost:5001/api/auth/verify?token=${verificationToken}">here</a> to verify your account.</p>`,
    });

    res.status(201).json({ message: 'Registered successfully. Please verify your email.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// VERIFY EMAIL
router.get('/verify', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await pool.query(
      'UPDATE users SET email_verified = true, verification_token = NULL WHERE email = $1',
      [decoded.email]
    );

    res.json({ message: 'Email verified successfully.' });

  } catch (err) {
    res.status(400).json({ error: 'Invalid or expired token' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    if (!user.email_verified) {
      return res.status(400).json({ error: 'Please verify your email first' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, name: user.name });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;