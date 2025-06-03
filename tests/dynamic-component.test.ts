import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/dynamic-component');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Dynamic Component Behavior Tests', () => {
    describe('Component Appearance and Disappearance', () => {
        test('component appears when condition becomes true', async () => {
            // Initially component should not exist
            expect(await page.$('#conditional-component')).toBeNull();

            // Click button to show component
            await page.click('#show-component-btn');
            await page.waitForSelector('#conditional-component');

            expect(await page.$('#conditional-component')).toBeTruthy();

            const content = await page.$eval('#conditional-component', el => el.textContent);
            expect(content).toBe('I am a conditional component');
        });

        test('component disappears when condition becomes false', async () => {
            // Ensure component is visible first
            await page.click('#show-component-btn');
            await page.waitForSelector('#conditional-component');

            expect(await page.$('#conditional-component')).toBeTruthy();

            // Hide component
            await page.click('#hide-component-btn');
            await page.waitForSelector('#conditional-component', { hidden: true });

            expect(await page.$('#conditional-component')).toBeNull();
        });

        test('component can toggle multiple times', async () => {
            for (let i = 0; i < 3; i++) {
                // Show component
                await page.click('#show-component-btn');
                await page.waitForSelector('#conditional-component');

                expect(await page.$('#conditional-component')).toBeTruthy();

                // Hide component
                await page.click('#hide-component-btn');
                await page.waitForSelector('#conditional-component', { hidden: true });

                expect(await page.$('#conditional-component')).toBeNull();
            }
        });
    });

    describe('Order Preservation', () => {
        test('component appears in correct position among siblings', async () => {
            // Get initial order
            const getOrder = async () => {
                const container = await page.$('#order-test-container');
                const children = await container.$$eval('div', els =>
                    els.map(el => el.id).filter(id => id)
                );
                return children;
            };

            expect(await getOrder()).toEqual(['first-component', 'third-component']);

            // Show middle component
            await page.click('#show-middle-btn');
            await page.waitForSelector('#second-component');

            expect(await getOrder()).toEqual(['first-component', 'second-component', 'third-component']);

            // Hide middle component
            await page.click('#hide-middle-btn');
            await page.waitForSelector('#second-component', { hidden: true });

            expect(await getOrder()).toEqual(['first-component', 'third-component']);
        });

        test('multiple conditional components maintain correct order', async () => {
            const getOrder = async () => {
                const container = await page.$('#multi-conditional-container');
                const children = await container.$$eval('div', els =>
                    els.map(el => el.id).filter(id => id)
                );
                return children;
            };

            // Initially only static components
            expect(await getOrder()).toEqual(['static-1', 'static-3']);

            // Show first conditional
            await page.click('#show-cond-1-btn');
            await page.waitForSelector('#conditional-1');

            expect(await getOrder()).toEqual(['static-1', 'conditional-1', 'static-3']);

            // Show second conditional
            await page.click('#show-cond-2-btn');
            await page.waitForSelector('#conditional-2');

            expect(await getOrder()).toEqual(['static-1', 'conditional-1', 'conditional-2', 'static-3']);

            // Hide first conditional
            await page.click('#hide-cond-1-btn');
            await page.waitForSelector('#conditional-1', { hidden: true });

            expect(await getOrder()).toEqual(['static-1', 'conditional-2', 'static-3']);

            // Show first conditional again
            await page.click('#show-cond-1-btn');
            await page.waitForSelector('#conditional-1');

            expect(await getOrder()).toEqual(['static-1', 'conditional-1', 'conditional-2', 'static-3']);
        });

        test('nested conditional components preserve order', async () => {
            const getNestedOrder = async () => {
                const container = await page.$('#nested-container');
                const children = await container.$$eval('*', els =>
                    els.map(el => el.id).filter(id => id && id.includes('nested'))
                );
                return children;
            };

            // Show parent
            await page.click('#show-nested-parent-btn');
            await page.waitForSelector('#nested-parent');

            expect(await getNestedOrder()).toEqual(['nested-parent', 'nested-static']);

            // Show nested child
            await page.click('#show-nested-child-btn');
            await page.waitForSelector('#nested-child');

            expect(await getNestedOrder()).toEqual(['nested-parent', 'nested-static', 'nested-child']);

            // Hide parent (should hide child too)
            await page.click('#hide-nested-parent-btn');
            await page.waitForSelector('#nested-parent', { hidden: true });

            expect(await getNestedOrder()).toEqual([]);

            // Show parent again
            await page.click('#show-nested-parent-btn');
            await page.waitForSelector('#nested-parent');

            expect(await getNestedOrder()).toEqual(['nested-parent', 'nested-static', 'nested-child']);
        });
    });

    describe('Sibling Attribute Preservation', () => {
        test('sibling attributes remain unchanged when component appears', async () => {
            // Get initial sibling attributes
            const getSiblingAttrs = async () => {
                const sibling1 = await page.$('#sibling-1');
                const sibling2 = await page.$('#sibling-2');

                const attrs1 = await sibling1.evaluate(el => ({
                    className: el.className,
                    style: el.style.cssText,
                    textContent: el.textContent
                }));

                const attrs2 = await sibling2.evaluate(el => ({
                    className: el.className,
                    style: el.style.cssText,
                    textContent: el.textContent
                }));

                return { sibling1: attrs1, sibling2: attrs2 };
            };

            const initialAttrs = await getSiblingAttrs();

            // Show conditional component between siblings
            await page.click('#show-between-siblings-btn');
            await page.waitForSelector('#between-siblings');

            expect(await getSiblingAttrs()).toEqual(initialAttrs);

            // Hide component
            await page.click('#hide-between-siblings-btn');
            await page.waitForSelector('#between-siblings', { hidden: true });

            expect(await getSiblingAttrs()).toEqual(initialAttrs);
        });

        test('sibling event handlers remain functional', async () => {
            // Test that sibling click handlers still work
            await page.click('#clickable-sibling-1');
            await page.waitForSelector('#click-result-1');

            expect(await page.$eval('#click-result-1', el => el.textContent)).toBe('Sibling 1 clicked');

            // Show conditional component
            await page.click('#show-between-clickable-btn');
            await page.waitForSelector('#between-clickable');

            // Test siblings still work
            await page.click('#clickable-sibling-2');
            await page.waitForSelector('#click-result-2');

            expect(await page.$eval('#click-result-2', el => el.textContent)).toBe('Sibling 2 clicked');

            // Hide component and test again
            await page.click('#hide-between-clickable-btn');
            await page.waitForSelector('#between-clickable', { hidden: true });

            await page.click('#reset-click-results-btn');
            await page.waitForSelector('#click-result-1', { hidden: true });
            await page.waitForSelector('#click-result-2', { hidden: true });

            await page.click('#clickable-sibling-1');
            await page.waitForSelector('#click-result-1');

            expect(await page.$eval('#click-result-1', el => el.textContent)).toBe('Sibling 1 clicked');
        });

        test('sibling form inputs maintain state', async () => {
            // Set values in sibling inputs
            await page.type('#input-before', 'Before value');
            await page.type('#input-after', 'After value');

            // Verify initial values
            expect(await page.$eval('#input-before', el => el.value)).toBe('Before value');
            expect(await page.$eval('#input-after', el => el.value)).toBe('After value');

            // Show conditional component between inputs
            await page.click('#show-between-inputs-btn');
            await page.waitForSelector('#between-inputs');

            // Verify values preserved
            expect(await page.$eval('#input-before', el => el.value)).toBe('Before value');
            expect(await page.$eval('#input-after', el => el.value)).toBe('After value');

            // Hide component
            await page.click('#hide-between-inputs-btn');
            await page.waitForSelector('#between-inputs', { hidden: true });

            // Verify values still preserved
            expect(await page.$eval('#input-before', el => el.value)).toBe('Before value');
            expect(await page.$eval('#input-after', el => el.value)).toBe('After value');
        });
    });

    describe('Component Content Changes', () => {
        test('component content updates when switching between different components', async () => {
            // Show component A
            await page.click('#show-component-a-btn');
            await page.waitForSelector('#switchable-component');

            expect(await page.$eval('#switchable-component', el => el.textContent)).toBe('Component A Content');

            // Switch to component B
            await page.click('#show-component-b-btn');
            // Wait for content to change by checking the text
            await page.waitForFunction(() => {
                const element = document.querySelector('#switchable-component');
                return element && element.textContent === 'Component B Content';
            });

            expect(await page.$eval('#switchable-component', el => el.textContent)).toBe('Component B Content');

            // Switch back to component A
            await page.click('#show-component-a-btn');
            await page.waitForFunction(() => {
                const element = document.querySelector('#switchable-component');
                return element && element.textContent === 'Component A Content';
            });

            expect(await page.$eval('#switchable-component', el => el.textContent)).toBe('Component A Content');
        });

        test('component switches from element to text node', async () => {
            // Show element component
            await page.click('#show-element-btn');
            await page.waitForSelector('#text-or-element');

            const element = await page.$('#text-or-element');
            expect(await element.evaluate(el => el.tagName.toLowerCase())).toBe('div');

            // Switch to text
            await page.click('#show-text-btn');
            await page.waitForSelector('#text-or-element', { hidden: true });

            // Wait for text content to appear
            await page.waitForFunction(() => {
                const container = document.querySelector('#text-or-element-container');
                return container && container.textContent.includes('Just text content');
            });

            // Text nodes don't have selectors, check parent content
            const parentContent = await page.$eval('#text-or-element-container', el => {
                const textNodes = Array.from(el.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
                return textNodes.map(node => node.textContent.trim()).filter(text => text);
            });

            expect(parentContent).toContain('Just text content');
        });

        test('component switches from text node to element', async () => {
            // Ensure we start with text
            await page.click('#show-text-btn');
            await page.waitForSelector('#text-or-element', { hidden: true });

            // Switch to element
            await page.click('#show-element-btn');
            await page.waitForSelector('#text-or-element');

            expect(await page.$('#text-or-element')).toBeTruthy();

            expect(await page.$eval('#text-or-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#text-or-element', el => el.textContent)).toBe('Element content');
        });
    });

    describe('Complex Conditional Scenarios', () => {
        test('multiple conditions affecting same component position', async () => {
            const getComplexOrder = async () => {
                const container = await page.$('#complex-conditions-container');
                const children = await container.$$eval('div', els =>
                    els.map(el => el.id).filter(id => id)
                );
                return children;
            };

            // Initial state
            expect(await getComplexOrder()).toEqual(['complex-start', 'complex-end']);

            // Enable condition 1
            await page.click('#enable-condition-1-btn');
            await page.waitForSelector('#complex-cond-1');

            expect(await getComplexOrder()).toEqual(['complex-start', 'complex-cond-1', 'complex-end']);

            // Enable condition 2
            await page.click('#enable-condition-2-btn');
            await page.waitForSelector('#complex-cond-2');

            expect(await getComplexOrder()).toEqual(['complex-start', 'complex-cond-1', 'complex-cond-2', 'complex-end']);

            // Disable condition 1
            await page.click('#disable-condition-1-btn');
            await page.waitForSelector('#complex-cond-1', { hidden: true });

            expect(await getComplexOrder()).toEqual(['complex-start', 'complex-cond-2', 'complex-end']);

            // Enable condition 1 again
            await page.click('#enable-condition-1-btn');
            await page.waitForSelector('#complex-cond-1');

            expect(await getComplexOrder()).toEqual(['complex-start', 'complex-cond-1', 'complex-cond-2', 'complex-end']);
        });

        test('conditional components with dynamic attributes', async () => {
            // Show component with initial attributes
            await page.click('#show-dynamic-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-component');

            expect(await page.$eval('#dynamic-attrs-component', el => el.className)).toBe('initial-class');

            // Update attributes
            await page.click('#update-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-component.updated-class')

            expect(await page.$eval('#dynamic-attrs-component', el => el.className)).toBe('updated-class');

            // Hide and show again - should maintain updated attributes
            await page.click('#hide-dynamic-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-component', { hidden: true });

            await page.click('#show-dynamic-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-component');

            expect(await page.$eval('#dynamic-attrs-component', el => el.className)).toBe('updated-class');
        });

        test('rapid show/hide operations', async () => {
            // Perform rapid show/hide operations
            for (let i = 0; i < 5; i++) {
                await page.click('#rapid-show-btn');
                await page.waitForSelector('#rapid-component');

                await page.click('#rapid-hide-btn');
                await page.waitForSelector('#rapid-component', { hidden: true });
            }

            // Final show
            await page.click('#rapid-show-btn');
            await page.waitForSelector('#rapid-component');

            expect(await page.$('#rapid-component')).toBeTruthy();
            expect(await page.$eval('#rapid-component', el => el.textContent)).toBe('Rapid component');
        });
    });

    describe('Error Handling and Edge Cases', () => {
        test('component function returns null/undefined', async () => {
            // Show component that returns null
            await page.click('#show-null-component-btn');

            // Wait a bit and verify no component appears
            await page.waitForSelector('#null-component', { hidden: true })
            expect(await page.$('#null-component')).toBeNull();

            // Switch to valid component
            await page.click('#show-valid-from-null-btn');
            await page.waitForSelector('#valid-from-null');

            expect(await page.$('#valid-from-null')).toBeTruthy();
        });

        test.todo('component function throws error and recovers', async () => {
            // This would need error boundary handling in your framework
            // For now, test that other components continue to work

            await page.click('#show-stable-component-btn');
            await page.waitForSelector('#stable-component');

            expect(await page.$('#stable-component')).toBeTruthy();
            expect(await page.$eval('#stable-component', el => el.textContent)).toBe('Stable component');
        });

        test('deeply nested conditional components', async () => {
            const getDeepOrder = async () => {
                const container = await page.$('#deep-nesting-container');
                const allElements = await container.$$eval('*', els =>
                    els.map(el => el.id).filter(id => id && id.includes('deep'))
                );
                return allElements;
            };

            // Show level 1
            await page.click('#show-deep-1-btn');
            await page.waitForSelector('#deep-level-1');

            expect(await getDeepOrder()).toContain('deep-level-1');

            // Show level 2
            await page.click('#show-deep-2-btn');
            await page.waitForSelector('#deep-level-2');

            const orderWith2 = await getDeepOrder();
            expect(orderWith2).toContain('deep-level-1');
            expect(orderWith2).toContain('deep-level-2');

            // Show level 3
            await page.click('#show-deep-3-btn');
            await page.waitForSelector('#deep-level-3');

            const orderWith3 = await getDeepOrder();
            expect(orderWith3).toContain('deep-level-1');
            expect(orderWith3).toContain('deep-level-2');
            expect(orderWith3).toContain('deep-level-3');

            // Hide level 2 (should hide level 3 too)
            await page.click('#hide-deep-2-btn');
            await page.waitForSelector('#deep-level-2', { hidden: true });

            const orderAfterHide = await getDeepOrder();
            expect(orderAfterHide).toContain('deep-level-1');
            expect(orderAfterHide).not.toContain('deep-level-2');
            expect(orderAfterHide).not.toContain('deep-level-3');
        });
    });
});
