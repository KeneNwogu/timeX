import axios from 'axios';

export const sendMail = async (email: string, subject: string, html: string) => {
    const apiKey = process.env.MAILGUN_API_KEY;
    const domain = process.env.MAILGUN_DOMAIN;
    const from = `mailgun@${domain}`;
    const to = [email];
    // const subject = 'Test Email';
    // const text = 'This is a test email sent via Mailgun and Axios in TypeScript.';

    const mailgunUrl = `https://api.mailgun.net/v3/${domain}/messages`;

    await axios
        .post(
            mailgunUrl,
            `from=${from}&to=${to}&subject=${subject}&html=${html}`,
            {
                auth: {
                    username: 'api',
                    password: apiKey,
                },
            }
        )
}

export const loginGrantTemplate = (username: string, authToken: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login Token Grant</title>
</head>
<body>
    <p>Hello ${username},</p>
    <p>We have generated a login token for your account. To log in, please click the link below:</p>
    <a href="${process.env.FRONTEND_CLIENT}/login?authToken=${authToken}" target="_blank">Log In</a>
    <p>If you did not request this login token or have any concerns, please contact our support team.</p>
    <p>Thank you for choosing TimeX.</p>
    <p>Best regards,</p>
    <p>The TimeX Team</p>
</body>
</html>
`

