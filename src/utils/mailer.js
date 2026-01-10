// utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // ✅ Correct: use 'host', not 'service'
    port: 587,
    secure: false, // true for port 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Sends an email using predefined transporter
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} [options.html] - Optional HTML body
 * @returns {Promise<Object>}
 */
async function sendMail({ to, subject, text, html }) {
    try {
        const mailOptions = {
            from: `"DevTinder" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const emailInfo = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", emailInfo.accepted);
        return emailInfo;
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
        throw new Error("Failed to send email: " + error.message);
    }
}

module.exports = { sendMail };
