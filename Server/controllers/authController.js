// authController.js

const bcrypt = require('bcrypt');
const User = require('../model/User');


// Signup controller function
const signup = async (req, res) => {
    try {
        const { username, email, phone, password, confirmPassword } = req.body;

        // Check if email or phone number is provided
        if (!username || (!email && !phone) || !password || !confirmPassword) {
            return res.status(400).json({ message: 'Username, email or phone number, password, and confirmation password are required' });
        }
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        const findCategory = email ? { email } : { phone };

        // Check if user already exists
        const userExists = await User.findOne(findCategory);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ username, email, phone, password: hashedPassword });
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
