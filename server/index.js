// server/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

app.use(cors());
app.use(express.json());

// Mount auth routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// Mount configuration routes
const configRoutes = require('./routes/config');
app.use('/config', configRoutes);

// Test endpoint
app.get('/', (req, res) => {
  res.send('Configuration Management API is running.');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
