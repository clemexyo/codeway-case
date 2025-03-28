const authService = require('../services/auth.service');

/**
 * Handle user sign in
 * @param {Object} req
 * @param {Object} res 
 */
exports.signIn = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const userData = await authService.signInWithEmailAndPassword(email, password);
    res.json(userData);
    // res.cookie("accessToken", userData.idToken);
    // res.cookie("refreshToken", userData.refreshToken, {
    //   httpOnly: true,
    // });
  } catch (error) {
    const errorMessage = error.response?.data?.error?.message || 'Authentication failed.';
    res.status(401).json({ error: errorMessage });
  }
};

/**
 * Handle user sign up
 * @param {Object} req 
 * @param {Object} res 
 */
exports.signUp = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    
    const userRecord = await authService.createUser(email, password);
    
    return res.status(201).json({
      message: 'User created successfully',
      user: userRecord
    });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};