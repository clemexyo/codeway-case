/**
 * Request Logger Middleware
 * Logs information about incoming HTTP requests
 */
const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();
    
    const { method, originalUrl, ip } = req;
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // create log entry
    const logEntry = {
      timestamp,
      method,
      url: originalUrl,
      ip,
      userAgent
    };
    
    // Log request body if not a GET request
    if (method !== 'GET' && req.body) {
      const safeBody = { ...req.body };
      
      // Mask sensitive information if present
      if (safeBody.password) safeBody.password = '********';
      if (safeBody.token) safeBody.token = '********';
      if (safeBody.accessToken) safeBody.accessToken = '********';
      if (safeBody.refreshToken) safeBody.refreshToken = '********';
      
      logEntry.body = safeBody;
    }
    
    console.log(`[REQUEST] ${JSON.stringify(logEntry)}`);
    
    const startTime = Date.now();
    
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // calculate response time
      const responseTime = Date.now() - startTime;
      
      res.end = originalEnd;
      
      const responseLog = {
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`
      };
      
      console.log(`[RESPONSE] ${JSON.stringify(responseLog)}`);
      
      return originalEnd.call(this, chunk, encoding);
    };
    
    // continue the flow
    next();
  };
  
  module.exports = requestLogger;