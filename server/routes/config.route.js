const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');

// Configuration routes
router.get('/', configController.getAllParameters);
router.post('/', configController.createParameter);
router.put('/:parameterKey', configController.updateParameter);
router.delete('/:parameterKey', configController.deleteParameter);

module.exports = router;