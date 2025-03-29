const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * get all parameters for a specific user
 * @param {string} userEmail 
 * @returns {Array}
 */
exports.getAllParameters = async (userUID) => {
  const userRef = db.collection('users').doc(userUID);
  const userDoc = await userRef.get();
  
  if (!userDoc.exists) {
    console.log('configuration document does not exist for this user');
    return [];
  }
  
  // reference to the parameters collection
  const parametersCollectionRef = userRef.collection('parameters');
  
  // get all documents in the parameters collection
  const parametersSnapshot = await parametersCollectionRef.get();
  
  const parameters = [];
  
  // process each parameter document
  for (const paramDoc of parametersSnapshot.docs) {
    if(paramDoc.data().deleted === true){
      continue;
    }
    const paramKey = paramDoc.id;
    console.log(`processing parameter: ${paramKey}`);
    
    const versionsCollectionRef = paramDoc.ref.collection('versions');
    const versionsSnapshot = await versionsCollectionRef
      .orderBy('version', 'desc')
      .limit(2)
      .get();
    if (versionsSnapshot.empty) {
      console.log(`No versions found for parameter: ${paramKey}`);
      continue;
    }
    
    let highestVersionDoc = null;
    if(versionsSnapshot.docs.length > 1 && userDoc.data().country != "default"){
      highestVersionDoc = versionsSnapshot.docs[1];
    }
    else{
      highestVersionDoc = versionsSnapshot.docs[0];
    }
    
    if (highestVersionDoc) {
      const versionData = highestVersionDoc.data();
    
      parameters.push({
        key: paramKey,
        value: versionData.value,
        description: versionData.description,
        createDate: versionData.createDate,
        version: versionData.version,
        timestamp: versionData.timestamp
      });
    }
  }
  
  return parameters;
};

/**
 * create a new parameter
 * @param {string} userUID 
 * @param {Object} newParameter 
 */
exports.createParameter = async (userUID, newParameter) => {
  await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userUID);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      // Create a new configuration document if it doesn't exist
      transaction.set(userRef, { version: 1 });
    } else {
      const currentData = userDoc.data();
      transaction.update(userRef, { 
        version: (currentData.version || 1) + 1 
      });
    }
    
    const parametersCollectionRef = userRef.collection('parameters');
    
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

    // set the parameter doc
    transaction.set(parameterDocRef, { version: nextVersion }, { merge: true });
    transaction.set(parameterDocRef, { deleted: false }, { merge: true });
    
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
    });
  });
};

/**
 * Update an existing parameter
 * @param {string} userEmail 
 * @param {string} parameterKey 
 * @param {Object} updatedValues
 */
exports.updateParameter = async (userUID, parameterKey, updatedValues) => {
  await db.runTransaction(async (transaction) => {
    const userRef = db.collection('users').doc(userUID);
    const userDoc = await transaction.get(userRef);
    
    if (!userDoc.exists) {
      throw new Error("Configuration not found for user.");
    }
    
    const parameterRef = userRef.collection('parameters').doc(parameterKey);

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
    
    transaction.update(userRef, { 
      version: admin.firestore.FieldValue.increment(1) 
    });
  });
};

/**
 * Delete (mark as deleted) a parameter
 * @param {string} userUID
 * @param {string} parameterKey 
 */
exports.deleteParameter = async (userUID, parameterKey) => {
    try {
      const userRef = db.collection('users').doc(userUID);
      const configSnapshot = await userRef.get();
      
      if (!configSnapshot.exists) {
        throw new Error('User configuration does not exist.');
      }
      
      const parameterRef = userRef.collection('parameters').doc(parameterKey);
      const parameterSnapshot = await parameterRef.get();
      
      if (!parameterSnapshot.exists) {
        throw new Error('Parameter not found.');
      }
      
      const versionsRef = parameterRef.collection('versions');
      const versionsSnapshot = await versionsRef.orderBy('version', 'desc').limit(1).get();
      
      if (versionsSnapshot.empty) {
        throw new Error('No versions found for this parameter.');
      }
      
      let highestVersionDoc = versionsSnapshot.docs[0];
      
      if (!highestVersionDoc) {
        throw new Error('Could not determine the latest version for this parameter.');
      }
      
      // update the parameter itself as deleted
      await db.runTransaction(async (transaction) => {
        transaction.update(parameterRef, { deleted: true });
      });
      
      return true;
    } catch (error) {
      throw error;
    }
  };