
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

function getToken() {
  return localStorage.getItem('token');
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

// Auth
export async function registerUser(name: string, email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

// Transactions
export async function getTransactions() {
  const res = await fetch(`${BASE_URL}/transactions`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function uploadCSV(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${BASE_URL}/transactions/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  });
  return res.json();
}

// Roundups
export async function getRoundups() {
  const res = await fetch(`${BASE_URL}/roundups`, {
    headers: authHeaders(),
  });
  return res.json();
}

export async function calculateRoundups() {
  const res = await fetch(`${BASE_URL}/roundups/calculate`, {
    method: 'POST',
    headers: authHeaders(),
  });
  return res.json();
}

// Growth
export async function getGrowth() {
  const res = await fetch(`${BASE_URL}/growth`, {
    headers: authHeaders(),
  });
  return res.json();
}