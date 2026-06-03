require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Routes
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const transactionRoutes = require('./routes/transactions');
app.use('/api/transactions', transactionRoutes);

const roundupsRouter = require('./routes/roundups');
app.use('/api/roundups', roundupsRouter);

const growthRoutes = require('./routes/growth');
app.use('/api/growth', growthRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Only start listening if this file is run directly, not when imported by tests
if (require.main === module) {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;

// Basic version of server from phase 1

// const http = require('http');

// const server = http.createServer((req, res) => {
//   if (req.url === '/health' && req.method === 'GET') {
//     res.writeHead(200, { 'Content-Type': 'application/json' });
//     res.end(JSON.stringify({ status: 'ok' }));
//   }
// });

// server.listen(5001, () => {
//   console.log('Server running on port 5001');
// });