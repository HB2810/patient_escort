const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    // ----------------------------------------------------------------------
    // TEMPORARY STUB: Bypassing MySQL because MySQL is not installed locally.
    // ----------------------------------------------------------------------
    if (password !== 'Escort@123') {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    let user = null;
    if (username === 'admin') user = { id: 1, username: 'admin', name: 'Super Admin', role: 'Super Admin', department: null };
    if (username === 'opd_desk') user = { id: 2, username: 'opd_desk', name: 'OPD Desk', role: 'OPD Front Desk', department: 'OPD' };
    if (username === 'rad_desk') user = { id: 3, username: 'rad_desk', name: 'Radiology Desk', role: 'Department Front Desk', department: 'Radiology' };
    if (username === 'escort1') user = { id: 4, username: 'escort1', name: 'Escort 1', role: 'Escort', department: 'OPD' };

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found in stub' });
    }

    const payload = { id: user.id, username: user.username, role: user.role, department: user.department };
    const token = jwt.sign(payload, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '8h' });

    res.json({
      success: true,
      data: { token, user }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
};
