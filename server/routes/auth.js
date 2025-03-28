const express = require('express');
const axios = require('axios');
const router = express.Router();
const admin = require('firebase-admin');

router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
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
    // Return the token and other info from Firebase
    res.json(response.data);
    // res.cookie("accessToken", response.idToken);
    // res.cookie("refreshToken", response.refreshToken, {
    //         httpOnly: true,
    // });
  } catch (error) {
    // Forward error message from Firebase, if available
    const errorMessage =
      error.response && error.response.data && error.response.data.error
        ? error.response.data.error.message
        : 'Authentication failed.';
    res.status(401).json({ error: errorMessage });
  }
});

router.post('/signup', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    return res.status(201).json({
      message: 'User created successfully',
      user: userRecord
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }

});

module.exports = router;
