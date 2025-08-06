// @ts-ignore
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import bcrypt from 'bcrypt';

const app = express();
const port = 3001; // Different port to avoid conflicts

// In-memory user storage for demo
const users: any[] = [];
const spots: any[] = [];

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'], // React dev server and any other
  credentials: true
}));

// Session configuration
app.use(session({
  secret: 'coffee-app-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use(express.json());

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    username?: string;
  }
}

// Root endpoint
app.get('/', (req, res) => {
    res.send('☕ CoffeeSpots Demo API ist erreichbar! (In-Memory Version)');
});

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email or username already exists'
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      password: hashedPassword,
      createdAt: new Date()
    };
    
    users.push(newUser);

    // Create session
    req.session.userId = newUser.id;
    req.session.username = newUser.username;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Create session
    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Could not log out'
      });
    }
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
});

// Get current user endpoint
app.get('/api/auth/me', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({
      success: true,
      user: {
        id: req.session.userId,
        username: req.session.username
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Not authenticated'
    });
  }
});

// Auth middleware
const requireAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ 
      success: false, 
      message: 'Authentication required. Please log in.' 
    });
  }
};

// Protected spots endpoints
app.get('/api/spots', requireAuth, (req, res) => {
  const userSpots = spots.filter(spot => spot.userId === req.session?.username);
  res.json({
    success: true,
    spots: userSpots,
    user: req.session?.username
  });
});

app.post('/api/spots', requireAuth, (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({
        success: false,
        message: "Location is required"
      });
    }
    
    const newSpot = {
      _id: Date.now().toString(),
      userId: req.session?.username,
      location,
      createdAt: new Date()
    };
    
    spots.push(newSpot);
    
    res.status(201).json({
      success: true,
      message: "Spot added successfully",
      spot: newSpot
    });
  } catch (error) {
    console.error("Error adding spot:", error);
    res.status(500).json({
      success: false,
      message: "Error adding spot"
    });
  }
});

app.listen(port, () => {
    console.log(`🚀 CoffeeSpots Demo-App läuft auf http://localhost:${port}`);
    console.log(`📝 This is an in-memory demo version that works without external database`);
    console.log(`🔑 Registration and login with session cookies are working!`);
    console.log(`🛡️  Protected routes require authentication`);
    console.log(`🧪 Ready for testing!`);
});