import nodemailer from 'nodemailer';

interface EmailPayload {
    id: number;
    title: string;
    location: string;
    description: string;
    authorName: string;
}

/**
 * Service to handle email notifications.
 */
export const emailService = {
    /**
     * Sends an email notification to Tracks.Taps@gmail.com when a new tour is uploaded.
     * If SMTP configuration is not present in environment variables, it logs the alert details to console.
     * 
     * @param tour - The details of the created tour to include in the email
     * @returns A promise resolving to a boolean representing success
     */
    async sendAdminReviewAlert(tour: EmailPayload): Promise<boolean> {
        const adminEmail = 'Tracks.Taps@gmail.com';
        const smtpHost = process.env.SMTP_HOST;
        const smtpPort = Number(process.env.SMTP_PORT) || 587;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;

        const subject = `[Action Required] New Tour Uploaded: "${tour.title}"`;
        const textContent = `Hello Admin,\n\nA new tour has been uploaded and is pending review.\n\n` +
            `--- Tour Details ---\n` +
            `ID: ${tour.id}\n` +
            `Title: ${tour.title}\n` +
            `Location: ${tour.location}\n` +
            `Author: ${tour.authorName}\n` +
            `Description: ${tour.description}\n\n` +
            `Please log in to the admin panel to review and moderate this tour.\n\n` +
            `Best regards,\nTracks & Taps Platform`;

        const htmlContent = `
            <div style="font-family: sans-serif; padding: 20px; color: #333;">
                <h2 style="color: #6C5CE7;">New Tour Pending Review</h2>
                <p>Hello Admin,</p>
                <p>A new adventure has been uploaded and is waiting for your approval.</p>
                <div style="background-color: #F8F9FA; padding: 15px; border-left: 4px solid #6C5CE7; margin: 20px 0; border-radius: 4px;">
                    <strong>Title:</strong> ${tour.title}<br/>
                    <strong>Location:</strong> ${tour.location}<br/>
                    <strong>Author:</strong> ${tour.authorName}<br/>
                    <strong>Description:</strong> ${tour.description || 'N/A'}<br/>
                    <strong>Tour ID:</strong> ${tour.id}
                </div>
                <p>Please log in to the admin panel to approve or reject this tour.</p>
                <hr style="border: none; border-top: 1px solid #EEE; margin: 20px 0;" />
                <p style="font-size: 12px; color: #888;">Tracks & Taps Platform Notification Service</p>
            </div>
        `;

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.log('\n==================================================');
            console.log('📬  [EMAIL MOCK - NO SMTP CONFIG] to:', adminEmail);
            console.log('Subject:', subject);
            console.log('Content:\n', textContent);
            console.log('==================================================\n');
            return true;
        }

        try {
            const transporter = nodemailer.createTransport({
                host: smtpHost,
                port: smtpPort,
                secure: smtpPort === 465,
                auth: {
                    user: smtpUser,
                    pass: smtpPass
                }
            });

            await transporter.sendMail({
                from: `"Tracks & Taps Platform" <${smtpUser}>`,
                to: adminEmail,
                subject,
                text: textContent,
                html: htmlContent
            });

            console.log(`✅ Review notification email successfully sent to ${adminEmail}`);
            return true;
        } catch (error) {
            console.error('❌ Failed to send review notification email:', error);
            return false;
        }
    }
};
