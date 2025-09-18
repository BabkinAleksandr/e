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

    await page.evaluate(() => {
        // consoles causing huge performance deterioration
        // commenting it for now, but TODO: remove this when production build is ready
        console.group = () => void 0
        console.groupEnd = () => void 0
        console.log = () => void 0
        console.info = () => void 0
    })
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
        });

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
        });

        await page.click('#stop-memory-test-btn');

        // Page should still be responsive
        await page.click('#force-gc-btn');

        await assertResponsiveness()
    });

    test('deep nesting handles extreme levels', async () => {
        await page.click('#max-nesting-btn');
        await page.waitForSelector('#deep-nesting-container [data-level="49"]')

        // Should still be able to interact with nested elements
        await page.click('[data-level="25"]');
        await assertResponsiveness()
    });

    test('rapid state changes maintain stability', async () => {
        await page.click('#start-rapid-changes-btn');

        // while rapid changes running, other parts of app should be responsive
        // that's what we're checking here

        await assertResponsiveness()
        await assertResponsiveness()
        await assertResponsiveness()

        // Framework should still be functional
        await page.click('#instant-stress-btn');
        await page.waitForFunction(() => {
            const container = document.querySelector('#stress-test-container');
            return container && container.children.length >= 500;
        });

        await page.waitForFunction(() => {
            const counter = document.querySelector('#rapid-change-counter');
            return counter && parseInt(counter.textContent.match(/\d+/)[0]) >= 100
        });

        await page.click('#stop-rapid-changes-btn');
    });

    test('large dataset operations perform adequately', async () => {
        const startTime = Date.now();

        await page.click('#create-large-dataset-btn');

        await page.waitForFunction(() => {
            const sizeStatus = document.querySelector('#large-dataset-size').textContent
            return sizeStatus.startsWith('Dataset Size: 10000')
        });

        const creationTime = Date.now() - startTime;
        // Should create within 100ms
        // but it's very relative number and depends on machine runnig the test
        expect(creationTime).toBeLessThanOrEqual(100);

        // Test shuffle performance
        const initialOrder = await page.$$eval('#large-dataset-container div', (els) => els.map(el => el.textContent))
        const shuffleStart = Date.now();
        await page.click('#shuffle-large-dataset-btn');
        await page.waitForFunction((length, first, last) => {
            const container = document.querySelector('#large-dataset-container')
            return container
                && container.children.length === length
                && container.children[0].textContent !== first
                && container.children[container.children.length - 1].textContent !== last
        }, undefined, initialOrder.length, initialOrder[0], initialOrder[initialOrder.length - 1])
        const shuffleTime = Date.now() - shuffleStart;

        expect(shuffleTime).toBeLessThan(100); // Should shuffle within 100 ms

        // Verify display still works
        const displayedItems = await page.$$eval('#large-dataset-container .stress-item', els => els.length);
        expect(displayedItems).toBe(100); // Should show first 100
        await assertResponsiveness()
    });
});

async function assertResponsiveness() {
    const initialValue = await page.$eval('div#responsiveness-value', (el) => el.textContent)
    await page.click('#update-responsive-state')
    await page.waitForFunction((initial) => {
        const elem = document.querySelector('div#responsiveness-value')
        return elem.textContent !== initial
    }, undefined, initialValue)

    expect(await page.$eval('div#responsiveness-value', (el) => el.textContent)).not.toBe(initialValue)
}
