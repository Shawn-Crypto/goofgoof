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
    
    // Get customer data from URL parameters OR POST body
    let customerData = {};
    let fbp = null;
    let fbc = null;
    let source_url = '';
    let country = 'IN';
    let city = 'Mumbai';
    let state = 'Maharashtra';

    if (request.method === 'POST') {
      // Check content type to determine how to parse
      const contentType = request.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        // Read JSON data from success page
        const jsonData = await request.json();
        customerData = {
          email: jsonData.email || '',
          phone: jsonData.phone || '',
          first_name: jsonData.first_name || '',
          last_name: jsonData.last_name || '',
          order_id: jsonData.order_id || `order_${Date.now()}`,
          amount: parseFloat(jsonData.amount || '1499'),
          currency: jsonData.currency || 'INR'
        };
        fbp = jsonData.fbp || null;
        fbc = jsonData.fbc || null;
        source_url = jsonData.source_url || 'https://beyondthedeck.com';
        country = jsonData.country || 'IN';
        city = jsonData.city || 'Mumbai';
        state = jsonData.state || 'Maharashtra';
      } else {
        // Read POST form data from Zapier
        const formData = await request.formData();
        customerData = {
          email: formData.get('email') || '',
          phone: formData.get('phone') || '',
          first_name: formData.get('first_name') || '',
          last_name: formData.get('last_name') || '',
          order_id: formData.get('order_id') || `order_${Date.now()}`,
          amount: parseFloat(formData.get('amount') || '1499'),
          currency: formData.get('currency') || 'INR'
        };
        fbp = formData.get('fbp') || null;
        fbc = formData.get('fbc') || null;
        source_url = formData.get('source_url') || 'https://beyondthedeck.com';
        country = formData.get('country') || 'IN';
        city = formData.get('city') || 'Mumbai';
        state = formData.get('state') || 'Maharashtra';
      }
    } else {
      // Read URL parameters from success page calls
      customerData = {
        email: params.get('email') || '',
        phone: params.get('phone') || '',
        first_name: params.get('first_name') || '',
        last_name: params.get('last_name') || '',
        order_id: params.get('order_id') || `order_${Date.now()}`,
        amount: parseFloat(params.get('amount') || '1499'),
        currency: params.get('currency') || 'INR'
      };
      fbp = params.get('fbp') || null;
      fbc = params.get('fbc') || null;
      source_url = params.get('source_url') || 'https://beyondthedeck.com';
      country = params.get('country') || 'IN';
      city = params.get('city') || 'Mumbai';
      state = params.get('state') || 'Maharashtra';
    }

    // 🚨 DEBUG: Log what we're actually receiving
    console.log('DEBUG - Customer data received:', customerData);
    console.log('DEBUG - Email check:', !!customerData.email, customerData.email);
    console.log('DEBUG - Phone check:', !!customerData.phone, customerData.phone);

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

    // Use order_id as event_id for deduplication
    const eventId = customerData.order_id;
    const eventTime = Math.floor(Date.now() / 1000);

    // Prepare Facebook Conversions API payload
    const facebookPayload = {
      data: [{
        event_name: 'Purchase',
        event_time: eventTime,
        event_id: eventId, // Using order_id directly for deduplication
        action_source: 'website',
        event_source_url: source_url,
        user_data: {
          client_ip_address: clientIP.split(',')[0].trim(), // Take first IP if multiple
          client_user_agent: userAgent,
          ...(hashedEmail && { em: hashedEmail }),
          ...(hashedPhone && { ph: hashedPhone }),
          ...(hashedFirstName && { fn: hashedFirstName }),
          ...(hashedLastName && { ln: hashedLastName }),
          ...(fbc && { fbc: fbc }), // Use fbc from request body
          ...(fbp && { fbp: fbp }), // Use fbp from request body
          country: await hashData(country),
          ct: await hashData(city),
          st: await hashData(state)
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
        facebook_cookies: { _fbp: fbp, _fbc: fbc },
        event_id: eventId,
        source_url: source_url
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
        facebook_cookies: { _fbp: fbp, _fbc: fbc },
        customer_data_hashed: {
          email: !!hashedEmail,
          phone: !!hashedPhone,
          name: !!(hashedFirstName && hashedLastName)
        }
      },
      emq_parameters: {
        client_ip_address: '✅ Captured',
        client_user_agent: '✅ Captured',
        fbc: fbc ? '✅ Captured' : '❌ Missing',
        fbp: fbp ? '✅ Captured' : '❌ Missing',
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