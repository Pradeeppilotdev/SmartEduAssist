// Vercel serverless API handler
// Import the shared app configuration
const app = require('./_app');

// Import AI helper functions
const { generateChatResponse, generateImprovement } = require('./gemini');
const { gradeSubmission } = require('./openai');

// Create routes for API endpoints
app.post('/api/ai/chat', async (req, res) => {
  try {
    const messages = req.body.messages;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Invalid messages array' });
    }
    
    // Verify API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing Gemini API key' });
    }
    
    // Call Gemini API
    const result = await generateChatResponse(messages);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
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
    
    // Verify API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Missing OpenAI API key' });
    }
    
    // Call OpenAI to grade the submission
    const result = await gradeSubmission(submission, assignment);
    
    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
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
    
    // Verify API key
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: 'Missing Gemini API key' });
    }
    
    // Call Gemini API for improvement suggestions
    const result = await generateImprovement(studentWork, initialFeedback);
    
    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }
    
    res.json(result);
  } catch (error) {
    console.error('Improvement API error:', error);
    res.status(500).json({ error: 'Failed to process improvement request' });
  }
});

// Add authentication endpoints
app.post('/api/register', (req, res) => {
  try {
    const { username, firstName, lastName, password, role } = req.body;
    // Validate required fields
    if (!username || !password || !firstName || !lastName) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // For demonstration purposes in Vercel deployment
    res.status(201).json({
      id: 1,
      username,
      firstName,
      lastName,
      role: role || 'teacher'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Validate required fields
    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Demo login for Vercel deployment
    res.status(200).json({
      id: 1,
      username,
      firstName: 'Demo',
      lastName: 'User',
      role: 'teacher'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ message: 'Invalid username or password' });
  }
});

app.post('/api/logout', (req, res) => {
  res.sendStatus(200);
});

app.get('/api/user', (req, res) => {
  // In production, this would check for a valid session
  // For Vercel demo, we'll return a demo user if the demo mode is enabled
  
  // This is a simple way to enable "demo mode" for the serverless function
  // In a real app, you'd use proper session/auth management
  const authenticated = true; // Enable demo mode for the deployed app
  
  if (!authenticated) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  
  res.json({
    id: 1,
    username: 'demo_user',
    firstName: 'Demo',
    lastName: 'User',
    role: 'teacher'
  });
});

// Add API endpoints for classes
app.get('/api/classes', (req, res) => {
  // Return sample classes for demonstration
  res.json([
    {
      id: 1,
      name: 'Introduction to Computer Science',
      description: 'Fundamentals of computer science and programming',
      teacherId: 1,
      createdAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Data Structures and Algorithms',
      description: 'Advanced data structures and algorithm analysis',
      teacherId: 1,
      createdAt: new Date().toISOString()
    }
  ]);
});

app.post('/api/classes', (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name) {
      return res.status(400).json({ message: 'Class name is required' });
    }
    
    res.status(201).json({
      id: Math.floor(Math.random() * 1000) + 10,
      name,
      description: description || '',
      teacherId: 1,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ message: 'Failed to create class' });
  }
});

// Add API endpoints for assignments
app.get('/api/assignments', (req, res) => {
  // Return sample assignments for demonstration
  res.json([
    {
      id: 1,
      title: 'Programming Basics',
      description: 'Create a simple program demonstrating variables and control flow',
      classId: 1,
      type: 'essay',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      status: 'open'
    }
  ]);
});

app.get('/api/assignments/recent', (req, res) => {
  // Return sample recent assignments with stats
  res.json([
    {
      id: 1,
      title: 'Programming Basics',
      description: 'Create a simple program demonstrating variables and control flow',
      classId: 1,
      type: 'essay',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString(),
      status: 'open',
      className: 'Introduction to Computer Science',
      submissionCount: 5,
      totalStudents: 15
    }
  ]);
});

app.post('/api/assignments', (req, res) => {
  try {
    const { title, description, classId, type, dueDate, status } = req.body;
    
    if (!title || !classId || !type || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    res.status(201).json({
      id: Math.floor(Math.random() * 1000) + 10,
      title,
      description: description || '',
      classId,
      type,
      dueDate: new Date(dueDate).toISOString(),
      createdAt: new Date().toISOString(),
      status: status || 'open'
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Failed to create assignment' });
  }
});

// Add API endpoints for submissions
app.get('/api/submissions/pending', (req, res) => {
  // Return empty array for demo (no pending submissions)
  res.json([]);
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

// For Vercel serverless functions, we need to properly export the handler function
// Setup server for local development
const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`API server running on port ${process.env.PORT || 3000}`);
});

// Handle proper shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
  });
});

// Export API handler for Vercel serverless environment
module.exports = app;