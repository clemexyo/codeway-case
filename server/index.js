require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json()); // Built-in middleware for JSON

// Simple test endpoint
app.get('/', (req, res) => {
  res.send('Configuration Management API is running.');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
