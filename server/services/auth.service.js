const axios = require('axios');
const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Sign in user with email and password via Firebase REST API
 * @param {string} email 
 * @param {string} password
 * @returns {Object}
 */
exports.signInWithEmailAndPassword = async (email, password) => {
  const apiKey = process.env.FIREBASE_API_KEY;
  console.log('Using API key:', apiKey);
  
  const response = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      email,
      password,
      returnSecureToken: true
    }
  );
  
  return response.data;
};

/**
 * Create a new user in Firebase Authentication
 * @param {string} email 
 * @param {string} password 
 * @param {string} country 
 * @returns {Object} 
 */
exports.createUser = async (email, password, country) => {
  const userRecord = await admin.auth().createUser({
    email,
    password,
  });

  console.log(country)
  await db.collection('users').doc(userRecord.uid).set({
    email,
    country
  });
  
  return userRecord;
};