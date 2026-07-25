require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Expose io to routes
app.set('io', io);

// Mount API Routes
const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const cabinRoutes = require('./routes/cabins');
const userRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/cabins', cabinRoutes);
app.use('/api/users', userRoutes);

// Basic healthcheck
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// Socket connections
io.on('connection', (socket) => {
  console.log('⚡ Socket connected:', socket.id);
  
  socket.on('join_room', (room) => {
    socket.join(room);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
