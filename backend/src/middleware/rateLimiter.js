const rateLimit = require('express-rate-limit');

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts. Please try again later.' },
});

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Report limit reached. You can submit 3 reports per hour.' },
  keyGenerator: (req) => req.user?._id?.toString() || req.ip,
});

const measurementLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many measurements submitted. Please slow down.' },
});

const pingLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 30,
  message: { error: 'Too many ping requests.' },
});

module.exports = { generalLimiter, authLimiter, reportLimiter, measurementLimiter, pingLimiter };
