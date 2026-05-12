const express   = require('express');
const http      = require('http');
const { Server } = require('socket.io');
const mongoose  = require('mongoose');
const cors      = require('cors');
require('dotenv').config();

const app    = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  'https://reward-x-ecru.vercel.app',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true,
  },
});

app.use((req, res, next) => { req.io = io; next(); });

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

app.use('/api/auth',        require('./routes/authRoutes'));
app.use('/api/employees',   require('./routes/employeeRoutes'));
app.use('/api/rewards',     require('./routes/rewardRoutes'));
app.use('/api/attendance',  require('./routes/attendanceRoutes'));
app.use('/api/performance', require('./routes/performanceRoutes'));
app.use('/api/feedback',    require('./routes/feedbackRoutes'));
app.use('/api/badges',      require('./routes/badgeRoutes'));
app.use('/api/edit',        require('./routes/patchRoutes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () => console.log(`RewardX server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
