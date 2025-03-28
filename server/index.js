require('dotenv').config();
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const requestLogger = require('./middlewares/logger.middleware');

const app = express();
const port = process.env.PORT || 3000;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

// add middleware
app.use(cors({ origin: 'https://codeway-case-frontend.onrender.com' }));
app.use(requestLogger)
app.use(express.json());

app.use(express.static(path.join(__dirname, '../client/dist')));

// register routes
const authRoutes = require('./routes/auth.route');
app.use('/api/auth', authRoutes);

const configRoutes = require('./routes/config.route');
app.use('/api/config', configRoutes);

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// start the app
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
