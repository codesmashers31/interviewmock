import nodemailer from 'nodemailer';

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendEmail = async ({ to, subject, html }) => {
    try {
        console.log(`Attempting to send email to: ${to}`);
        const mailOptions = {
            from: `"BenchMock Support" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const notifyReviewReceived = async (expertName, candidateEmail, sessionTopic, reviewData) => {
    const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #2563eb;">Session Feedback Received</h2>
            <p>Hello,</p>
            <p>Your mock interview session on <strong>${sessionTopic}</strong> has been reviewed by <strong>${expertName}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Overall Rating:</strong> ${reviewData.overallRating} / 5</p>
                <p><strong>Technical:</strong> ${reviewData.technicalRating} / 5</p>
                <p><strong>Communication:</strong> ${reviewData.communicationRating} / 5</p>
                <hr style="border: 0; border-top: 1px solid #d1d5db; margin: 10px 0;">
                <p><strong>Feedback:</strong></p>
                <p style="white-space: pre-wrap;">${reviewData.feedback}</p>
            </div>

            <p>Log in to your dashboard to view the full detailed report.</p>
            <br>
            <p>Best regards,<br>BenchMock Team</p>
        </div>
    `;

    return sendEmail({
        to: candidateEmail,
        subject: `New Feedback from ${expertName} - BenchMock`,
        html
    });
};
