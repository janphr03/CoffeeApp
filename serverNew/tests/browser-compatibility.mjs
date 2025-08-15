// serverNew/tests/browser-compatibility.mjs
import { chromium, firefox, webkit } from 'playwright';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// .env aus serverNew laden
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

// BASE_URL bevorzugt, sonst FRONTEND_URL aus .env, sonst Default
const BASE_URL = process.env.BASE_URL || process.env.FRONTEND_URL || 'http://localhost:5000';
const TIMEOUT = 15_000;

const browsers = [
    { name: 'chromium', launcher: chromium },
    { name: 'firefox', launcher: firefox },
    { name: 'webkit', launcher: webkit },
];

async function checkStart(page) {
    const resp = await page.goto(BASE_URL, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
    if (!resp || !resp.ok()) throw new Error(`Startseite HTTP ${resp ? resp.status() : 'no response'}`);
    const title = await page.title();
    if (!title || !title.trim()) throw new Error('Seitentitel leer');
}

async function checkMap(page) {
    const resp = await page.goto(`${BASE_URL}/map`, { timeout: TIMEOUT, waitUntil: 'domcontentloaded' });
    if (!resp || !resp.ok()) throw new Error(`Map-Seite HTTP ${resp ? resp.status() : 'no response'}`);
    await page.waitForSelector('.leaflet-container', { timeout: TIMEOUT, state: 'visible' });
}

async function run() {
    let failed = false;

    for (const b of browsers) {
        console.log(`\n[${b.name}] Starte Tests gegen ${BASE_URL}...`);
        const browser = await b.launcher.launch();
        const context = await browser.newContext();
        const page = await context.newPage();

        try {
            await checkStart(page);
            console.log(`[${b.name}] Startseite OK`);

            await checkMap(page);
            console.log(`[${b.name}] Map-Seite OK`);
        } catch (err) {
            failed = true;
            console.error(`[${b.name}] FEHLER: ${err.message || err}`);
        } finally {
            await context.close();
            await browser.close();
        }
    }

    if (failed) {
        console.error('\nMindestens ein Browser-Test ist fehlgeschlagen.');
        process.exit(1);
    } else {
        console.log('\nAlle Browser-Tests erfolgreich.');
    }
}

run().catch((e) => {
    console.error(`Unerwarteter Fehler: ${e.message || e}`);
    process.exit(1);
});