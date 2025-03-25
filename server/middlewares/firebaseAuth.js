const admin = require('firebase-admin');

async function verifyFirebaseToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
  try {
    const decodedToken = await admin.auth().verifyIdToken(authHeader);
    req.user = decodedToken; // Attach decoded token for further use if needed.
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
}

module.exports = verifyFirebaseToken;
