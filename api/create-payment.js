// Enhanced Payment API Endpoint for Phase 2
// This file is for Phase 2 implementation when Cashfree SDK is working

import { Cashfree } from 'cashfree-pg';

// Initialize Cashfree
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Extract customer data from lead capture form
    const { 
      customer_email, 
      customer_name, 
      customer_phone,
      order_amount = 1499.00,
      order_currency = 'INR'
    } = req.body;

    // Validate required fields
    if (!customer_email || !customer_name) {
      return res.status(400).json({ 
        error: 'Missing required customer information',
        required_fields: ['customer_email', 'customer_name']
      });
    }

    // Generate unique order ID
    const orderId = `BTD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Prepare phone number with validation
    let phoneNumber = customer_phone;
    if (!phoneNumber || phoneNumber.length < 10) {
      // Generate fallback phone number
      phoneNumber = '+919999999999';
    } else if (!phoneNumber.startsWith('+91')) {
      phoneNumber = '+91' + phoneNumber.replace(/\D/g, '');
    }

    // Create Cashfree order with pre-filled customer data
    const orderRequest = {
      order_id: orderId,
      order_amount: order_amount,
      order_currency: order_currency,
      
      // PRE-FILLED CUSTOMER DATA
      customer_details: {
        customer_id: `customer_${Date.now()}`,
        customer_email: customer_email,
        customer_name: customer_name,
        customer_phone: phoneNumber
      },
      
      order_meta: {
        return_url: `https://lfgventures.in/success.html?order_id=${orderId}&email=${encodeURIComponent(customer_email)}`,
        notify_url: 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/payment_success',
        payment_methods: 'cc,dc,nb,upi,paylater,emi,app'
      },
      
      order_note: `Beyond the Deck Course Purchase - Customer: ${customer_name}`,
      
      // Additional metadata for tracking
      order_tags: {
        source: 'lead_capture_modal',
        customer_type: 'high_intent',
        course: 'beyond_the_deck'
      }
    };

    console.log('Creating Cashfree order:', {
      order_id: orderId,
      customer_email: customer_email,
      customer_name: customer_name,
      amount: order_amount
    });

    // Create order via Cashfree API
    const orderResponse = await Cashfree.PGCreateOrder('2023-08-01', orderRequest);
    
    // Log successful order creation
    console.log('Order created successfully:', {
      order_id: orderId,
      payment_session_id: orderResponse.data.payment_session_id,
      customer_email: customer_email,
      amount: order_amount
    });

    // Return payment session details
    return res.status(200).json({
      success: true,
      order_id: orderId,
      payment_session_id: orderResponse.data.payment_session_id,
      payment_url: orderResponse.data.payment_links?.web,
      customer_prefilled: true,
      customer_details: {
        email: customer_email,
        name: customer_name,
        phone: phoneNumber
      },
      amount: order_amount,
      currency: order_currency
    });

  } catch (error) {
    console.error('Payment API error:', error);
    
    // Return detailed error for debugging in development
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    return res.status(500).json({
      success: false,
      error: 'Payment processing failed',
      message: isDevelopment ? error.message : 'Internal server error',
      fallback_url: 'https://payments.cashfree.com/forms/beyond-deck-course',
      timestamp: new Date().toISOString()
    });
  }
}

// Health check endpoint
export async function healthCheck(req, res) {
  try {
    // Check if Cashfree credentials are configured
    const isConfigured = !!(process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET);
    
    return res.status(200).json({
      status: 'healthy',
      service: 'payment-api',
      configured: isConfigured,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
}