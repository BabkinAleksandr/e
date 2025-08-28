import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/memory-performance');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Memory and Performance Tests', () => {
    test('stress test with many components', async () => {
        await page.click('#instant-stress-btn');

        await page.waitForFunction(() => {
            const container = document.querySelector('#stress-test-container');
            return container && container.children.length >= 500;
        }, { timeout: 10000 });

        const componentCount = await page.$$eval('#stress-test-container .stress-item', els => els.length);
        expect(componentCount).toBe(500);

        // Test that components are still interactive
        await page.click('#stress-item-0');
        await page.hover('#stress-item-1');

        // Performance should still be reasonable
        const performanceTime = await page.evaluate(() => {
            const start = performance.now();
            (document.querySelector('#stress-item-100') as HTMLElement).click();
            return performance.now() - start;
        });

        expect(performanceTime).toBeLessThan(10); // Should be fast
        await assertResponsiveness()
    });

    test('memory leak test completes without crashing', async () => {
        await page.click('#start-memory-test-btn');

        // Wait for several cycles
        await page.waitForFunction(() => {
            const cycles = document.querySelector('#memory-test-cycles');
            return cycles && parseInt(cycles.textContent.match(/\d+/)[0]) >= 10;
        }, { timeout: 20000 });

        await page.click('#stop-memory-test-btn');

        // Page should still be responsive
        await page.click('#force-gc-btn');

        await assertResponsiveness()
    });

    test('deep nesting handles extreme levels', async () => {
        await page.click('#max-nesting-btn');

        await page.waitForFunction(() => {
            const container = document.querySelector('#deep-nesting-container');
            return container && container.querySelector('[data-level="49"]');
        }, { timeout: 5000 });

        const deepestLevel = await page.$eval('div[data-level="49"]', el => el.dataset.level);
        expect(parseInt(deepestLevel)).toBe(49);

        // Should still be able to interact with nested elements
        await page.click('[data-level="25"]');
        await assertResponsiveness()
    });

    test('rapid state changes maintain stability', async () => {
        await page.click('#start-rapid-changes-btn');

        // Let it run for a bit
        await page.waitForFunction(() => {
            const counter = document.querySelector('#rapid-change-counter');
            return counter && parseInt(counter.textContent.match(/\d+/)[0]) >= 50;
        }, { timeout: 10000 });

        await page.click('#stop-rapid-changes-btn');

        // Framework should still be functional
        await page.click('#instant-stress-btn');

        const componentCount = await page.$$eval('#stress-test-container .stress-item', els => els.length);
        expect(componentCount).toBeGreaterThan(0);
        await assertResponsiveness()
    });

    test('large dataset operations perform adequately', async () => {
        const startTime = Date.now();

        await page.click('#create-large-dataset-btn');

        await page.waitForFunction(() => {
            const sizeStatus = document.querySelector('#large-dataset-size').textContent
            return sizeStatus.startsWith('Dataset Size: 10000')
        }, { timeout: 15000 });

        const creationTime = Date.now() - startTime;
        expect(creationTime).toBeLessThanOrEqual(200); // Should create within 200 ms

        // Test shuffle performance
        const shuffleStart = Date.now();
        await page.click('#shuffle-large-dataset-btn');
        await page.waitForFunction(() => true, {}, 1000); // Wait for shuffle
        const shuffleTime = Date.now() - shuffleStart;

        expect(shuffleTime).toBeLessThan(5000); // Should shuffle within 5 seconds

        // Verify display still works
        const displayedItems = await page.$$eval('#large-dataset-container .stress-item', els => els.length);
        expect(displayedItems).toBe(100); // Should show first 100
        await assertResponsiveness()
    });
});

async function assertResponsiveness() {
    const initialValue = await page.$eval('div#responsiveness-value', (el) => el.textContent)
    await page.click('#update-responsive-state')
    expect(await page.$eval('div#responsiveness-value', (el) => el.textContent)).not.toBe(initialValue)
}
