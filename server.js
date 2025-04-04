const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(bodyParser.json());

app.post('/process-contribution', async (req, res) => {
    const { name, email, amount, purpose, currency, cardNumber, cardExpiry, cardCVV } = req.body;

    // Placeholder: Process payment using card details
    const paymentSuccess = true; // Simulate payment success

    if (paymentSuccess) {
        // Send confirmation email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'your-email@gmail.com',
                pass: 'your-email-password',
            },
        });

        const mailOptions = {
            from: 'your-email@gmail.com',
            to: email,
            subject: 'Contribution Confirmation',
            text: `Dear ${name},\n\nThank you for your contribution of ${amount} ${currency} towards ${purpose}.\n\nBest regards,\nRobin's Children's Choir`,
        };

        try {
            await transporter.sendMail(mailOptions);
            res.status(200).send('Contribution processed successfully.');
        } catch (error) {
            console.error('Error sending email:', error);
            res.status(500).send('Error sending confirmation email.');
        }
    } else {
        res.status(400).send('Payment failed.');
    }
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
