// authController.js

const bcrypt = require('bcrypt');
const User = require('../model/User');
const sendEmail = require('../utils/sendEmail');
const sendSMS = require('../utils/sendSMS');

exports.generateOTP = async (req, res) => {
  const { email, phone } = req.body;

  try {
    // Generate OTP
    const OTP = Math.floor(1000 + Math.random() * 9000).toString();

    // Set OTP expiration time (e.g., 5 minutes from now)
    const otpExpiration = new Date();
    otpExpiration.setMinutes(otpExpiration.getMinutes() + 5);

    // Save OTP to user
    const user = await User.findOneAndUpdate(
      { email },
      { otp: OTP, otpExpiration },
      { new: true }
    );

    // Send OTP via email
    await sendEmail(email, 'OTP Verification', `Your OTP is ${OTP}`);

    // Send OTP via SMS
    await sendSMS(phone, `Your OTP is ${OTP}`);

    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error generating OTP:', error);
    res.status(500).json({ message: 'Failed to generate OTP' });
  }
};


const signup = async (req, res) => {
    try {
        const { username, emailOrPhone, password, confirmPassword } = req.body;

        // Check if username, email or phone number, password, and confirmation password are provided
        if (!username || !emailOrPhone || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Username, email or phone number, password, and confirmation password are required' });
        }

        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Regex pattern for email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Regex pattern for phone number validation
        const phonePattern = /^\d{10}$/; // Modify this pattern according to your phone number format

        let isValidEmail = false;
        let isValidPhone = false;

        // Check if emailOrPhone matches the email pattern
        if (emailPattern.test(emailOrPhone)) {
            isValidEmail = true;
        }

        // Check if emailOrPhone matches the phone number pattern
        if (phonePattern.test(emailOrPhone)) {
            isValidPhone = true;
        }

        // If neither email nor phone number is valid
        if (!isValidEmail && !isValidPhone) {
            return res.status(400).json({ message: 'Invalid email or phone number' });
        }

        // Check if user already exists
        const userExists = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email: isValidEmail ? emailOrPhone : undefined, phone: isValidPhone ? emailOrPhone : undefined, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'Signup successful' });
    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Signup failed' });
    }
};


// Login controller function
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({ message: 'Login successful' });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Login failed' });
    }
};

module.exports = { signup, login };
