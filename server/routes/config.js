// server/routes/config.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Import Firebase token verification middleware
const verifyFirebaseToken = require('../middlewares/firebaseAuth');

// Access Firestore database
const db = admin.firestore();

// GET /config endpoint for authenticated users (using Firebase token middleware)
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const configDoc = await db.collection('configurations').doc('appConfig').get();
    if (!configDoc.exists) {
      return res.status(404).json({ error: 'Configuration not found.' });
    }
    res.json(configDoc.data());
  } catch (error) {
    res.status(500).json({ error: 'Error fetching configuration.' });
  }
});

// POST /config endpoint for authenticated panel users (using Firebase token middleware)
router.post('/', verifyFirebaseToken, async (req, res) => {
  const newConfig = req.body;
  try {
    await db.runTransaction(async (transaction) => {
      console.log(req.user)
      const configRef = db.collection('configurations').doc(req.user.email);
      
      const doc = await transaction.get(configRef);
      if (!doc.exists) {
        // Create new configuration with version 1 if it does not exist.
        transaction.set(configRef, { ...newConfig, version: 1 });
      } else {
        const currentData = doc.data();
        // Check version to prevent conflicts.
        if (newConfig.version && newConfig.version !== currentData.version) {
          throw new Error('Version conflict: Please reload and try again.');
        }
        // Increment version and update.
        newConfig.version = (currentData.version || 1) + 1;
        transaction.update(configRef, newConfig);
      }
    });
    res.json({ message: 'Configuration updated successfully.' });
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
});

module.exports = router;
