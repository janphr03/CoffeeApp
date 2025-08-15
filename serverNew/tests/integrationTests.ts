// serverNew/tests/integrationTests.ts
import request from 'supertest';
import express, { type Express, type Request, type Response } from 'express';
import session from 'express-session';
import cors from 'cors';
import authRoutes from '../routes/auth';
import spotsRoutes from '../routes/spots';

// DATEN KOMMEN AUS DER ECHTEN DB, KEINE TEST DB ANGELGEGT FÜR DIESES PROJEKT


type TestFn = () => Promise<void> | void;

class IntegrationTestRunner {
    //  Felder für Tests und Ergebnisse
    tests: Array<{ name: string; fn: TestFn }> = [];
    passed = 0;
    failed = 0;
    app!: Express; // wird in setupApp() gesetzt

    constructor() {
        this.setupApp();
    }

    private setupApp(): void {
        this.app = express();

        // CORS konfigurieren
        this.app.use(
            cors({
                origin: 'http://localhost:5000',
                credentials: true,
            })
        );

        // Session konfigurieren
        this.app.use(
            session({
                secret: 'test-secret-key',
                resave: false,
                saveUninitialized: false,
                cookie: {
                    secure: false,
                    httpOnly: true,
                    maxAge: 1000 * 60 * 60 * 24,
                },
            })
        );

        // Body Parser
        this.app.use(express.json());

        // Routes
        this.app.use('/api/auth', authRoutes);
        this.app.use('/api/spots', spotsRoutes);

        // Health Check
        this.app.get('/', (_req: Request, res: Response) => {
            res.json({ message: 'Test Server läuft' });
        });
    }

    test(name: string, fn: TestFn): void {
        this.tests.push({ name, fn });
    }

    async run(): Promise<void> {
        console.log('Starte Integration Tests mit eigenem Test-Server...\n');

        for (const t of this.tests) {
            try {
                await t.fn();
                console.log(`${t.name}`);
                this.passed++;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err); // TS18046 fix
                console.error(`${t.name}: ${msg}`);
                this.failed++;
            }
        }

        console.log(`\nErgebnis: ${this.passed} erfolgreich, ${this.failed} fehlgeschlagen`);
        if (this.failed > 0) process.exit(1);
    }
}

const runner = new IntegrationTestRunner();

// Kleine Assert-Helfer mit Typen
function assert(condition: unknown, message?: string): asserts condition {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
        throw new Error(message || `Expected '${String(expected)}', got '${String(actual)}'`);
    }
}

// ===== INTEGRATION TESTS =====

runner.test('Server Health Check', async () => {
    const response = await request(runner.app).get('/');
    assertEqual(response.status, 200, 'Health Check sollte 200 zurückgeben');
    assertEqual(response.body.message, 'Test Server läuft', 'Health Check Message');
});

runner.test('Auth Middleware - Ohne Login auf /api/spots', async () => {
    const response = await request(runner.app).get('/api/spots');

    assertEqual(response.status, 401, 'Ohne Auth sollte 401 zurückgeben');
    assert(!response.body.success, 'success sollte false sein');
    assertEqual(response.body.message, 'Authentication required. Please log in.', 'Auth-Fehlermeldung');
});

runner.test('Register - Missing Fields', async () => {
    const response = await request(runner.app)
        .post('/api/auth/register')
        .send({ username: '', email: 'test@example.com', password: '123' });

    assertEqual(response.status, 400, 'Fehlende Felder sollten 400 zurückgeben');
    assertEqual(response.body.message, 'Please enter all fields', 'Exakte Fehlermeldung aus auth.ts');
});

runner.test('Register - Erfolgreiche Registrierung', async () => {
    const uniqueId = Date.now();
    const testUser = {
        username: `testuser_${uniqueId}`,
        email: `test_${uniqueId}@example.com`,
        password: 'testpassword123',
    };

    const response = await request(runner.app).post('/api/auth/register').send(testUser);

    assertEqual(response.status, 201, 'Registrierung sollte 201 zurückgeben');
    assert(response.body.success, 'success sollte true sein');
    assertEqual(response.body.message, ' Benutzer erfolgreich registriert.', 'Success-Message');
});

runner.test('Register - Doppelter Username', async () => {
    const uniqueId = Date.now();
    const testUser = {
        username: `duplicate_${uniqueId}`,
        email: `test1_${uniqueId}@example.com`,
        password: 'testpassword123',
    };

    // Erst registrieren
    await request(runner.app).post('/api/auth/register').send(testUser);

    // Nochmal mit gleichem Username
    const response = await request(runner.app)
        .post('/api/auth/register')
        .send({
            ...testUser,
            email: `test2_${uniqueId}@example.com`,
        });

    assertEqual(response.status, 400, 'Doppelter Username sollte 400 zurückgeben');
    assertEqual(response.body.message, 'Benutzer existiert bereits.', 'Doppelter Username Fehlermeldung');
});

