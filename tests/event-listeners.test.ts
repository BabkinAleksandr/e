import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/event-listeners');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Event Listener Update Tests', () => {
    const clearEventLog = async () => {
        await page.click('#clear-log-btn');
        await page.waitForFunction(() => {
            const log = document.querySelector('#event-log');
            return log && log.textContent.includes('Event Log:') && !log.textContent.includes('Click:');
        });
    };

    const getEventLogEntries = async () => {
        return await page.$$eval('#event-log div:not(:first-child):not(:last-child)', els =>
            els.map(el => el.textContent).filter(text => text.trim())
        );
    };

    describe('Component-Level Event Updates', () => {
        test('component appears with event handler', async () => {
            await clearEventLog();

            // Hide then show component
            await page.click('#hide-event-component-btn');
            await page.waitForSelector('#event-component', { hidden: true });

            await page.click('#show-event-component-btn');
            await page.waitForSelector('#event-component');

            // Test event handler works
            await page.click('#event-component');

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: component'))).toBe(true);
        });

        test('component event type changes', async () => {
            await clearEventLog();

            // Start with click event
            await page.click('#set-click-event-btn');
            await page.waitForSelector('#event-component');

            await page.click('#event-component');
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: component'))).toBe(true);

            await clearEventLog();

            // Change to mouseenter event
            await page.click('#set-mouseenter-event-btn');
            await page.waitForFunction(() => {
                const element = document.querySelector('#event-component');
                return element && element.textContent.includes('mouseenter');
            });

            // Click should not work anymore
            await page.click('#event-component');
            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: component'))).toBe(false);

            // Mouseenter should work
            await page.hover('#event-component');
            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Mouse: component');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Mouse: component'))).toBe(true);
        });

        test('component disappears and event handlers are cleaned up', async () => {
            await clearEventLog();

            // Ensure component is visible and working
            await page.click('#show-event-component-btn');
            await page.click('#set-click-event-btn');
            await page.waitForSelector('#event-component');

            await page.click('#event-component');
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: component'))).toBe(true);

            // Hide component
            await page.click('#hide-event-component-btn');
            await page.waitForSelector('#event-component', { hidden: true });

            // Show again and verify handler still works
            await page.click('#show-event-component-btn');
            await page.waitForSelector('#event-component');

            await clearEventLog();
            await page.click('#event-component');

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: component'))).toBe(true);
        });
    });

    describe('Type-Level Event Updates', () => {
        test('event handlers preserved when element type changes', async () => {
            await clearEventLog();

            // Start with button
            await page.click('#set-button-type-btn');
            await page.waitForSelector('button#type-event-element');

            await page.click('#type-event-element');
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: type-element'))).toBe(true);

            await clearEventLog();

            // Change to div
            await page.click('#set-div-type-btn');
            await page.waitForSelector('div#type-event-element');

            // Click handler should still work
            await page.click('#type-event-element');
            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: type-element'))).toBe(true);
        });

        test('focus events work correctly after type change', async () => {
            await clearEventLog();

            // Start with button (focusable)
            await page.click('#set-button-type-btn');
            await page.waitForSelector('button#type-event-element');

            await page.focus('#type-event-element');
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Focus: type-element'))).toBe(true);

            await clearEventLog();

            // Change to div (needs tabindex to be focusable)
            await page.click('#set-div-type-btn');
            await page.waitForSelector('div#type-event-element');

            await page.focus('#type-event-element');
            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Focus: type-element'))).toBe(true);
        });

        test('mouse events preserved during type changes', async () => {
            await clearEventLog();

            await page.click('#set-button-type-btn');
            await page.waitForSelector('button#type-event-element');

            await page.hover('#type-event-element');
            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Mouse: type-element');
            });

            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Mouse: type-element'))).toBe(true);

            await clearEventLog();

            // Change type and test mouse event again
            await page.click('#set-input-type-btn');
            await page.waitForSelector('input#type-event-element');

            await page.hover('#type-event-element');
            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Mouse: type-element');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Mouse: type-element'))).toBe(true);
        });
    });

    describe('Attributes-Level Event Updates', () => {
        test('single to multiple event handlers', async () => {
            await clearEventLog();

            // Start with single event
            await page.click('#set-single-attrs-btn');
            await page.waitForSelector('#attributes-event-element');

            await page.click('#attributes-event-element');
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: attributes-single'))).toBe(true);

            await clearEventLog();

            // Change to multiple events
            await page.click('#set-multiple-attrs-btn');
            await delay(100) // Small delay for update

            // Test click handler
            await page.click('#attributes-event-element');
            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: attributes-multiple'))).toBe(true);

            // Test mouse handler
            await page.hover('#attributes-event-element');
            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Mouse: attributes-multiple');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Mouse: attributes-multiple'))).toBe(true);

            // Test focus handler
            await page.focus('#attributes-event-element');
            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Focus: attributes-multiple');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Focus: attributes-multiple'))).toBe(true);
        });

        test('event handler removal in mixed mode', async () => {
            await clearEventLog();

            // Start with multiple events
            await page.click('#set-multiple-attrs-btn');
            await page.waitForSelector('#attributes-event-element');

            // Verify mouse handler works
            await page.hover('#attributes-event-element');
            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Mouse: attributes-multiple');
            });

            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Mouse: attributes-multiple'))).toBe(true);

            await clearEventLog();

            // Change to mixed mode (removes mouse handler)
            await page.click('#set-mixed-attrs-btn');
            await delay(100);

            // Click should still work
            await page.click('#attributes-event-element');
            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: attributes-mixed'))).toBe(true);

            await clearEventLog();

            // Mouse handler should be removed (no new events should be logged)
            await page.hover('#attributes-event-element');
            await delay(200)

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Mouse:'))).toBe(false);
        });
    });


    describe('Children-Level Event Updates', () => {
        test('new children have event handlers', async () => {
            await clearEventLog();

            // Add a new child
            await page.click('#add-event-child-btn');
            await page.waitForFunction(() => {
                const children = document.querySelectorAll('#children-event-container button');
                return children.length > 2;
            });

            // Find and click the new child
            const newChild = await page.$('#children-event-container button:last-child');
            await newChild.click();

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: child-'))).toBe(true);
        });

        test('removed children event handlers are cleaned up', async () => {
            await clearEventLog();

            // Ensure we have children
            await page.click('#add-event-child-btn');
            await page.waitForFunction(() => {
                const children = document.querySelectorAll('#children-event-container button');
                return children.length > 0;
            });

            const initialCount = await page.$$eval('#children-event-container button', els => els.length);

            // Remove a child
            await page.click('#remove-event-child-btn');
            await page.waitForFunction((prevCount) => {
                const children = document.querySelectorAll('#children-event-container button');
                return children.length < prevCount;
            }, {}, initialCount);

            // Remaining children should still work
            const remainingChildren = await page.$$('#children-event-container button');
            if (remainingChildren.length > 0) {
                await remainingChildren[0].click();
                const logs = await getEventLogEntries();
                expect(logs.some(log => log.includes('Click: child-'))).toBe(true);
            }
        });

        test('shuffled children maintain their event handlers', async () => {
            await clearEventLog();

            // Ensure we have multiple children
            await page.click('#add-event-child-btn');
            await page.click('#add-event-child-btn');
            await page.waitForFunction(() => {
                const children = document.querySelectorAll('#children-event-container button');
                return children.length >= 3;
            });

            // Get initial order
            const initialOrder = await page.$$eval('#children-event-container button', els =>
                els.map(el => el.textContent)
            );

            // Shuffle children
            await page.click('#shuffle-event-children-btn');
            await page.waitForFunction((prevOrder) => {
                const children = document.querySelectorAll('#children-event-container button');
                const currentOrder = Array.from(children).map(el => el.textContent);
                return JSON.stringify(currentOrder) !== JSON.stringify(prevOrder);
            }, {}, initialOrder);

            // Test that all children still have working event handlers
            const children = await page.$$('#children-event-container button');
            for (let i = 0; i < Math.min(children.length, 3); i++) {
                await children[i].click();
            }

            const logs = await getEventLogEntries();
            expect(logs.filter(log => log.includes('Click: child-')).length).toBeGreaterThanOrEqual(3);
        });
    });

    describe('Form Event Updates', () => {
        test('input events work correctly', async () => {
            await clearEventLog();

            await page.type('#form-input', 'test input');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Input: form-input');
            });

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Input: form-input'))).toBe(true);
        });

        test('change events work correctly', async () => {
            await clearEventLog();

            await page.select('#form-select', 'option2');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Change: form-select');
            });

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Change: form-select (option2)'))).toBe(true);
        });

        test('checkbox events work correctly', async () => {
            await clearEventLog();

            await page.click('#form-checkbox');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Change: form-checkbox');
            });

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Change: form-checkbox'))).toBe(true);
        });

        test('focus and blur events work correctly', async () => {
            await clearEventLog();

            await page.focus('#form-input');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Focus: form-input (focus)');
            });

            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Focus: form-input (focus)'))).toBe(true);

            await page.focus('#form-select'); // Focus something else to trigger blur

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Focus: form-input (blur)');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Focus: form-input (blur)'))).toBe(true);
        });
    });

    describe('Rapid Event Changes', () => {
        test('rapid event type changes work correctly', async () => {
            await clearEventLog();

            // Test click
            await page.click('#set-click-rapid-btn');
            await delay(100)

            await page.click('#rapid-event-element');
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: rapid-'))).toBe(true);

            await clearEventLog();

            // Test double click
            await page.click('#set-dblclick-rapid-btn');
            await delay(100)

            await page.click('#rapid-event-element', { count: 2 });

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Double-click: rapid-');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Double-click: rapid-'))).toBe(true);

            await clearEventLog();

            // Test context menu
            await page.click('#set-contextmenu-rapid-btn');
            await delay(100)

            await page.click('#rapid-event-element', { button: 'right' });

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Context: rapid-');
            });

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Context: rapid-'))).toBe(true);
        });

        test('batch updates work correctly', async () => {
            await clearEventLog();

            // update to another state to make next selector to wait properly
            // await page.click('#set-click-rapid-btn');
            // await delay(100)

            await page.click('#rapid-batch-update-btn');
            await delay(200)

            // Wait for all batch updates to complete
            await page.waitForFunction(() => {
                const element = document.querySelector('#rapid-event-element');
                return element && element.textContent.includes('contextmenu');
            });

            // Test final event type (should be contextmenu)
            await page.click('#rapid-event-element', { button: 'right' });

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Context: rapid-');
            });

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Context: rapid-'))).toBe(true);
        });
    });

    describe('Event Behavior Controls', () => {
        test('preventDefault can be toggled and works correctly', async () => {
            await clearEventLog();

            await page.click('#prevent-default-off-btn')

            // Test link without preventDefault (should navigate)
            const initialUrl = page.url();
            await page.click('#test-link');

            // Wait a bit and check if URL changed (link should work)
            await delay(200)
            const urlAfterClick = page.url();
            expect(urlAfterClick).toContain('#test-anchor');

            // Check event was logged
            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Link clicked'))).toBe(true);

            await clearEventLog();

            // Navigate back to test again
            await page.goto(initialUrl);
            await page.waitForSelector('#test-link');

            // Enable preventDefault
            await page.click('#prevent-default-on-btn')
            await page.waitForFunction(() => {
                const btn = document.querySelector('#prevent-default-status');
                return btn && btn.textContent.includes('ON');
            });

            // Test link with preventDefault (should not navigate)
            const urlBeforeClick = page.url();
            await page.click('#test-link');

            await delay(200)
            const urlAfterPreventedClick = page.url();
            expect(urlAfterPreventedClick).toBe(urlBeforeClick); // URL should not change

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Link clicked'))).toBe(true);
        });

        test('preventDefault works with form submission', async () => {
            await clearEventLog();

            await page.click('#prevent-default-off-btn')

            const initialUrl = page.url()
            // Submit form without preventDefault
            await page.type('#test-input-first-name', 'Aleks');
            await page.type('#test-input-last-name', 'B');
            await page.click('#submit-button');

            await page.waitForNavigation()
            const [_, search] = page.url().split('?')
            expect(search).toBe('first-name=Aleks&last-name=B')

            // Page was reloaded, so log should actually be empty
            await page.goto(initialUrl)
            await clearEventLog();

            // Enable preventDefault
            await page.click('#prevent-default-on-btn')
            await page.waitForFunction(() => {
                const btn = document.querySelector('#prevent-default-status');
                return btn && btn.textContent.includes('ON');
            });

            // Submit form with preventDefault
            await page.focus('#test-input-first-name');
            await page.type('#test-input-first-name', 'Aleks');
            await page.focus('#test-input-last-name');
            await page.type('#test-input-last-name', 'B');
            await page.keyboard.press('Enter'); // Alternative way to submit

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Form submitted');
            });


            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Form submitted'))).toBe(true);

            // just in case, check that url didn't change
            await delay(200)
            expect(page.url()).toBe(initialUrl)
        });

        test('stopPropagation can be toggled and works correctly', async () => {
            await clearEventLog();

            await page.click('#stop-propagation-off-btn')

            // Click inner button without stopPropagation (should bubble)
            await page.click('#inner-button');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Inner button clicked') &&
                    log.textContent.includes('Middle container clicked') &&
                    log.textContent.includes('Outer container clicked');
            });

            let logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Inner button clicked'))).toBe(true);
            expect(logs.some(log => log.includes('Middle container clicked'))).toBe(true);
            expect(logs.some(log => log.includes('Outer container clicked'))).toBe(true);

            await clearEventLog();

            // Enable stopPropagation
            await page.click('#stop-propagation-on-btn')
            await page.waitForFunction(() => {
                const btn = document.querySelector('#stop-propagation-status');
                return btn && btn.textContent.includes('ON');
            });

            // Click inner button with stopPropagation (should not bubble)
            await page.click('#inner-button');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Inner button clicked');
            });

            // Wait a bit more to ensure no bubbling occurs
            await delay(300)

            logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Inner button clicked'))).toBe(true);
            expect(logs.some(log => log.includes('Middle container clicked'))).toBe(false);
            expect(logs.some(log => log.includes('Outer container clicked'))).toBe(false);
        });

        test('preventDefault and stopPropagation can work together', async () => {
            await clearEventLog();

            // Enable both preventDefault and stopPropagation
            await page.click('#prevent-default-on-btn')
            await page.click('#stop-propagation-on-btn')

            await page.waitForFunction(() => {
                const preventStatus = document.querySelector('#prevent-default-status');
                const stopStatus = document.querySelector('#stop-propagation-status');
                return preventStatus && preventStatus.textContent.includes('ON') &&
                    stopStatus && stopStatus.textContent.includes('ON');
            });

            // Test with form submission
            await page.type('#test-input-first-name', 'Aleks');
            await page.type('#test-input-last-name', 'B');
            await page.click('#submit-button');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Form submitted');
            });

            // Wait to ensure no other events fire
            await delay(300)

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Form submitted'))).toBe(true);

            // Should only have the form submit event, no bubbling to parent containers
            const formLogs = logs.filter(log => log.includes('Form submitted'));
            expect(formLogs.length).toBe(1);

            // Page should not navigate (preventDefault worked)
            expect(page.url()).toContain('event-listeners');
        });

        test('event behavior controls update dynamically', async () => {
            await clearEventLog();

            // Test rapid toggling of controls
            for (let i = 0; i < 3; i++) {
                if (i % 2 === 0) {
                    await page.click('#prevent-default-off-btn')
                    await page.click('#stop-propagation-off-btn')
                } else {
                    await page.click('#prevent-default-on-btn')
                    await page.click('#stop-propagation-on-btn')
                }
                await delay(50)
            }

            // Verify final state
            const preventStatus = await page.$('#prevent-default-status');
            const stopStatus = await page.$('#stop-propagation-status');

            const preventText = await preventStatus.evaluate(el => el.textContent);
            const stopText = await stopStatus.evaluate(el => el.textContent);

            expect(preventText).toMatch(/Prevent Default: (ON|OFF)/);
            expect(stopText).toMatch(/Stop Propagation: (ON|OFF)/);

            // Test that the current state actually works
            await page.click('#inner-button');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Inner button clicked');
            });

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Inner button clicked'))).toBe(true);

            // Check if bubbling occurred based on stopPropagation state
            const shouldBubble = stopText.includes('OFF');
            const didBubble = logs.some(log => log.includes('Middle container clicked'));
            expect(didBubble).toBe(shouldBubble);
        });

        test('event behavior persists across component updates', async () => {
            await clearEventLog();

            // Set specific state
            await page.click('#prevent-default-on-btn')
            await page.click('#stop-propagation-on-btn')

            await page.waitForFunction(() => {
                const preventStatus = document.querySelector('#prevent-default-status');
                const stopStatus = document.querySelector('#stop-propagation-status');
                return preventStatus && preventStatus.textContent.includes('ON') &&
                    stopStatus && stopStatus.textContent.includes('ON');
            });

            // Trigger some component updates
            await page.click('#hide-event-component-btn');
            await page.waitForSelector('#event-component', { hidden: true });

            await page.click('#show-event-component-btn');
            await page.waitForSelector('#event-component');

            // Test that behavior controls still work
            await page.click('#inner-button');

            await page.waitForFunction(() => {
                const log = document.querySelector('#event-log');
                return log && log.textContent.includes('Inner button clicked');
            });

            // Wait to ensure no bubbling
            await delay(300)

            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Inner button clicked'))).toBe(true);
            expect(logs.some(log => log.includes('Middle container clicked'))).toBe(false);
            expect(logs.some(log => log.includes('Outer container clicked'))).toBe(false);

            // Verify button states are still correct
            const preventStatus = await page.$('#prevent-default-status');
            const stopStatus = await page.$('#stop-propagation-status');

            const preventText = await preventStatus.evaluate(el => el.textContent);
            const stopText = await stopStatus.evaluate(el => el.textContent);

            expect(preventText).toContain('ON');
            expect(stopText).toContain('ON');
        });
    });

    describe('Event Behavior and Edge Cases', () => {
        test('event handlers work after multiple update cycles', async () => {
            await clearEventLog();

            // Perform multiple update cycles
            for (let i = 0; i < 3; i++) {
                await page.click('#hide-event-component-btn');
                await page.waitForSelector('#event-component', { hidden: true });

                await page.click('#show-event-component-btn');
                await page.waitForSelector('#event-component');

                await page.click('#set-click-event-btn');
                await page.click('#set-mouseenter-event-btn');
                await page.click('#set-click-event-btn');
            }

            // Final test
            await page.click('#event-component');
            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: component'))).toBe(true);
        });

        test('event handlers are properly cleaned up during rapid changes', async () => {
            await clearEventLog();

            // Rapid attribute changes
            for (let i = 0; i < 10; i++) {
                await page.click('#set-button-type-btn')
                await page.click('#set-div-type-btn')
                await page.click('#set-input-type-btn')
                await delay(50)
            }

            // Ensure final state has handler
            await page.click('#set-button-type-btn')
            await delay(100)

            // Test handlers work
            await page.click('#type-event-element');
            const logs = await getEventLogEntries();
            expect(logs.some(log => log.includes('Click: type-element'))).toBe(true);
        });

        test('memory leaks are prevented during event handler updates', async () => {
            // This test ensures that old event handlers are properly removed
            // We can't directly test memory usage, but we can test behavior

            await clearEventLog();

            // Create many handler updates
            for (let i = 0; i < 10; i++) {
                await page.click('#set-single-attrs-btn');
                await page.click('#set-multiple-attrs-btn');
                await page.click('#set-mixed-attrs-btn');
                await delay(50)
            }

            // Final test - only current handlers should work
            await page.click('#set-single-attrs-btn');
            await delay(100)

            await page.click('#attributes-event-element');
            const logs = await getEventLogEntries();

            // Should only have one click event, not multiple from old handlers
            const clickLogs = logs.filter(log => log.includes('Click: attributes-'));
            expect(clickLogs.length).toBe(1);
            expect(clickLogs[0]).toContain('attributes-single');
        });
    });
});

function delay(time: number): Promise<void> {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}
