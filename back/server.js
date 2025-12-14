const express = require('express');
const cors = require('cors');
require('dotenv').config();

const imageRoutes = require('./routes/imageRoutes');

const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running 🚀');
});

// Image route
app.use('/api', imageRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
