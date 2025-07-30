// Enhanced Payment API Endpoint for Phase 2
// This file aligns with Cashfree tech team suggestions for SDK usage.

import { Cashfree, CFEnvironment } from "cashfree-pg"; // MODIFIED: Import CFEnvironment

// Use the instance-based initialization as recommended by Cashfree
// MODIFIED: Pass env, appId, secretKey as direct arguments to the constructor
const cashfree = new Cashfree(
    process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX, // Use CFEnvironment enum
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
);

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Extract customer data from lead capture form (from req.body)
        const { 
            customer_email, 
            customer_name, 
            customer_phone,
            order_amount = 1499.00, // Default to 1499.00 if not provided
            order_currency = 'INR' // Default to INR if not provided
        } = req.body;

        // Basic validation for required fields
        if (!customer_email || !customer_name) {
            return res.status(400).json({ 
                error: 'Missing required customer information',
                required_fields: ['customer_email', 'customer_name']
            });
        }

        // Generate a unique order ID
        const orderId = `BTD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Prepare phone number with a robust fallback and formatting
        let phoneNumber = customer_phone;
        if (!phoneNumber || phoneNumber.length < 10) {
            // Fallback to a default valid number if not provided or too short
            phoneNumber = '9999999999'; 
        }
        // Ensure phone number starts with country code if not already present (assuming India)
        if (!phoneNumber.startsWith('+91') && phoneNumber.length === 10) {
            phoneNumber = '+91' + phoneNumber;
        }

        const request = {
            order_id: orderId,
            order_amount: order_amount,
            order_currency: order_currency,
            customer_details: {
                customer_id: "customer_" + Date.now(), // Unique ID for Cashfree
                customer_email: customer_email,
                customer_phone: phoneNumber,
                customer_name: customer_name
            },
            order_meta: {
                // Dynamic return URL to pass order_id and email to success page
                return_url: `https://lfgventures.in/success.html?order_id=${orderId}&email=${encodeURIComponent(customer_email)}`,
                // Replace YOUR_WEBHOOK_ID with your actual Zapier webhook ID for payment success notifications
                notify_url: 'https://hooks.zapier.com/hooks/catch/YOUR_WEBHOOK_ID/payment_success',
                payment_methods: 'cc,dc,nb,upi,paylater,emi,app' // Specify allowed payment methods
            },
            order_note: `Beyond the Deck Course Purchase - Customer: ${customer_name}`,
            order_tags: { // Custom tags for better tracking and analytics
                source: 'lead_capture_modal',
                customer_type: 'high_intent',
                course: 'beyond_the_deck'
            }
        };

        console.log('Attempting to create Cashfree order:', {
            order_id: orderId,
            customer_email: customer_email,
            customer_name: customer_name,
            amount: order_amount
        });

        // MODIFIED: Call PGCreateOrder directly on the cashfree instance
        // This aligns with the SDK's expected usage for creating orders.
        const orderResponse = await cashfree.PGCreateOrder(request); 
        
        console.log('Cashfree order created successfully:', {
            order_id: orderResponse.data.order_id,
            payment_session_id: orderResponse.data.payment_session_id,
            status: orderResponse.data.order_status,
            customer_email: customer_email,
            amount: order_amount
        });

        res.status(200).json({
            success: true,
            order_id: orderResponse.data.order_id,
            payment_session_id: orderResponse.data.payment_session_id,
            payment_url: orderResponse.data.payment_links?.web, // Provide the payment URL from Cashfree
            customer_prefilled: true,
            customer_details: { // Echo back customer details for frontend confirmation
                email: customer_email,
                name: customer_name,
                phone: phoneNumber
            },
            amount: order_amount,
            currency: order_currency,
            // Include other relevant data from the Cashfree response if needed by the frontend
            cashfree_response_data: orderResponse.data 
        });

    } catch (error) {
        console.error("Cashfree API Error:", error.response?.data || error.message || error);
        
        // Provide a more informative error response
        const errorMessage = error.response?.data?.message || "Failed to create payment order due to an internal server error.";
        const errorCode = error.response?.data?.code || "GENERIC_ERROR";

        res.status(error.response?.status || 500).json({ 
            success: false,
            error: errorMessage,
            code: errorCode,
            // Fallback to the direct Cashfree form URL in case API fails
            fallback_url: 'https://payments.cashfree.com/forms/beyond-deck-course',
            timestamp: new Date().toISOString()
        });
    }
}