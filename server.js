/**
 * Student Validation System - Node.js Server
 * Main application entry point
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');

// Import routes
const studentRoutes = require('./routes/students');
const validationRoutes = require('./routes/validation');
const sessionRoutes = require('./routes/sessions');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'student-validation-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Make session data available to all views
app.use((req, res, next) => {
  res.locals.success_message = req.session.success_message;
  res.locals.error_message = req.session.error_message;
  delete req.session.success_message;
  delete req.session.error_message;
  next();
});

// Routes
app.use('/api/students', studentRoutes);
app.use('/api/validation', validationRoutes);
app.use('/api/sessions', sessionRoutes);

// Main pages
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Student Validation System',
    page: 'validation'
  });
});

app.get('/inscription', (req, res) => {
  res.render('inscription', { 
    title: 'Student Registration',
    page: 'inscription'
  });
});

app.get('/students', (req, res) => {
  res.render('students', { 
    title: 'All Students',
    page: 'students'
  });
});

app.get('/history', (req, res) => {
  res.render('history', { 
    title: 'Session History',
    page: 'history'
  });
});

// 404 Error handler
app.use((req, res) => {
  res.status(404).render('404', { 
    title: 'Page Not Found',
    page: 'error'
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║   🎓 Student Validation System - Node.js            ║');
  console.log('╟───────────────────────────────────────────────────────╢');
  console.log(`║   🚀 Server running on: http://localhost:${PORT}      ║`);
  console.log(`║   📊 Database: ${process.env.DB_NAME}           ║`);
  console.log(`║   🌍 Environment: ${process.env.NODE_ENV}                  ║`);
  console.log('╟───────────────────────────────────────────────────────╢');
  console.log('║   Press Ctrl+C to stop                               ║');
  console.log('╚═══════════════════════════════════════════════════════╝');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = app;
