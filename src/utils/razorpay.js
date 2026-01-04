const Razorpay = require("razorpay");

var instance = new Razorpay({
    key_id: process.env.Razorpay_Key_ID,
    key_secret: process.env.Razorpay_Key_Secret,
});

module.exports = instance;