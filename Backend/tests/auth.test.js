const request = require('supertest');
const app = require('../server');
const pool = require('../database/db');

afterAll(async () => {
    await pool.end();
});

describe('POST /api/auth/register', () => {

    test('missing name returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ email: 'test@example.com', password: 'password123' });

        expect(res.status).toBe(400);
    });

    test('missing email returns 500', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', password: 'password123' });

        expect(res.status).toBe(500);
    });

    test('missing password returns 500', async () => {
        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'nopassword@example.com' });

        expect(res.status).toBe(500);
    });

    test('duplicate email returns 400', async () => {
        await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'duplicate@example.com', password: 'password123' });

        const res = await request(app)
            .post('/api/auth/register')
            .send({ name: 'Test User', email: 'duplicate@example.com', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email already registered');
    });

});

describe('POST /api/auth/login', () => {

    test('missing email returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
    });

    test('missing password returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'test@example.com' });

        expect(res.status).toBe(400);
    });

    test('non-existent email returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'nobody@example.com', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid credentials');
    });

    test('wrong password returns 400', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'duplicate@example.com', password: 'wrongpassword' });

        expect(res.status).toBe(400);
    });

});