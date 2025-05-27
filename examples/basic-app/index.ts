import { CenzeroApp } from '../../src';

const app = new CenzeroApp({
  port: 3000,
  staticDir: 'public',
  viewsDir: 'views'
});

// Global middleware for logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Middleware for JSON parsing
app.use((req, res, next) => {
  if (req.headers['content-type']?.includes('application/json') && req.body) {
    try {
      req.body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } catch (error) {
      console.error('Invalid JSON in request body');
    }
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Cenzero Framework!',
    framework: 'Cenzero',
    version: '1.0.0',
    endpoints: [
      'GET /',
      'GET /users',
      'GET /users/:id',
      'POST /users',
      'GET /hello/:name'
    ]
  });
});

app.get('/users', (req, res) => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@example.com' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com' }
  ];
  
  res.json({ users, count: users.length });
});

app.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params?.id || '0');
  const user = { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` };
  
  res.json({ user });
});

app.post('/users', (req, res) => {
  const { name, email } = req.body || {};
  
  if (!name || !email) {
    return res.status(400).json({ 
      error: 'Missing required fields', 
      required: ['name', 'email'] 
    });
  }
  
  const newUser = {
    id: Math.floor(Math.random() * 1000),
    name,
    email,
    createdAt: new Date().toISOString()
  };
  
  res.status(201).json({ 
    message: 'User created successfully',
    user: newUser 
  });
});

app.get('/hello/:name', (req, res) => {
  const name = req.params?.name || 'Anonymous';
  res.json({ 
    greeting: `Hello, ${name}!`,
    timestamp: new Date().toISOString()
  });
});

// Error handling route
app.get('/error', (req, res) => {
  throw new Error('This is a test error');
});

// Start the server
app.listen(3000, 'localhost', () => {
  console.log('🚀 Cenzero Basic App is running!');
  console.log('📋 Available endpoints:');
  console.log('   GET  http://localhost:3000/');
  console.log('   GET  http://localhost:3000/users');
  console.log('   GET  http://localhost:3000/users/:id');
  console.log('   POST http://localhost:3000/users');
  console.log('   GET  http://localhost:3000/hello/:name');
  console.log('   GET  http://localhost:3000/error (test error handling)');
});
