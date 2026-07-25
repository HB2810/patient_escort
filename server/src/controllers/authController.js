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

    const { memoryStore } = require('../db');
    let user = memoryStore.users.find(u => u.username === username);

    if (!user) {
      return res.status(401).json({ success: false, error: 'User not found' });
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
