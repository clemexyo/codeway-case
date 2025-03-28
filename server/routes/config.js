const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const verifyFirebaseToken = require('../middlewares/firebaseAuth');

const db = admin.firestore();

router.get('/', verifyFirebaseToken, async (req, res) => {
  try {

    const userEmail = req.user.email;
    console.log(`Retrieving parameters for user: ${userEmail}`);
    
    const configRef = db.collection('configurations').doc(userEmail);
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      console.log('Configuration document does not exist for this user');
      return res.json({ parameters: [] });
    }
    
    // reference to the parameters collection
    const parametersCollectionRef = configRef.collection('parameters');
    console.log(`Parameters collection path: ${parametersCollectionRef.path}`);
    
    // get all documents in the parameters collection
    const parametersSnapshot = await parametersCollectionRef.get();
    console.log(`Parameters collection size: ${parametersSnapshot.size}`);
    
    const parameters = [];
    
    // process each parameter document
    for (const paramDoc of parametersSnapshot.docs) {
      const paramKey = paramDoc.id;
      console.log(`Processing parameter: ${paramKey}`);
      
      // get the versions subcollection
      const versionsCollectionRef = paramDoc.ref.collection('versions');
      const versionsSnapshot = await versionsCollectionRef.get();
      
      if (versionsSnapshot.empty) {
        console.log(`No versions found for parameter: ${paramKey}`);
        continue;
      }
      
      // find the highest version number
      let highestVersionDoc = null;
      let highestVersionNum = 0;
      
      for (const versionDoc of versionsSnapshot.docs) {
        const versionData = versionDoc.data();
        const versionNum = versionData.version || parseInt(versionDoc.id) || 0;
        
        if (versionNum > highestVersionNum) {
          highestVersionNum = versionNum;
          highestVersionDoc = versionDoc;
        }
      }
      
      if (highestVersionDoc) {
        const versionData = highestVersionDoc.data();
        console.log(`Highest version for ${paramKey}: ${highestVersionNum}`);
        
        if (versionData.deleted === true) {
          console.log(`Skipping ${paramKey} because it's marked as deleted`);
          continue;
        }
        
        parameters.push({
          key: paramKey,
          value: versionData.value,
          description: versionData.description,
          createDate: versionData.createDate,
          version: versionData.version || highestVersionNum,
          timestamp: versionData.timestamp
        });
      }
    }
    
    parameters.sort((a, b) => a.key.localeCompare(b.key));
    
    res.json({ parameters });
  } catch (error) {
    console.error('Error retrieving configurations:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/', verifyFirebaseToken, async (req, res) => {
  const newParameter = req.body; // Expecting { key, value, description, createDate }
  
  try {
    await db.runTransaction(async (transaction) => {
      const configRef = db.collection('configurations').doc(req.user.email);
      const configDoc = await transaction.get(configRef);
      
      if (!configDoc.exists) {
        // create a new configuration document if it doesn't exist
        transaction.set(configRef, { version: 1 });
      } else {
        const currentData = configDoc.data();
        transaction.update(configRef, { 
          version: (currentData.version || 1) + 1 
        });
      }
      
      const parametersCollectionRef = configRef.collection('parameters');
      
      // reference to the document with the key name inside parameters collection
      const parameterDocRef = parametersCollectionRef.doc(newParameter.key);
      
      // create the versions subcollection under this parameter document
      const versionsCollectionRef = parameterDocRef.collection('versions');
      
      // find the current highest version in the versions subcollection
      const versionsQuery = await versionsCollectionRef.orderBy('version', 'desc').limit(1).get();
      let nextVersion = 1;
      
      if (!versionsQuery.empty) {
        const highestVersion = versionsQuery.docs[0].data().version;
        nextVersion = highestVersion + 1;
      }

      // set the parameter document with a "version" field so it exists in queries
      transaction.set(parameterDocRef, { version: nextVersion }, { merge: true });
      
      // create a new version document in the versions subcollection
      const versionDocRef = versionsCollectionRef.doc(nextVersion.toString());
      
      // set the data in the version document
      transaction.set(versionDocRef, {
        key: newParameter.key,
        value: newParameter.value,
        description: newParameter.description,
        createDate: newParameter.createDate,
        version: nextVersion,
        timestamp: new Date().toISOString(),
        deleted: false
      });
    });
    
    res.json({ message: 'Configuration updated successfully.' });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(409).json({ error: error.message });
  }
});

router.put('/:parameterKey', verifyFirebaseToken, async (req, res) => {
  const parameterKey = req.params.parameterKey;
  const updatedValues = req.body; // Expecting { value, description }
  
  try {
    await db.runTransaction(async (transaction) => {
      const configRef = db.collection('configurations').doc(req.user.email);
      const configDoc = await transaction.get(configRef);
      
      if (!configDoc.exists) {
        throw new Error("Configuration not found for user.");
      }
      
      const parameterRef = configRef.collection('parameters').doc(parameterKey);

      const versionsRef = parameterRef.collection('versions');
      const versionsQuery = await versionsRef.orderBy('version', 'desc').limit(1).get();
      
      if (versionsQuery.empty) {
        throw new Error(`Parameter '${parameterKey}' not found.`);
      }
      
      const latestVersionDoc = versionsQuery.docs[0];
      const latestVersionData = latestVersionDoc.data();
      const nextVersion = latestVersionData.version + 1;
      
      const newVersionRef = versionsRef.doc(nextVersion.toString());

      transaction.set(newVersionRef, {
        key: parameterKey,
        value: updatedValues.value !== undefined ? updatedValues.value : latestVersionData.value,
        description: updatedValues.description !== undefined ? updatedValues.description : latestVersionData.description,
        createDate: latestVersionData.createDate, // Keep original create date
        version: nextVersion,
        timestamp: new Date().toISOString(),
        deleted: false
      });
      
      transaction.update(configRef, { 
        version: admin.firestore.FieldValue.increment(1) 
      });
    });
    
    res.json({ message: 'Parameter updated successfully.' });
  } catch (error) {
    console.error('Error updating parameter:', error);
    res.status(409).json({ error: error.message });
  }
});

router.delete('/:key', verifyFirebaseToken, async (req, res) => {
  const parameterKey = req.params.key;
  
  try {
    const configRef = db.collection('configurations').doc(req.user.email);
    const configDoc = await configRef.get();
    
    if (!configDoc.exists) {
      return res.status(404).json({ error: 'User configuration does not exist.' });
    }
    const parameterDocRef = configRef.collection('parameters').doc(parameterKey);
    const parameterDoc = await parameterDocRef.get();
    
    if (!parameterDoc.exists) {
      return res.status(404).json({ error: 'Parameter not found.' });
    }
    const versionsSnapshot = await parameterDocRef.collection('versions').get();
    if (versionsSnapshot.empty) {
      return res.status(404).json({ error: 'No versions found for this parameter.' });
    }
    
    // find the highest version document
    let highestVersionDoc = null;
    let highestVersionNum = 0;
    
    versionsSnapshot.forEach(doc => {
      const versionData = doc.data();
      const versionNum = versionData.version || parseInt(doc.id) || 0;
      if (versionNum > highestVersionNum) {
        highestVersionNum = versionNum;
        highestVersionDoc = doc;
      }
    });
    
    if (!highestVersionDoc) {
      return res.status(404).json({ error: 'Could not determine the latest version for this parameter.' });
    }
    
    await highestVersionDoc.ref.update({ deleted: true });
    
    res.json({ message: `Parameter "${parameterKey}" marked as deleted.` });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
