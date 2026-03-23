const jwt = require('jsonwebtoken');
const Otp = require('../models/Otp');
const User = require('../models/User');

const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const requestOtp = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ message: 'Phone is required' });
    }

    const code = generateOtp();
    const ttlMinutes = 10;
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await Otp.deleteMany({ phone });
    await Otp.create({ phone, code, expiresAt });

    return res.status(201).json({
      message: 'OTP generated successfully',
      phone,
      otp: code
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to generate OTP' });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { phone, otp } = req.body;
    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const record = await Otp.findOne({ phone, code: otp });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    let user = await User.findOne({ phone });
    if (!user) {
      user = await User.create({ phone });
    }

    await Otp.deleteMany({ phone });

    const secret = process.env.JWT_SECRET;
    const token = jwt.sign(
      { id: user._id.toString(), phone: user.phone },
      secret,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name || null
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to verify OTP' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const normalizedName = String(name || '').trim();
    if (!normalizedName) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: normalizedName },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        phone: user.phone,
        name: user.name
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to update profile' });
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  updateProfile
};

