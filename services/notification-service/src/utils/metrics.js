const promClient = require('prom-client');

// Create a Registry to register the metrics
const register = new promClient.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: process.env.SERVICE_NAME || 'taskflow-service' // Set SERVICE_NAME in your deployment
});

// Enable the collection of default metrics
promClient.collectDefaultMetrics({ 
  register,
  timeout: 10000, // Collect every 10 seconds (less frequent for t2.micro)
  gcDurationBuckets: [0.001, 0.01, 0.1, 1, 2, 5] // Smaller buckets for micro instance
});

// Custom metrics for your TaskFlow app
const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made.',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // Optimized buckets
  registers: [register]
});

// Database operation metrics (if using database)
const dbOperationsTotal = new promClient.Counter({
  name: 'db_operations_total',
  help: 'Total database operations',
  labelNames: ['operation', 'table'],
  registers: [register]
});

// Export metrics and register
module.exports = {
  register,
  httpRequestsTotal,
  httpRequestDuration,
  dbOperationsTotal,
};

// Middleware function to track HTTP requests
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Skip metrics endpoint itself
  if (req.path === '/metrics') {
    return next();
  }
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    const route = req.route ? req.route.path : req.path;
    
    httpRequestsTotal
      .labels(req.method, route, res.statusCode.toString())
      .inc();
    
    httpRequestDuration
      .labels(req.method, route)
      .observe(duration);
  });
  
  next();
};

module.exports.metricsMiddleware = metricsMiddleware;