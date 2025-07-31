// Health check endpoint for API availability detection
export default async function handler(req, res) {
  try {
    // Only allow HEAD and GET requests for health checks
    if (req.method !== 'HEAD' && req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Check if Cashfree credentials are configured
    const isConfigured = !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
    
    // Determine if payment API is ready
    const apiReady = isConfigured && process.env.PAYMENT_API_ENABLED === 'true';

    const healthData = {
      status: 'healthy',
      service: 'lead-capture-payment-api',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      features: {
        payment_api: apiReady,
        cashfree_configured: isConfigured,
        lead_capture: true
      }
    };

    // Return minimal response for HEAD requests
    if (req.method === 'HEAD') {
      return res.status(apiReady ? 200 : 503).end();
    }

    // Return full health data for GET requests
    return res.status(apiReady ? 200 : 503).json(healthData);

  } catch (error) {
    console.error('Health check failed:', error);
    
    if (req.method === 'HEAD') {
      return res.status(503).end();
    }
    
    return res.status(503).json({
      status: 'error',
      service: 'lead-capture-payment-api',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
}