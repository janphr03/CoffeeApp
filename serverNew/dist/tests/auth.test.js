"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("../routes/auth"));
const app = (0, express_1.default)();
// Setup test app
app.use(express_1.default.json());
app.use((0, express_session_1.default)({
    secret: 'test-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));
app.use('/api/auth', auth_1.default);
describe('Authentication Routes', () => {
    beforeAll(async () => {
        // Connect to test database
        const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/coffee-app-test';
        await mongoose_1.default.connect(mongoUri);
    });
    afterAll(async () => {
        // Clean up test database
        if (mongoose_1.default.connection.db) {
            await mongoose_1.default.connection.db.dropDatabase();
        }
        await mongoose_1.default.connection.close();
    });
    beforeEach(async () => {
        // Clear users collection before each test
        if (mongoose_1.default.connection.db) {
            await mongoose_1.default.connection.db.collection('users').deleteMany({});
        }
    });
    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe(userData.username);
            expect(response.body.user.email).toBe(userData.email);
            expect(response.body.user.id).toBeDefined();
        });
        it('should not register user with existing email', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            // First registration
            await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(201);
            // Second registration with same email
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send({ ...userData, username: 'differentuser' })
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('already exists');
        });
        it('should not register user with short password', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: '123'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData)
                .expect(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('6 characters');
        });
    });
    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            await (0, supertest_1.default)(app)
                .post('/api/auth/register')
                .send(userData);
        });
        it('should login with correct credentials', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe('testuser');
        });
        it('should not login with incorrect password', async () => {
            const loginData = {
                email: 'test@example.com',
                password: 'wrongpassword'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid');
        });
        it('should not login with non-existent email', async () => {
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123'
            };
            const response = await (0, supertest_1.default)(app)
                .post('/api/auth/login')
                .send(loginData)
                .expect(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('Invalid');
        });
    });
    describe('GET /api/auth/me', () => {
        it('should return user info when logged in', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            // Register and login
            const agent = supertest_1.default.agent(app);
            await agent.post('/api/auth/register').send(userData);
            const response = await agent
                .get('/api/auth/me')
                .expect(200);
            expect(response.body.success).toBe(true);
            expect(response.body.user.username).toBe('testuser');
        });
        it('should return 401 when not logged in', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/api/auth/me')
                .expect(401);
            expect(response.body.success).toBe(false);
        });
    });
    describe('POST /api/auth/logout', () => {
        it('should logout successfully', async () => {
            const userData = {
                username: 'testuser',
                email: 'test@example.com',
                password: 'password123'
            };
            // Register and login
            const agent = supertest_1.default.agent(app);
            await agent.post('/api/auth/register').send(userData);
            const response = await agent
                .post('/api/auth/logout')
                .expect(200);
            expect(response.body.success).toBe(true);
            // Should not be able to access /me after logout
            await agent
                .get('/api/auth/me')
                .expect(401);
        });
    });
});
