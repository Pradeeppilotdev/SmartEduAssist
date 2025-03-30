// Vercel serverless API handler
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
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://grade-assist-ai.vercel.app', /\.vercel\.app$/] 
    : 'http://localhost:5000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Create routes for API endpoints
app.post('/api/ai/chat', async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }
    
    // Proxy request to Gemini
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing Gemini API key' });
    }
    
    // Basic response for testing
    res.json({ 
      response: "This is a placeholder response from the Vercel serverless function. In production, this would connect to Gemini.",
      success: true 
    });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Failed to process chat request' });
  }
});

app.post('/api/ai/grade', async (req, res) => {
  try {
    const { submission, assignment } = req.body;
    if (!submission || !assignment) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Proxy request to OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }
    
    // Basic response for testing
    res.json({
      score: 85,
      feedback: {
        strengths: ["Good organization", "Clear explanations"],
        improvements: ["Could add more examples", "Some grammar errors"],
        comments: "Overall, a good submission that demonstrates understanding of the material."
      },
      rubricScores: { 
        "content": 4, 
        "organization": 4, 
        "grammar": 3, 
        "creativity": 4 
      }
    });
  } catch (error) {
    console.error('Grading API error:', error);
    res.status(500).json({ error: 'Failed to process grading request' });
  }
});

app.post('/api/ai/improve', async (req, res) => {
  try {
    const { studentWork, initialFeedback } = req.body;
    if (!studentWork || !initialFeedback) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }
    
    // Check for API keys
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing Gemini API key' });
    }
    
    // Basic response for testing
    res.json({
      improvements: "Here are some suggestions to improve your work: 1) Add more specific examples to support your main points, 2) Consider reorganizing paragraph 3 to flow better with your conclusion, 3) Review grammar and punctuation throughout."
    });
  } catch (error) {
    console.error('Improvement API error:', error);
    res.status(500).json({ error: 'Failed to process improvement request' });
  }
});

// Add authentication endpoints
app.post('/api/register', (req, res) => {
  // This is a placeholder endpoint for Vercel deployment
  res.status(201).json({
    id: 1,
    username: req.body.username,
    name: req.body.name,
    role: req.body.role || 'teacher'
  });
});

app.post('/api/login', (req, res) => {
  // This is a placeholder endpoint for Vercel deployment
  res.status(200).json({
    id: 1,
    username: req.body.username,
    name: "Demo User",
    role: 'teacher'
  });
});

app.post('/api/logout', (req, res) => {
  res.sendStatus(200);
});

app.get('/api/user', (req, res) => {
  // For testing, return an unauthorized status
  res.status(401).json({ message: 'Not authenticated' });
});

// Add a health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    environment: process.env.NODE_ENV,
    apis: {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY
    } 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

// Export for Vercel serverless function
module.exports = app;