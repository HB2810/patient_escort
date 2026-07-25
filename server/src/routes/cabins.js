const express = require('express');
const router = express.Router();
const { memoryStore } = require('../db');

// Get all cabins
router.get('/', (req, res) => {
  res.json({ success: true, data: memoryStore.cabins });
});

// Update cabin escort assignment
router.patch('/:id/escort', (req, res) => {
  const { escort_id } = req.body;
  const cabin = memoryStore.cabins.find(c => c.id === parseInt(req.params.id));
  if (!cabin) return res.status(404).json({ success: false, error: 'Cabin not found' });

  cabin.assigned_escort_id = escort_id;
  const io = req.app.get('io');
  if (io) io.emit('cabin:updated', cabin);
  
  res.json({ success: true, data: cabin });
});

module.exports = router;
