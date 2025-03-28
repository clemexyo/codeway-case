const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');
const verifyFirebaseToken = require('../middlewares/firebaseAuth.middleware');

// Configuration routes
router.get('/', verifyFirebaseToken, configController.getAllParameters);
router.post('/', verifyFirebaseToken, configController.createParameter);
router.put('/:parameterKey', verifyFirebaseToken, configController.updateParameter);
router.delete('/:parameterKey', verifyFirebaseToken, configController.deleteParameter);

module.exports = router;