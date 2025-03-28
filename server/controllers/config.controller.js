const configService = require('../services/config.service');

/**
 * get all parameters for the authenticated user
 */
exports.getAllParameters = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const parameters = await configService.getAllParameters(userEmail);
    res.json({ parameters });
  } catch (error) {
    console.error('Error retrieving configurations:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * create a new parameter
 */
exports.createParameter = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const newParameter = req.body; // Expecting { key, value, description, createDate }
    
    await configService.createParameter(userEmail, newParameter);
    res.json({ message: 'Configuration updated successfully.' });
  } catch (error) {
    console.error('Error updating configuration:', error);
    res.status(409).json({ error: error.message });
  }
};

/**
 * update an existing parameter
 */
exports.updateParameter = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const parameterKey = req.params.parameterKey;
    const updatedValues = req.body; // Expecting { value, description }
    
    await configService.updateParameter(userEmail, parameterKey, updatedValues);
    res.json({ message: 'Parameter updated successfully.' });
  } catch (error) {
    console.error('Error updating parameter:', error);
    res.status(409).json({ error: error.message });
  }
};

/**
 * delete (mark as deleted) a parameter
 */
exports.deleteParameter = async (req, res) => {
  try {
    const userEmail = req.user.email;
    const parameterKey = req.params.key;
    
    await configService.deleteParameter(userEmail, parameterKey);
    res.json({ message: `Parameter "${parameterKey}" marked as deleted.` });
  } catch (error) {
    console.error('Error deleting parameter:', error);
    
    // Return appropriate status code based on error type
    if (error.message.includes('not found') || error.message.includes('does not exist')) {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: error.message });
  }
};