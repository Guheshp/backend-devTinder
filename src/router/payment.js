const express = require('express');
const { userAuth } = require('../middleware/authmiddleware');
const router = express.Router();
const razorpayInstance = require('../utils/razorpay');
const Payment = require('../model/payment');
const { memberAmount } = require('../utils/constants');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const User = require('../model/user');
const { use } = require('react');

router.post('/create', userAuth, async (req, res) => {
    console.log("Payment request received");
    const { memberShipType } = req.body;
    const { _id, firstName, lastName, emailId } = req.user;
    try {
        const order = await razorpayInstance.orders.create({
            amount: memberAmount[memberShipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName: firstName,
                lastName: lastName,
                emailId: emailId,
                memberShipType: memberShipType
            }
        }

        );

        console.log(order);
        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            notes: order.notes,
            status: order.status,
            memberShipType: memberShipType
        });

        const savePayment = await payment.save();

        res.status(201).json({
            success: true,
            ...savePayment.toJSON(),
            keyId: process.env.Razorpay_Key_ID
        }
        )
    } catch (error) {

    }
});

router.post('/webhook', async (req, res) => {

    try {
        const webhookSignature = req.headers['x-razorpay-signature'];
        const isWebHookValid = validateWebhookSignature(JSON.stringify(req.body), webhookSignature, process.env.Razorpay_Webhook_Secret);


        if (!isWebHookValid) {
            return res.status(400).json({ success: false, message: "Invalid signature" });
        }


        const paymentDetails = req.body.payload.payment.entity;

        const paymentRecord = await Payment.findOne({ orderId: paymentDetails.order_id });
        if (!paymentRecord) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        paymentRecord.status = paymentDetails.status;
        await paymentRecord.save();

        const userId = paymentRecord.userId;
        const User = await User.findById(userId);
        User.isPremium = true;
        User.memberShipType = paymentRecord.notes.memberShipType;
        await User.save();

        if (req.body.event === 'payment.captured') {
            console.log("Payment captured successfully for order:", paymentDetails.order_id);
        }

        if (req.body.event === 'payment.failed') {
            console.log("Payment failed for order:", paymentDetails.order_id);
        }

        res.status(200).json({ success: true, message: "Webhook received successfully" });



    } catch (error) {
        console.log("Webhook signature validation failed", error);
        return res.status(400).json({ success: false, message: "Invalid signature" });
    }
})





module.exports = router;