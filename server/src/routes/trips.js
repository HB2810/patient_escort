const express = require('express');
const router = express.Router();
const TripService = require('../services/TripService');

// Get all trips
router.get('/', (req, res) => {
  try {
    const trips = TripService.getAllTrips();
    res.json({ success: true, data: trips });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create new trip
router.post('/', (req, res) => {
  try {
    const trip = TripService.createTrip(req.body);
    const io = req.app.get('io');
    if (io) io.emit('trip:created', trip);
    res.status(201).json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update trip status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    const trip = TripService.updateStatus(req.params.id, status);
    const io = req.app.get('io');
    if (io) io.emit('trip:updated', trip);
    res.json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
