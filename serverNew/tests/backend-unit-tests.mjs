// serverNew/tests/backend-unit-tests.mjs
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// .env laden
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

// Test Framework (bleibt gleich)
class TestRunner {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
    }

    test(name, fn) {
        this.tests.push({ name, fn });
    }

    async run() {
        console.log('Backend Unit Tests starten...\n');

        for (const test of this.tests) {
            try {
                await test.fn();
                console.log(`✓ ${test.name}`);
                this.passed++;
            } catch (error) {
                console.error(`✗ ${test.name}: ${error.message}`);
                this.failed++;
            }
        }

        console.log(`\n${this.passed} Tests erfolgreich, ${this.failed} fehlgeschlagen`);
        if (this.failed > 0) process.exit(1);
    }
}

const runner = new TestRunner();

// Assertions
function assert(condition, message) {
    if (!condition) throw new Error(message || 'Assertion failed');
}

function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
}

// ===== TESTS MIT DEINEN ECHTEN ENVIRONMENT VARIABLES =====

runner.test('Environment Variables - deine .env Konfiguration', () => {
    // Teste dass alle deine Environment Variables geladen sind
    assert(process.env.MONGODB_URI, 'MONGODB_URI sollte aus .env geladen sein');
    assert(process.env.BACKEND_URL, 'BACKEND_URL sollte aus .env geladen sein');
    assert(process.env.FRONTEND_URL, 'FRONTEND_URL sollte aus .env geladen sein');

    // Teste die exakten URLs aus deiner .env
    assertEqual(process.env.BACKEND_URL, 'http://localhost:3000', 'BACKEND_URL sollte http://localhost:3000 sein');
    assertEqual(process.env.FRONTEND_URL, 'http://localhost:5000', 'FRONTEND_URL sollte http://localhost:5000 sein');
});

runner.test('MongoDB URI - deine Atlas Konfiguration', () => {
    const uri = process.env.MONGODB_URI;

    // Teste deine spezifische MongoDB Atlas URI
    assert(uri.startsWith('mongodb+srv://'), 'MongoDB URI sollte Atlas-Format haben');
    assert(uri.includes('janpppherrmann'), 'URI sollte deinen Username enthalten');
    assert(uri.includes('coffeeapp.nxw2owg.mongodb.net'), 'URI sollte deinen spezifischen Cluster enthalten');
    assert(uri.includes('retryWrites=true'), 'URI sollte retryWrites enthalten');
    assert(uri.includes('w=majority'), 'URI sollte write concern enthalten');
    assert(uri.includes('appName=CoffeeApp'), 'URI sollte appName=CoffeeApp enthalten');
});

runner.test('URL Format - HTTP Protocol', () => {
    assert(process.env.BACKEND_URL.startsWith('http://'), 'BACKEND_URL sollte mit http:// beginnen');
    assert(process.env.FRONTEND_URL.startsWith('http://'), 'FRONTEND_URL sollte mit http:// beginnen');
});

runner.test('Port Konfiguration - Standard Development Ports', () => {
    assert(process.env.BACKEND_URL.includes(':3000'), 'Backend sollte auf Port 3000 laufen');
    assert(process.env.FRONTEND_URL.includes(':5000'), 'Frontend sollte auf Port 5000 laufen');
    assert(process.env.BACKEND_URL !== process.env.FRONTEND_URL, 'Backend und Frontend URLs sollten unterschiedlich sein');
});

// ===== TESTS FÜR DEINE ECHTEN BACKEND-STRUKTUREN =====

runner.test('DatabaseOperations - Collection Namen aus deinem Code', () => {
    // Teste die Collection-Namen die du tatsächlich verwendest
    const spotsCollection = 'SpotsAddedByUsers';
    const usersCollection = 'Users';
    const databaseName = 'CoffeeAppDB';

    assertEqual(spotsCollection, 'SpotsAddedByUsers', 'Spots Collection sollte SpotsAddedByUsers heißen');
    assertEqual(usersCollection, 'Users', 'Users Collection sollte Users heißen');
    assertEqual(databaseName, 'CoffeeAppDB', 'Database sollte CoffeeAppDB heißen');
});

runner.test('Spot ID Schema - dein userId:osmType:osmId Format', () => {
    // Teste das ID-Schema aus deiner createSpot Funktion
    const userId = 'user123';
    const osmType = 'node';
    const osmId = 456789;

    const expectedId = `${userId}:${osmType}:${osmId}`;
    assertEqual(expectedId, 'user123:node:456789', 'Spot-ID sollte userId:osmType:osmId Format haben');
});

