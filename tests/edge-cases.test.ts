import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/edge-cases');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Edge Cases and Error Handling', () => {
    test('handles component errors gracefully', async () => {
        await page.click('#trigger-component-error-btn');

        await page.waitForFunction(() => {
            const errorBoundary = document.querySelector('.error-boundary');
            return errorBoundary && errorBoundary.textContent.includes('Intentional error');
        });

        const errorText = await page.$eval('.error-boundary', el => el.textContent);
        expect(errorText).toContain('Intentional error in component');

        // Framework should still be functional
        await page.click('#trigger-component-error-btn'); // Turn off error

        await page.waitForSelector('#error-throwing-component');
        const normalText = await page.$eval('#error-throwing-component', el => el.textContent);
        expect(normalText).toBe('No error thrown');
    });

    test('handles null and undefined components', async () => {
        await page.click('#toggle-null-component-btn');
        await page.waitForSelector('#null-component', { hidden: true });

        expect(await page.$('#null-component')).toBeNull();

        await page.click('#toggle-null-component-btn');
        await page.waitForSelector('#null-component');

        expect(await page.$('#null-component')).toBeTruthy();

        // Same for undefined
        await page.click('#toggle-undefined-component-btn');
        await page.waitForSelector('#undefined-component', { hidden: true });

        expect(await page.$('#undefined-component')).toBeNull();
    });

    test('handles invalid data types', async () => {
        // Test invalid element type
        await page.click('#toggle-invalid-type-btn');

        // Should either handle gracefully or show error boundary
        await page.waitForFunction(() => {
            const component = document.querySelector('#invalid-type-component');
            const errorBoundary = document.querySelector('.error-boundary');
            return component || errorBoundary;
        });

        // Framework should still be responsive
        await page.click('#toggle-invalid-type-btn');
        await page.waitForSelector('#invalid-type-component');

        const validText = await page.$eval('#invalid-type-component', el => el.textContent);
        expect(validText).toBe('Valid type');
    });

    test('handles async operations correctly', async () => {
        await page.click('#trigger-async-component-btn');
        await page.waitForSelector('#async-component');

        const initialText = await page.$eval('#async-component', el => el.textContent);
        expect(initialText).toBe('Waiting for async update...');

        // Wait for async update
        await page.waitForFunction(() => {
            const component = document.querySelector('#async-component');
            return component && component.textContent.includes('completed');
        }, { timeout: 5000 });

        const updatedText = await page.$eval('#async-component', el => el.textContent);
        expect(updatedText).toBe('Async update completed');
    });

    test('survives external DOM manipulation', async () => {
        await page.click('#trigger-external-dom-btn');
        await page.waitForSelector('#external-dom-component');

        const initialText = await page.$eval('#external-dom-component', el => el.textContent);
        expect(initialText).toBe('Original content');

        // Wait for external manipulation
        await page.waitForFunction(() => {
            const component = document.querySelector('#external-dom-component');
            return component && component.textContent.includes('Externally modified');
        }, { timeout: 1000 });

        // Framework should still be functional after external changes
        await page.click('#trigger-external-dom-btn'); // Toggle off and on
        await page.click('#trigger-external-dom-btn');

        await page.waitForSelector('#external-dom-component');
        expect(await page.$('#external-dom-component')).toBeTruthy();
    });
});
