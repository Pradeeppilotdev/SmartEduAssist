// Main Express app for serverless API
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const compression = require('compression');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Apply middleware
app.use(compression());

// Set up CORS properly for Vercel deployment
const allowedOrigins = [
  'https://grade-assist-ai.vercel.app',
  'https://gradeassist-ai.vercel.app',
  /\.vercel\.app$/
];

// In development, allow localhost
if (process.env.NODE_ENV !== 'production') {
  allowedOrigins.push('http://localhost:5000');
  allowedOrigins.push(/localhost/);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    // Check if the origin is allowed
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      return callback(null, true);
    }
    
    console.log(`CORS blocked request from: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Export the app for use in serverless functions
module.exports = app;