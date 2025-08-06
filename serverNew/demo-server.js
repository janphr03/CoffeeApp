"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const app = (0, express_1.default)();
const port = 3001; // Different port to avoid conflicts
// In-memory user storage for demo
const users = [];
const spots = [];
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://localhost:3001'], // React dev server and any other
    credentials: true
}));
// Session configuration
app.use((0, express_session_1.default)({
    secret: 'coffee-app-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));
app.use(express_1.default.json());
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
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
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
    }
    catch (error) {
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
        const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
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
    }
    catch (error) {
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
    }
    else {
        res.status(401).json({
            success: false,
            message: 'Not authenticated'
        });
    }
});
// Auth middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    else {
        return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in.'
        });
    }
};
// Protected spots endpoints
app.get('/api/spots', requireAuth, (req, res) => {
    var _a;
    const userSpots = spots.filter(spot => { var _a; return spot.userId === ((_a = req.session) === null || _a === void 0 ? void 0 : _a.username); });
    res.json({
        success: true,
        spots: userSpots,
        user: (_a = req.session) === null || _a === void 0 ? void 0 : _a.username
    });
});
app.post('/api/spots', requireAuth, (req, res) => {
    var _a;
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
            userId: (_a = req.session) === null || _a === void 0 ? void 0 : _a.username,
            location,
            createdAt: new Date()
        };
        spots.push(newSpot);
        res.status(201).json({
            success: true,
            message: "Spot added successfully",
            spot: newSpot
        });
    }
    catch (error) {
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
