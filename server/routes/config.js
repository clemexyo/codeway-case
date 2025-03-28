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
    // Reference to the user's configuration document
    const configRef = db.collection('configurations').doc(req.user.email);
    const configDoc = await configRef.get();
    if (!configDoc.exists) {
      return res.status(404).json({ error: 'Configuration not found.' });
    }
    // Query the 'parameters' subcollection under this user document
    const parametersSnapshot = await configRef.collection('parameters').get();
    const parameters = {};
    parametersSnapshot.forEach(doc => {
      parameters[doc.id] = doc.data();
    });
    res.json(parameters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching configuration.' });
  }
});

// POST /config endpoint for authenticated panel users (using Firebase token middleware)
router.post('/', verifyFirebaseToken, async (req, res) => {
  console.log(req)
  const newParameter = req.body; // Expecting { key, value, description, createDate }
  try {
    await db.runTransaction(async (transaction) => {
      // Reference to the user's configuration document
      const configRef = db.collection('configurations').doc(req.user.email);
      const configDoc = await transaction.get(configRef);
      
      if (!configDoc.exists) {
        // Create a new configuration document with initial version 1
        transaction.set(configRef, { version: 1 });
      } else {
        // Increment the version in the configuration document
        const currentData = configDoc.data();
        transaction.update(configRef, { version: (currentData.version || 1) + 1 });
      }
      
      // Reference to the parameter document inside the subcollection "parameters"
      const parameterRef = configRef.collection('parameters').doc(newParameter.key);
      // Create or update the parameter document
      transaction.set(parameterRef, {
        value: newParameter.value,
        description: newParameter.description,
        createDate: newParameter.createDate,
        version: 1
      }, { merge: true });
    });
    res.json({ message: 'Configuration updated successfully.' });
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
});

router.put('/:parameterKey', verifyFirebaseToken, async (req, res) => {
  const parameterKey = req.params.parameterKey; // the parameter to update
  const newValues = req.body; // expect { value, description } in the payload
  try {
    await admin.firestore().runTransaction(async (transaction) => {
      // Reference to the user's configuration document
      const configRef = admin.firestore().collection('configurations').doc(req.user.email);
      const configDoc = await transaction.get(configRef);
      if (!configDoc.exists) {
        throw new Error("Configuration not found for user.");
      }
      
      // Reference to the subcollection "parameters"
      const parametersRef = configRef.collection('parameters');
      
      // Query to get the latest version for this parameter key
      const querySnapshot = await parametersRef
        .where('key', '==', parameterKey)
        .orderBy('version', 'desc')
        .limit(1)
        .get();
      
      // Determine new version number
      let newVersion = 1;
      if (!querySnapshot.empty) {
        const latestDoc = querySnapshot.docs[0];
        const latestVersion = latestDoc.data().version || 1;
        newVersion = latestVersion + 1;
      }
      
      // Create a new document in the subcollection for this parameter
      const newParamRef = parametersRef.doc(); // let Firestore generate an ID
      transaction.set(newParamRef, {
        key: parameterKey,
        value: newValues.value,
        description: newValues.description,
        createDate: admin.firestore.FieldValue.serverTimestamp(), // use server timestamp for consistency
        version: newVersion, // internal version field
      });
    });
    res.json({ message: 'Parameter updated successfully.' });
  } catch (error) {
    res.status(409).json({ error: error.message });
  }
});

module.exports = router;
