const express = require('express');
const router = express.Router();
const { memoryStore } = require('../db');

// Get all escorts
router.get('/escorts', (req, res) => {
  res.json({ success: true, data: memoryStore.escorts });
});

// Update escort duty status (AVAILABLE, ON_BREAK, OFF_DUTY)
router.patch('/escorts/:id/status', (req, res) => {
  const { status } = req.body;
  const escort = memoryStore.escorts.find(e => e.id === parseInt(req.params.id));
  if (!escort) return res.status(404).json({ success: false, error: 'Escort not found' });

  escort.status = status;
  const io = req.app.get('io');
  if (io) io.emit('escort:status_changed', escort);

  res.json({ success: true, data: escort });
});

module.exports = router;
