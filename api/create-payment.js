import { Cashfree } from "cashfree-pg";

// Corrected static initialization
Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = "PRODUCTION"; // Use the correct string value

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
        const request = {
            order_amount: 1499.00,
            order_currency: "INR",
            customer_details: {
                customer_id: "customer_" + Date.now(),
                customer_email: "test@example.com",
                customer_phone: "9999999999",
            },
            order_meta: {
                return_url: "https://www.lfgventures.in/success.html?order_id={order_id}",
            },
            order_note: "Beyond the Deck Course",
        };

        // Call the static PGCreateOrder method with the required API version
        const order = await Cashfree.PGCreateOrder("2023-08-01", request);
        
        res.status(200).json(order.data);

    } catch (error) {
        console.error("Cashfree Error:", error.response?.data || error.message);
        res.status(500).json({ error: "Failed to create payment order" });
    }
}