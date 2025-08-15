// serverNew/tests/backend-unit-tests.mjs
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// .env laden
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

// Test Framework
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

// ===== HELPER FUNCTIONS TO TEST (aus deinem Code abgeleitet) =====

// Spots Route Logic
function validateSpotData(osmType, osmId, elementLat, elementLng, name, amenity) {
    if (!osmType || !osmId || !elementLat || !elementLng || !name || !amenity) {
        return { valid: false, message: 'Missing required fields' };
    }

    const validOsmTypes = ['node', 'way', 'relation'];
    if (!validOsmTypes.includes(osmType)) {
        return { valid: false, message: 'Invalid OSM type' };
    }

    if (typeof elementLat !== 'number' || typeof elementLng !== 'number') {
        return { valid: false, message: 'Coordinates must be numbers' };
    }

    if (elementLat < -90 || elementLat > 90 || elementLng < -180 || elementLng > 180) {
        return { valid: false, message: 'Invalid coordinates range' };
    }

    return { valid: true };
}

// Auth Route Logic
function validateRegistrationData(username, email, password) {
    if (!username || !email || !password) {
        return { valid: false, message: 'Please enter all fields' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Invalid email format' };
    }

    if (username.length < 3) {
        return { valid: false, message: 'Username must be at least 3 characters' };
    }

    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }

    return { valid: true };
}

// Database ID Generation (aus databaseOperations.ts)
function generateSpotId(userId, osmType, osmId) {
    return `${userId}:${osmType}:${osmId}`;
}

function parseSpotIdPattern(spotId) {
    // Escape special regex characters for pattern matching
    return new RegExp(`:${spotId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

// ===== UNIT TESTS FÜR SPOTS ROUTE LOGIC =====

runner.test('validateSpotData - gültige Spot-Daten', () => {
    const result = validateSpotData('node', 123, 48.1351, 11.5820, 'Test Café', 'cafe');
    assert(result.valid, 'Gültige Spot-Daten sollten validiert werden');
});

runner.test('validateSpotData - fehlende Pflichtfelder', () => {
    const result = validateSpotData(null, 123, 48.1351, 11.5820, 'Test Café', 'cafe');
    assert(!result.valid, 'Fehlende Felder sollten Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Missing required fields');
});

runner.test('validateSpotData - ungültiger OSM-Typ', () => {
    const result = validateSpotData('invalid', 123, 48.1351, 11.5820, 'Test Café', 'cafe');
    assert(!result.valid, 'Ungültiger OSM-Typ sollte Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Invalid OSM type');
});

runner.test('validateSpotData - ungültige Koordinaten', () => {
    const result = validateSpotData('node', 123, 91, 181, 'Test Café', 'cafe');
    assert(!result.valid, 'Ungültige Koordinaten sollten Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Invalid coordinates range');
});

runner.test('validateSpotData - Koordinaten als String', () => {
    const result = validateSpotData('node', 123, '48.1351', '11.5820', 'Test Café', 'cafe');
    assert(!result.valid, 'String-Koordinaten sollten Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Coordinates must be numbers');
});

// ===== UNIT TESTS FÜR AUTH ROUTE LOGIC =====

runner.test('validateRegistrationData - gültige Registrierungsdaten', () => {
    const result = validateRegistrationData('testuser', 'test@example.com', 'password123');
    assert(result.valid, 'Gültige Registrierungsdaten sollten validiert werden');
});

runner.test('validateRegistrationData - fehlende Felder', () => {
    const result = validateRegistrationData('', 'test@example.com', 'password123');
    assert(!result.valid, 'Fehlende Felder sollten Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Please enter all fields');
});

runner.test('validateRegistrationData - ungültige Email', () => {
    const result = validateRegistrationData('testuser', 'invalid-email', 'password123');
    assert(!result.valid, 'Ungültige Email sollte Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Invalid email format');
});

runner.test('validateRegistrationData - zu kurzer Username', () => {
    const result = validateRegistrationData('ab', 'test@example.com', 'password123');
    assert(!result.valid, 'Zu kurzer Username sollte Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Username must be at least 3 characters');
});

runner.test('validateRegistrationData - zu kurzes Passwort', () => {
    const result = validateRegistrationData('testuser', 'test@example.com', '123');
    assert(!result.valid, 'Zu kurzes Passwort sollte Validierung fehlschlagen lassen');
    assertEqual(result.message, 'Password must be at least 6 characters');
});

// ===== UNIT TESTS FÜR DATABASE OPERATIONS LOGIC =====

runner.test('generateSpotId - korrekte ID-Generierung', () => {
    const spotId = generateSpotId('user123', 'node', 456789);
    assertEqual(spotId, 'user123:node:456789', 'Spot-ID sollte korrekt generiert werden');
});

runner.test('parseSpotIdPattern - Regex-Pattern für Spot-Suche', () => {
    const pattern = parseSpotIdPattern('node:123456');
    assert(pattern instanceof RegExp, 'Pattern sollte RegExp sein');

    // Test ob Pattern korrekt matcht
    assert(pattern.test('user1:node:123456'), 'Pattern sollte vollständige ID matchen');
    assert(pattern.test('anotheruser:node:123456'), 'Pattern sollte verschiedene User-IDs matchen');
    assert(!pattern.test('user1:way:123456'), 'Pattern sollte verschiedene OSM-Typen nicht matchen');
    assert(!pattern.test('user1:node:654321'), 'Pattern sollte verschiedene OSM-IDs nicht matchen');
});

// ===== ENVIRONMENT & CONFIGURATION TESTS =====

runner.test('Environment Variables - vollständige Konfiguration', () => {
    assert(process.env.MONGODB_URI, 'MONGODB_URI sollte gesetzt sein');
    assert(process.env.BACKEND_URL, 'BACKEND_URL sollte gesetzt sein');
    assert(process.env.FRONTEND_URL, 'FRONTEND_URL sollte gesetzt sein');

    assert(process.env.BACKEND_URL.startsWith('http'), 'BACKEND_URL sollte mit http beginnen');
    assert(process.env.FRONTEND_URL.startsWith('http'), 'FRONTEND_URL sollte mit http beginnen');
});

runner.test('MongoDB URI - CoffeeApp Konfiguration', () => {
    const uri = process.env.MONGODB_URI;
    assert(uri.startsWith('mongodb+srv://'), 'MongoDB URI sollte Atlas-Format haben');
    assert(uri.includes('coffeeapp'), 'URI sollte CoffeeApp Cluster enthalten');
    assert(uri.includes('retryWrites=true'), 'URI sollte retryWrites enthalten');
    assert(uri.includes('w=majority'), 'URI sollte write concern enthalten');
});

runner.test('Backend/Frontend URL - Port-Konfiguration', () => {
    const backendUrl = process.env.BACKEND_URL;
    const frontendUrl = process.env.FRONTEND_URL;

    assert(backendUrl.includes(':3000'), 'Backend sollte auf Port 3000 laufen');
    assert(frontendUrl.includes(':5000'), 'Frontend sollte auf Port 5000 laufen');
    assert(backendUrl !== frontendUrl, 'Backend und Frontend sollten verschiedene URLs haben');
});

// Tests ausführen
run().catch(error => {
    console.error(`Fehler beim Ausführen der Tests: ${error.message}`);
    process.exit(1);
});

async function run() {
    await runner.run();
}