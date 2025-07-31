// Payment Verification API Endpoint
// This endpoint verifies payment status using Cashfree's PGOrderFetchPayments API

import { Cashfree, CFEnvironment } from "cashfree-pg";

// Initialize Cashfree with same credentials as create-payment
const cashfree = new Cashfree(
    process.env.CASHFREE_ENVIRONMENT === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX,
    process.env.CASHFREE_CLIENT_ID,
    process.env.CASHFREE_CLIENT_SECRET
);

export default async function handler(req, res) {
    // Support both GET (from return_url) and POST requests
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // Extract order_id from query params (return_url) or request body
        const order_id = req.query.order_id || req.body?.order_id;

        if (!order_id) {
            return res.status(400).json({ 
                error: 'Missing order_id parameter',
                message: 'order_id is required to verify payment status'
            });
        }

        console.log('Verifying payment status for order:', order_id);

        // Fetch payment status from Cashfree using the provided pattern
        const response = await cashfree.PGOrderFetchPayments(order_id);
        
        console.log('Payment verification response:', {
            order_id: order_id,
            payments_count: response.data.length,
            environment: process.env.CASHFREE_ENVIRONMENT
        });

        // Implement the payment status logic from dev studio
        let getOrderResponse = response.data; // Get Order API Response
        let orderStatus;

        if (getOrderResponse.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
            orderStatus = "Success"
        } else if (getOrderResponse.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
            orderStatus = "Pending"
        } else {
            orderStatus = "Failure"
        }

        // Find the latest successful payment for details
        const successfulPayment = getOrderResponse.find(transaction => transaction.payment_status === "SUCCESS");
        const latestPayment = getOrderResponse[getOrderResponse.length - 1]; // Most recent payment

        // Prepare response with comprehensive payment information
        const verificationResult = {
            success: true,
            order_id: order_id,
            order_status: orderStatus,
            total_transactions: getOrderResponse.length,
            payment_details: {
                status: orderStatus,
                amount: latestPayment?.payment_amount || 0,
                currency: latestPayment?.payment_currency || 'INR',
                payment_method: latestPayment?.payment_group || 'unknown',
                payment_time: successfulPayment?.payment_completion_time || latestPayment?.payment_time,
                payment_message: latestPayment?.payment_message || '',
                cf_payment_id: successfulPayment?.cf_payment_id || latestPayment?.cf_payment_id
            },
            all_transactions: getOrderResponse, // Full transaction history
            verification_time: new Date().toISOString()
        };

        // Set appropriate HTTP status based on payment status
        const httpStatus = orderStatus === "Success" ? 200 : 
                          orderStatus === "Pending" ? 202 : 400;

        res.status(httpStatus).json(verificationResult);

    } catch (error) {
        console.error("Payment verification error:", error.response?.data || error.message || error);
        
        // Provide detailed error information
        const errorMessage = error.response?.data?.message || "Failed to verify payment status";
        const errorCode = error.response?.data?.code || "VERIFICATION_ERROR";

        res.status(error.response?.status || 500).json({ 
            success: false,
            error: errorMessage,
            code: errorCode,
            order_id: req.query.order_id || req.body?.order_id || 'unknown',
            timestamp: new Date().toISOString()
        });
    }
}