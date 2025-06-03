import { beforeAll, afterAll } from 'bun:test'
import puppeteer, { Browser } from 'puppeteer';
import { startServer } from './server';

declare global {
    var __E2E_SERVER__: Bun.Server | undefined;
    var __E2E_BROWSER__: Browser | undefined;
}

beforeAll(async () => {
    console.log('Global setup: Starting server and Puppeteer browser...');
    global.__E2E_SERVER__ = await startServer();
    global.__E2E_BROWSER__ = await puppeteer.launch();
    console.log('Global setup: Server and browser started.');
})

afterAll(async () => {
    console.log('Global teardown: Stopping server and Puppeteer browser...');
    if (global.__E2E_BROWSER__) {
        await global.__E2E_BROWSER__.close();
    }
    if (global.__E2E_SERVER__) {
        await global.__E2E_SERVER__.stop();
    }
    console.log('Global teardown: Server and browser stopped.');
})
