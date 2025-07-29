import { Cashfree } from "cashfree-pg";

const cashfree = new Cashfree({
    mode: "production",
    api_key: process.env.CASHFREE_CLIENT_ID,
    api_secret: process.env.CASHFREE_CLIENT_SECRET,
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }
    try {
        const request = {
            order_amount: 1499.00,
            order_currency: "INR",
            customer_details: {
                customer_id: "customer_" + Date.now(), // Simple unique ID
                customer_email: "customer@example.com", // You can pass this from frontend if needed
                customer_phone: "9999999999",
            },
            order_meta: {
                return_url: "https://www.lfgventures.in/success.html?order_id={order_id}",
            },
            order_note: "Beyond the Deck Course",
        };
        const order = await cashfree.orders.create(request);
        res.status(200).json(order.data);
    } catch (error) {
        console.error("Error creating Cashfree order:", error);
        res.status(500).json({ error: "Failed to create payment order" });
    }
}