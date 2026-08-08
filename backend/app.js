const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { generalLimiter } = require('./src/middleware/rateLimiter');
const errorHandler = require('./src/middleware/errorHandler');

const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const networkRoutes = require('./src/routes/network.routes');
const measurementRoutes = require('./src/routes/measurement.routes');
const reportRoutes = require('./src/routes/report.routes');
const outageRoutes = require('./src/routes/outage.routes');
const locationRoutes = require('./src/routes/location.routes');
const healthRoutes = require('./src/routes/health.routes');
const alertRoutes = require('./src/routes/alert.routes');
const adminRoutes = require('./src/routes/admin.routes');
const businessRoutes = require('./src/routes/business.routes');

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: true, // Accepts request from any frontend port (5173, 5175, etc.)
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// General rate limiter on all API routes
app.use('/api', generalLimiter);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/networks', networkRoutes);
app.use('/api/measurements', measurementRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/outages', outageRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business', businessRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    app: 'NetworkRadar Ghana API',
    tagline: 'Know Your Network Before You Connect',
    docs: '/api/health/status',
  });
});

// Centralized error handler
app.use(errorHandler);

module.exports = app;
