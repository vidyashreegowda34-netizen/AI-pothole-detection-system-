const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const prisma = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'namma_tumakuru_default_secret_key_2026';

// In-memory OTP cache for instant development (fallback)
const otpStore = new Map();

// Helper to normalize phone numbers
function normalizePhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Send OTP to citizen phone number
 */
exports.sendOtp = async (req, res) => {
  try {
    const { phoneNumber } = req.body;
    const cleanPhone = normalizePhone(phoneNumber);

    if (!cleanPhone || cleanPhone.length !== 10) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid 10-digit mobile number'
      });
    }

    // Generate 4-digit OTP (e.g. 1234 for dev/demo testing)
    const otp = '1234';
    otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });

    console.log(`\n🔑 [OTP GENERATED] Mobile: +91-${cleanPhone} -> OTP: ${otp} (Valid for 5 mins)\n`);

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your mobile number. (For demo testing: use 1234)',
      devOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    });
  } catch (error) {
    console.error('sendOtp error:', error);
    return res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

/**
 * Verify OTP and login / register Citizen
 */
exports.verifyOtp = async (req, res) => {
  try {
    const { phoneNumber, otp, name } = req.body;
    const cleanPhone = normalizePhone(phoneNumber);

    if (!cleanPhone || !otp) {
      return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
    }

    // Verify OTP (1234 is universal demo OTP)
    const stored = otpStore.get(cleanPhone);
    const isValid = otp === '1234' || (stored && stored.otp === otp && stored.expiresAt > Date.now());

    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP. Please use 1234.' });
    }

    // Clear OTP from store
    otpStore.delete(cleanPhone);

    // Upsert Citizen user
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          phoneNumber: cleanPhone,
          name: name || `Citizen ${cleanPhone.slice(-4)}`,
          role: 'CITIZEN',
        },
      });
    } else if (name && !user.name) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role, phone: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        talukId: user.talukId,
        departmentId: user.departmentId,
      },
    });
  } catch (error) {
    console.error('verifyOtp error:', error);
    return res.status(500).json({ success: false, message: 'Verification failed' });
  }
};

/**
 * Department Officer & Administrator Login
 */
exports.officerLogin = async (req, res) => {
  try {
    const { identifier, password } = req.body; // Can be phone or username

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Identifier and password are required' });
    }

    const cleanIdentifier = identifier.trim();

    // Find officer or admin by phone or name
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phoneNumber: cleanIdentifier },
          { name: { equals: cleanIdentifier } },
        ],
        role: { in: ['OFFICER', 'ADMIN'] },
      },
      include: {
        department: true,
        taluk: true,
      },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or user not authorized' });
    }

    // Verify password
    let passwordMatches = false;
    if (user.password) {
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        passwordMatches = await bcrypt.compare(password, user.password);
      } else {
        passwordMatches = user.password === password;
      }
    } else {
      // Default fallback demo password
      passwordMatches = password === 'tumkur123' || password === 'admin123';
    }

    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role, phone: user.phoneNumber },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Officer login successful',
      token,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        name: user.name,
        role: user.role,
        department: user.department,
        taluk: user.taluk,
      },
    });
  } catch (error) {
    console.error('officerLogin error:', error);
    return res.status(500).json({ success: false, message: 'Login failed' });
  }
};

/**
 * Get current authenticated user profile
 */
exports.getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        department: true,
        taluk: true,
        _count: {
          select: {
            issues: true,
            upvotes: true,
          },
        },
      },
    });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user' });
  }
};
