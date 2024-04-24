const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const PORT = 8080;

app.use(bodyParser.json());
app.use(cors());

// MongoDB setup
mongoose.connect('mongodb://localhost:27017/laundry', {})
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Twilio setup
const accountSid = 'VA9fb9c01554034190e411b3a997a24617';
const authToken = 'YOUR_TWILIO_AUTH_TOKEN';
const client = new twilio(accountSid, authToken);

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-email-password'
  }
});

// Route to send OTP
app.post('/api/send-otp', async (req, res) => {
  const { method, destination } = req.body;

  // Generate 4-character alphanumeric OTP
  const OTP = generateOTP();

  try {
    // Send OTP via email
    if (method === 'email') {
      const mailOptions = {
        from: 'your-email@gmail.com',
        to: destination,
        subject: 'Your OTP',
        text: `Your OTP is ${OTP}`
      };
      await transporter.sendMail(mailOptions);
      res.status(200).json({ message: 'OTP sent successfully' });
    }
    // Send OTP via phone number
    else if (method === 'phone') {
      await client.messages.create({
        body: `Your OTP is ${OTP}`,
        to: destination,
        from: 'YOUR_TWILIO_PHONE_NUMBER'
      });
      res.status(200).json({ message: 'OTP sent successfully' });
    } else {
      res.status(400).json({ message: 'Invalid method' });
    }
  } catch (error) {
    console.error('Error sending OTP:', error);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
});

// Route to verify OTP
app.post('/api/verify-otp', (req, res) => {
  const { otp } = req.body;

  // Code to verify OTP
  // For simplicity, let's assume the OTP is correct
  // You would typically compare it with the OTP entered by the user

  res.status(200).json({ message: 'OTP verified successfully' });
});

function generateOTP() {
  // Generate 4-character alphanumeric OTP
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let OTP = '';
  for (let i = 0; i < 4; i++) {
    OTP += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return OTP;
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