runner.test('Login - Missing Fields', async () => {
    const response = await request(runner.app)
        .post('/api/auth/login')
        .send({ identifier: 'testuser', password: '' });

    assertEqual(response.status, 400, 'Fehlende Felder sollten 400 zurückgeben');
    assertEqual(response.body.message, 'Bitte alle Felder ausfüllen.', 'Login Fehlermeldung');
});

runner.test('Login - Erfolgreicher Login mit Session', async () => {
    const uniqueId = Date.now();
    const testUser = {
        username: `logintest_${uniqueId}`,
        email: `logintest_${uniqueId}@example.com`,
        password: 'testpassword123',
    };

    // Session-Agent erstellen
    const agent = request.agent(runner.app);

    // Registrieren
    await agent.post('/api/auth/register').send(testUser);

    // Login (Session wird automatisch gespeichert)
    const loginResponse = await agent.post('/api/auth/login').send({
        identifier: testUser.username,
        password: testUser.password,
    });

    assertEqual(loginResponse.status, 200, 'Login sollte 200 zurückgeben');
    assertEqual(loginResponse.body.message, 'Erfolgreich eingeloggt.', 'Login Success-Message');

    // Mit Session auf geschützte Route zugreifen
    const spotsResponse = await agent.get('/api/spots');
    assertEqual(spotsResponse.status, 200, 'Mit Session sollte /api/spots 200 zurückgeben');
});

runner.test('Spots - POST mit Authentication', async () => {
    const uniqueId = Date.now();
    const testUser = {
        username: `spottest_${uniqueId}`,
        email: `spottest_${uniqueId}@example.com`,
        password: 'testpassword123',
    };

    const agent = request.agent(runner.app);

    // Registrieren (auto-login)
    await agent.post('/api/auth/register').send(testUser);

    // Spot hinzufügen
    const spotData = {
        osmType: 'node',
        osmId: uniqueId,
        elementLat: 48.1351,
        elementLng: 11.582,
        name: `Test Café ${uniqueId}`,
        amenity: 'cafe',
        address: 'Test Address',
        tags: { opening_hours: '08:00-20:00' },
    };

    const response = await agent.post('/api/spots').send(spotData);

    assertEqual(response.status, 201, 'Spot hinzufügen sollte 201 zurückgeben');
    assertEqual(response.body.message, 'Spot added successfully', 'Spot Success-Message');
    assert(response.body.insertedId, 'insertedId sollte vorhanden sein');
});

runner.test('Favorites Count - Öffentlicher Endpoint', async () => {
    const testSpotId = 'node:123456789';

    const response = await request(runner.app).get(`/api/spots/favorites-count/${testSpotId}`);

    assertEqual(response.status, 200, 'Favorites count sollte 200 zurückgeben');
    assert(typeof response.body.favoritesCount === 'number', 'favoritesCount sollte number sein');
    assertEqual(response.body.spotId, testSpotId, 'spotId sollte zurückgegeben werden');
});

runner.test('Delete Spot - Mit Authentication', async () => {
    const uniqueId = Date.now();
    const testUser = {
        username: `deletetest_${uniqueId}`,
        email: `deletetest_${uniqueId}@example.com`,
        password: 'testpassword123',
    };

    const agent = request.agent(runner.app);

    // Registrieren
    await agent.post('/api/auth/register').send(testUser);

    // Spot hinzufügen
    const spotData = {
        osmType: 'node',
        osmId: uniqueId,
        elementLat: 48.1351,
        elementLng: 11.582,
        name: `Delete Test ${uniqueId}`,
        amenity: 'cafe',
    };

    await agent.post('/api/spots').send(spotData);

    // Spot löschen
    const deleteResponse = await agent.delete(`/api/spots/node:${uniqueId}`);

    assertEqual(deleteResponse.status, 200, 'Löschen sollte 200 zurückgeben');
    assertEqual(deleteResponse.body.message, 'Spot removed from favorites successfully', 'Delete Success-Message');
});

runner.test('Logout - Session beenden', async () => {
    const uniqueId = Date.now();
    const testUser = {
        username: `logouttest_${uniqueId}`,
        email: `logouttest_${uniqueId}@example.com`,
        password: 'testpassword123',
    };

    const agent = request.agent(runner.app);

    // Registrieren (auto-login)
    await agent.post('/api/auth/register').send(testUser);

    // Logout
    const logoutResponse = await agent.post('/api/auth/logout');

    assertEqual(logoutResponse.status, 200, 'Logout sollte 200 zurückgeben');
    assertEqual(logoutResponse.body.message, 'Erfolgreich ausgeloggt.', 'Logout Success-Message');

    // Nach Logout sollte Auth fehlschlagen
    const spotsResponse = await agent.get('/api/spots');
    assertEqual(spotsResponse.status, 401, 'Nach Logout sollte Auth fehlschlagen');
});

// Tests ausführen
runner.run().catch((e: unknown) => {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`Fataler Fehler: ${msg}`);
    process.exit(1);
});
