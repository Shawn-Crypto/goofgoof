export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  // Set CORS headers for cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    });
  }

  try {
    // Extract URL parameters
    const url = new URL(request.url);
    const params = url.searchParams;
    
    // Get customer data from URL parameters
    const customerData = {
      email: params.get('email') || '',
      phone: params.get('phone') || '',
      first_name: params.get('first_name') || '',
      last_name: params.get('last_name') || '',
      order_id: params.get('order_id') || `order_${Date.now()}`,
      amount: parseFloat(params.get('amount') || '1499'),
      currency: params.get('currency') || 'INR'
    };

    // Extract server-side data from headers
    const headers = request.headers;
    const clientIP = headers.get('x-forwarded-for') || 
                    headers.get('x-real-ip') || 
                    headers.get('cf-connecting-ip') || 
                    '127.0.0.1';
    
    const userAgent = headers.get('user-agent') || '';
    const cookieHeader = headers.get('cookie') || '';
    
    // Extract Facebook cookies from cookie header
    const extractFacebookCookies = (cookieStr) => {
      const cookies = {};
      cookieStr.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name === '_fbc' || name === '_fbp') {
          cookies[name] = value;
        }
      });
      return cookies;
    };

    const fbCookies = extractFacebookCookies(cookieHeader);

    // SHA-256 hashing function for customer data privacy
    async function hashData(data) {
      if (!data) return '';
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data.toLowerCase().trim());
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Process phone number for Indian format
    const processPhoneNumber = (phone) => {
      if (!phone) return '';
      let cleaned = phone.replace(/\D/g, ''); // Remove non-digits
      if (cleaned.startsWith('91') && cleaned.length === 12) {
        return `+${cleaned}`;
      } else if (cleaned.length === 10) {
        return `+91${cleaned}`;
      }
      return `+91${cleaned}`;
    };

    // Hash customer data for privacy compliance
    const hashedEmail = await hashData(customerData.email);
    const hashedPhone = await hashData(processPhoneNumber(customerData.phone));
    const hashedFirstName = await hashData(customerData.first_name);
    const hashedLastName = await hashData(customerData.last_name);

    // Create unique event ID for deduplication
    const eventId = `purchase_${customerData.order_id}_${Date.now()}`;
    const eventTime = Math.floor(Date.now() / 1000);

    // Prepare Facebook Conversions API payload
    const facebookPayload = {
      data: [{
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: eventId,
        action_source: 'website',
        event_source_url: params.get('source_url') || 'https://beyondthedeck.com',
        user_data: {
          client_ip_address: clientIP.split(',')[0].trim(), // Take first IP if multiple
          client_user_agent: userAgent,
          ...(hashedEmail && { em: hashedEmail }),
          ...(hashedPhone && { ph: hashedPhone }),
          ...(hashedFirstName && { fn: hashedFirstName }),
          ...(hashedLastName && { ln: hashedLastName }),
          ...(fbCookies._fbc && { fbc: fbCookies._fbc }),
          ...(fbCookies._fbp && { fbp: fbCookies._fbp }),
          country: await hashData(params.get('country') || 'IN'),
          ct: await hashData(params.get('city') || 'Mumbai'),
          st: await hashData(params.get('state') || 'Maharashtra')
        },
        custom_data: {
          currency: customerData.currency,
          value: customerData.amount,
          content_name: 'Beyond the Deck Course',
          content_category: 'Online Course',
          content_ids: ['beyond-deck-course'],
          content_type: 'product',
          num_items: 1
        }
      }],
      test_event_code: process.env.NODE_ENV === 'development' ? 'TEST12345' : undefined
    };

    console.log('Facebook Conversions API Payload:', JSON.stringify(facebookPayload, null, 2));

    // Send to Facebook Conversions API
    const facebookResponse = await fetch(
      `https://graph.facebook.com/v20.0/${process.env.FACEBOOK_PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FACEBOOK_ACCESS_TOKEN}`
        },
        body: JSON.stringify(facebookPayload)
      }
    );

    const facebookResult = await facebookResponse.json();
    console.log('Facebook API Response:', facebookResult);

    // Prepare Zapier webhook payload (backup tracking)
    const zapierPayload = {
      event_type: 'purchase',
      timestamp: new Date().toISOString(),
      customer: {
        email: customerData.email,
        phone: customerData.phone,
        first_name: customerData.first_name,
        last_name: customerData.last_name
      },
      order: {
        order_id: customerData.order_id,
        amount: customerData.amount,
        currency: customerData.currency,
        product: 'Beyond the Deck Course'
      },
      tracking: {
        client_ip: clientIP,
        user_agent: userAgent,
        facebook_cookies: fbCookies,
        event_id: eventId,
        source_url: params.get('source_url') || 'https://beyondthedeck.com'
      },
      facebook_response: facebookResult
    };

    // Only call Zapier if we have real customer data
    let zapierResponse = null;
    if (customerData.email && customerData.phone) {
      try {
        const zapierFetch = await fetch(process.env.ZAPIER_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(zapierPayload)
        });
        zapierResponse = await zapierFetch.json();
        console.log('Zapier Webhook Response:', zapierResponse);
      } catch (zapierError) {
        console.error('Zapier webhook failed:', zapierError);
        zapierResponse = { error: zapierError.message };
      }
    } else {
      zapierResponse = { status: 'skipped', reason: 'no customer data' };
      console.log('Zapier webhook skipped - no customer email/phone data');
    }

    // Return comprehensive response
    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      event_id: eventId,
      facebook: {
        sent: true,
        response: facebookResult,
        status: facebookResponse.status
      },
      zapier: {
        sent: zapierResponse !== null,
        response: zapierResponse
      },
      tracking_data: {
        client_ip: clientIP,
        user_agent: userAgent.substring(0, 100) + '...', // Truncate for response
        facebook_cookies: fbCookies,
        customer_data_hashed: {
          email: !!hashedEmail,
          phone: !!hashedPhone,
          name: !!(hashedFirstName && hashedLastName)
        }
      },
      emq_parameters: {
        client_ip_address: '✅ Captured',
        client_user_agent: '✅ Captured',
        fbc: fbCookies._fbc ? '✅ Captured' : '❌ Missing',
        fbp: fbCookies._fbp ? '✅ Captured' : '❌ Missing',
        hashed_email: hashedEmail ? '✅ Captured' : '❌ Missing',
        hashed_phone: hashedPhone ? '✅ Captured' : '❌ Missing',
        geographic_data: '✅ Included'
      }
    };

    return new Response(JSON.stringify(response, null, 2), {
      status: 200,
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Enhanced tracking error:', error);
    
    const errorResponse = {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      debug: {
        message: 'Edge function encountered an error',
        stack: error.stack
      }
    };

    return new Response(JSON.stringify(errorResponse, null, 2), {
      status: 500,
      headers: corsHeaders
    });
  }
}