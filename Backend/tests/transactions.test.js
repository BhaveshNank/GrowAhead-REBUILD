const request = require('supertest');
const app = require('../server');
const pool = require('../database/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

let token;

beforeAll(async () => {
    // Clean up any existing test user
    await pool.query("DELETE FROM users WHERE email = 'txtest@example.com'");

    // Insert a verified test user directly into the test database
    const hashedPassword = await bcrypt.hash('password123', 10);
    const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, email_verified)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['Test User', 'txtest@example.com', hashedPassword, true]
    );

    const userId = result.rows[0].id;

    // Sign a JWT token for this user
    token = jwt.sign(
        { id: userId, email: 'txtest@example.com' },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
});

afterAll(async () => {
    // Clean up test data
    await pool.query("DELETE FROM users WHERE email = 'txtest@example.com'");
    await pool.end();
});

describe('GET /api/transactions', () => {

    test('no token returns 401', async () => {
        const res = await request(app).get('/api/transactions');
        expect(res.status).toBe(401);
    });

    test('valid token returns 200 with transactions array', async () => {
        const res = await request(app)
            .get('/api/transactions')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('transactions');
        expect(Array.isArray(res.body.transactions)).toBe(true);
    });

});

describe('POST /api/transactions', () => {

    test('no token returns 401', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .send({ merchant: 'Starbucks', amount: 4.50 });

        expect(res.status).toBe(401);
    });

    test('valid transaction returns 201', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({ merchant: 'Starbucks', amount: 4.50, category: 'Food', date: '2024-01-15' });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty('transaction');
        expect(res.body.transaction.merchant).toBe('Starbucks');
        expect(parseFloat(res.body.transaction.amount)).toBe(4.50);
    });

    test('missing merchant returns 400', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({ amount: 4.50 });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Merchant and a valid amount are required');
    });

    test('negative amount returns 400', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({ merchant: 'Starbucks', amount: -5.00 });

        expect(res.status).toBe(400);
    });

    test('missing amount returns 400', async () => {
        const res = await request(app)
            .post('/api/transactions')
            .set('Authorization', `Bearer ${token}`)
            .send({ merchant: 'Starbucks' });

        expect(res.status).toBe(400);
    });

});

describe('POST /api/transactions/upload', () => {

    test('no token returns 401', async () => {
        const res = await request(app).post('/api/transactions/upload');
        expect(res.status).toBe(401);
    });

    test('no file returns 400', async () => {
        const res = await request(app)
            .post('/api/transactions/upload')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('No file uploaded');
    });

    test('valid CSV returns 201 with imported transactions', async () => {
        const csvContent = `merchant,amount,category,date\nCosta Coffee,3.50,Food,2024-01-15\nTesco,12.99,Groceries,2024-01-16`;

        const res = await request(app)
            .post('/api/transactions/upload')
            .set('Authorization', `Bearer ${token}`)
            .attach('file', Buffer.from(csvContent), 'test.csv');

        expect(res.status).toBe(201);
        expect(res.body.transactions.length).toBe(2);
    });

});