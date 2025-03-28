const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * get all parameters for a specific user
 * @param {string} userEmail 
 * @returns {Array}
 */
exports.getAllParameters = async (userEmail) => {
  const configRef = db.collection('configurations').doc(userEmail);
  const configDoc = await configRef.get();
  
  if (!configDoc.exists) {
    console.log('configuration document does not exist for this user');
    return [];
  }
  
  // reference to the parameters collection
  const parametersCollectionRef = configRef.collection('parameters');
  
  // get all documents in the parameters collection
  const parametersSnapshot = await parametersCollectionRef.get();
  
  const parameters = [];
  
  // process each parameter document
  for (const paramDoc of parametersSnapshot.docs) {
    const paramKey = paramDoc.id;
    console.log(`processing parameter: ${paramKey}`);
    
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
      
      if (versionData.deleted === true) {
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
  
  return parameters;
};

/**
 * create a new parameter
 * @param {string} userEmail 
 * @param {Object} newParameter 
 */
exports.createParameter = async (userEmail, newParameter) => {
  await db.runTransaction(async (transaction) => {
    const configRef = db.collection('configurations').doc(userEmail);
    const configDoc = await transaction.get(configRef);
    
    if (!configDoc.exists) {
      // Create a new configuration document if it doesn't exist
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
};

/**
 * Update an existing parameter
 * @param {string} userEmail 
 * @param {string} parameterKey 
 * @param {Object} updatedValues
 */
exports.updateParameter = async (userEmail, parameterKey, updatedValues) => {
  await db.runTransaction(async (transaction) => {
    const configRef = db.collection('configurations').doc(userEmail);
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
      createDate: latestVersionData.createDate, // keep the original create date
      version: nextVersion,
      timestamp: new Date().toISOString(),
      deleted: false
    });
    
    transaction.update(configRef, { 
      version: admin.firestore.FieldValue.increment(1) 
    });
  });
};

/**
 * Delete (mark as deleted) a parameter
 * @param {string} userEmail
 * @param {string} parameterKey 
 */
exports.deleteParameter = async (userEmail, parameterKey) => {
  const configRef = db.collection('configurations').doc(userEmail);
  const configDoc = await configRef.get();
  
  if (!configDoc.exists) {
    throw new Error('User configuration does not exist.');
  }
  
  const parameterDocRef = configRef.collection('parameters').doc(parameterKey);
  const parameterDoc = await parameterDocRef.get();
  
  if (!parameterDoc.exists) {
    throw new Error('Parameter not found.');
  }
  
  const versionsSnapshot = await parameterDocRef.collection('versions').get();
  if (versionsSnapshot.empty) {
    throw new Error('No versions found for this parameter.');
  }
  
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
    throw new Error('Could not determine the latest version for this parameter.');
  }
  
  await highestVersionDoc.ref.update({ deleted: true });
};