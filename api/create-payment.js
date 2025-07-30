import { Cashfree } from "cashfree-pg";

// Correct Initialization for the current SDK version
// As per official Cashfree documentation
const cashfree = new Cashfree({
    env: 'PRODUCTION',
    appId: process.env.CASHFREE_CLIENT_ID,
    secretKey: process.env.CASHFREE_CLIENT_SECRET,
    apiVersion: '2023-08-01' // API version is set here
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
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

        // Generate unique order ID
        const orderId = `BTD_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const request = {
            order_id: orderId,
            order_amount: order_amount,
            order_currency: order_currency,
            customer_details: {
                customer_id: "customer_" + Date.now(),
                customer_email: customer_email || "test@example.com",
                customer_phone: customer_phone || "9999999999",
                customer_name: customer_name || "Test Customer"
            },
            order_meta: {
                return_url: `https://www.lfgventures.in/success.html?order_id=${orderId}`,
            },
            order_note: "Beyond the Deck Course Purchase",
        };

        // Use the instance to call the correct method, with no extra parameters
        const order = await cashfree.orders.create(request);
        
        console.log('Order created successfully:', {
            order_id: orderId,
            customer_email: customer_email,
            amount: order_amount
        });

        res.status(200).json({
            success: true,
            order_id: orderId,
            payment_session_id: order.data.payment_session_id,
            payment_url: order.data.payment_links?.web,
            customer_prefilled: true,
            ...order.data
        });

    } catch (error) {
        console.error("Cashfree Error:", error.response?.data || error.message);
        res.status(500).json({ 
            success: false,
            error: "Failed to create payment order",
            fallback_url: 'https://payments.cashfree.com/forms/beyond-deck-course'
        });
    }
}