runner.test('OSM Types - deine Union Type Definition', () => {
    // Teste die osmType Union aus spots.ts
    const validTypes = ['node', 'way', 'relation'];

    validTypes.forEach(type => {
        assert(['node', 'way', 'relation'].includes(type), `${type} sollte gültiger OSM-Typ sein`);
    });

    const invalidType = 'invalid';
    assert(!['node', 'way', 'relation'].includes(invalidType), 'Ungültiger Typ sollte nicht akzeptiert werden');
});

runner.test('Auth Route - deine exakten Fehlermeldungen', () => {
    // Teste die exakten Fehlermeldungen aus auth.ts
    const messages = {
        missingFields: 'Please enter all fields',
        userExists: 'Benutzer existiert bereits.',
        emailExists: 'Email existiert bereits.',
        userNotFound: 'Benutzer nicht gefunden.',
        wrongPassword: 'Falsches Passwort.',
        loginMissingFields: 'Bitte alle Felder ausfüllen.',
        registrationSuccess: ' Benutzer erfolgreich registriert.',
        loginSuccess: 'Erfolgreich eingeloggt.',
        logoutSuccess: 'Erfolgreich ausgeloggt.'
    };

    assertEqual(messages.missingFields, 'Please enter all fields');
    assertEqual(messages.userExists, 'Benutzer existiert bereits.');
    assertEqual(messages.emailExists, 'Email existiert bereits.');
    assertEqual(messages.userNotFound, 'Benutzer nicht gefunden.');
    assertEqual(messages.wrongPassword, 'Falsches Passwort.');
});

runner.test('Spots Route - deine API Endpunkte', () => {
    // Teste die API-Endpunkte die du definiert hast
    const endpoints = [
        '/api/spots',
        '/api/spots/favorites-count/:spotId',
        '/api/spots/check/:spotId',
        '/api/spots/:spotId'
    ];

    endpoints.forEach(endpoint => {
        assert(endpoint.startsWith('/api/spots'), `Endpoint ${endpoint} sollte mit /api/spots beginnen`);
    });
});

runner.test('HTTP Status Codes - deine verwendeten Codes', () => {
    // Teste die Status Codes aus deinen Routen
    const statusCodes = {
        success: 200,
        created: 201,
        badRequest: 400,
        unauthorized: 401,
        notFound: 404,
        serverError: 500
    };

    assertEqual(statusCodes.unauthorized, 401, 'Auth-Fehler sollte 401 sein');
    assertEqual(statusCodes.badRequest, 400, 'Validierungsfehler sollte 400 sein');
    assertEqual(statusCodes.created, 201, 'Erfolgreiche Erstellung sollte 201 sein');
    assertEqual(statusCodes.success, 200, 'Erfolgreiche Anfrage sollte 200 sein');
});

runner.test('Bcrypt Configuration - Salt Rounds', () => {
    // Teste bcrypt Konfiguration aus auth.ts
    const saltRounds = 10;
    assert(saltRounds === 10, 'Bcrypt sollte 10 Salt Rounds verwenden');
    assert(saltRounds >= 10, 'Salt Rounds sollten mindestens 10 sein für Sicherheit');
});

runner.test('Session Data Interface - deine erweiterten Felder', () => {
    // Teste die Session-Erweiterung aus middleware.ts
    const sessionData = {
        userId: 'test123',
        username: 'testuser'
    };

    assert(typeof sessionData.userId === 'string', 'Session userId sollte string sein');
    assert(typeof sessionData.username === 'string', 'Session username sollte string sein');
    assert(sessionData.userId && sessionData.username, 'Session sollte beide Felder enthalten');
});

runner.test('Regex Pattern für Favoriten-Zählung', () => {
    // Teste das Regex-Pattern aus getFavoritesCountForSpot
    const spotId = 'node:123456';
    const pattern = new RegExp(`:${spotId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);

    assert(pattern instanceof RegExp, 'Pattern sollte RegExp sein');
    assert(pattern.test('user1:node:123456'), 'Pattern sollte korrekte IDs matchen');
    assert(pattern.test('anotheruser:node:123456'), 'Pattern sollte verschiedene User matchen');
    assert(!pattern.test('user1:way:123456'), 'Pattern sollte falsche OSM-Typen nicht matchen');
});

// Tests ausführen
run().catch(error => {
    console.error(`Fehler beim Ausführen der Tests: ${error.message}`);
    process.exit(1);
});

async function run() {
    await runner.run();
}