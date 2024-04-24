const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    // default: '' 
  },
  phone: {
    type: String,
    unique: true,
    // default: '' 
  },
  password: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  otpExpiration: {
    type: Date,
    required: true
  }
});

// Indexes
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('laundry', userSchema);

module.exports = User;
