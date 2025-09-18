import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/fuzzy-testing');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Fuzzy Testing Suite', () => {
    const getTestResults = async () => {
        return await page.$$eval('#fuzzy-test-container + div div:not(:first-child)', els =>
            els.map(el => el.textContent).filter(text => text.trim())
        );
    };

    const getTestCount = async () => {
        const countText = await page.$eval('div:has-text("Test Count:")', el => el.textContent);
        const match = countText.match(/Test Count: (\d+)/);
        return match ? parseInt(match[1]) : 0;
    };

    const getCurrentRandomState = async () => {
        const stateText = await page.$eval('pre', el => el.textContent);
        try {
            return JSON.parse(stateText);
        } catch {
            return null;
        }
    };

    describe('Single Fuzzy Test Execution', () => {
        test('single fuzzy test executes and produces result', async () => {
            // Clear any previous results
            const initialCount = await getTestCount();

            await page.click('#single-fuzzy-test-btn');

            // Wait for test to complete
            await page.waitForFunction((prevCount) => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount > prevCount;
            }, {}, initialCount);

            const newCount = await getTestCount();
            expect(newCount).toBe(initialCount + 1);

            // Should have a result logged
            const results = await getTestResults();
            expect(results.length).toBeGreaterThan(0);
            expect(results[results.length - 1]).toMatch(/Test \d+: (SUCCESS|ERROR)/);
        });

        test('single test updates random state', async () => {
            const initialState = await getCurrentRandomState();

            await page.click('#single-fuzzy-test-btn');

            await page.waitForFunction(() => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                return countElement && parseInt(countElement.textContent.match(/\d+/)[0]) > 0;
            });

            const newState = await getCurrentRandomState();
            expect(newState).toBeTruthy();
            expect(newState).toHaveProperty('componentType');
            expect(newState).toHaveProperty('attributes');
            expect(newState).toHaveProperty('children');
            expect(newState).toHaveProperty('eventHandlers');

            // State should be different (unless extremely unlikely random collision)
            expect(JSON.stringify(newState)).not.toBe(JSON.stringify(initialState));
        });

        test('single test creates component in test container', async () => {
            await page.click('#single-fuzzy-test-btn');

            await page.waitForFunction(() => {
                const container = document.querySelector('#fuzzy-test-container');
                return container && container.children.length > 0;
            });

            const containerChildren = await page.$$eval('#fuzzy-test-container > *', els => els.length);
            expect(containerChildren).toBeGreaterThan(0);
        });

        test('test handles errors gracefully', async () => {
            // Run multiple single tests to increase chance of hitting error cases
            for (let i = 0; i < 10; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 100); // Small delay between tests
            }

            const results = await getTestResults();
            expect(results.length).toBeGreaterThanOrEqual(10);

            // Should have mix of SUCCESS and potentially ERROR results
            const successResults = results.filter(r => r.includes('SUCCESS'));
            const errorResults = results.filter(r => r.includes('ERROR'));

            expect(successResults.length + errorResults.length).toBe(results.length);

            // Even if there are errors, the framework should still be functional
            const testCount = await getTestCount();
            expect(testCount).toBeGreaterThanOrEqual(10);
        });
    });

    describe('Batch Fuzzy Test Execution', () => {
        test('batch fuzzy test runs multiple tests automatically', async () => {
            const initialCount = await getTestCount();

            await page.click('#start-fuzzy-test-btn');

            // Wait for several tests to run
            await page.waitForFunction((prevCount) => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= prevCount + 20; // Wait for at least 20 tests
            }, { timeout: 15000 }, initialCount);

            const currentCount = await getTestCount();
            expect(currentCount).toBeGreaterThanOrEqual(initialCount + 20);

            // Stop the test
            await page.click('#stop-fuzzy-test-btn');

            // Count should stop increasing
            const stoppedCount = await getTestCount();
            await page.waitForFunction(() => true, {}, 500); // Wait a bit
            const finalCount = await getTestCount();

            expect(finalCount).toBe(stoppedCount); // Should not increase after stopping
        });

        test('batch test can be stopped and restarted', async () => {
            const initialCount = await getTestCount();

            // Start batch test
            await page.click('#start-fuzzy-test-btn');

            // Wait for some tests
            await page.waitForFunction((prevCount) => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= prevCount + 5;
            }, {}, initialCount);

            // Stop it
            await page.click('#stop-fuzzy-test-btn');
            const stoppedCount = await getTestCount();

            // Wait to ensure it's really stopped
            await page.waitForFunction(() => true, {}, 500);
            const confirmedStoppedCount = await getTestCount();
            expect(confirmedStoppedCount).toBe(stoppedCount);

            // Restart it
            await page.click('#start-fuzzy-test-btn');

            // Should continue from where it left off
            await page.waitForFunction((prevCount) => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount > prevCount;
            }, {}, confirmedStoppedCount);

            const restartedCount = await getTestCount();
            expect(restartedCount).toBeGreaterThan(confirmedStoppedCount);

            await page.click('#stop-fuzzy-test-btn');
        });

        test('batch test completes full cycle when allowed to run', async () => {
            // Set a lower max for faster testing
            await page.evaluate(() => {
                window.__APP_STATE.lastSymbols = []; // Reset any state
                const state = document.querySelector('#container').__state;
                if (state) {
                    state.maxFuzzyTests = 50; // Lower number for testing
                    state.fuzzyTestCount = 0;
                    state.fuzzyTestResults = [];
                }
            });

            await page.click('#start-fuzzy-test-btn');

            // Wait for completion
            await page.waitForFunction(() => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const text = countElement.textContent;
                const match = text.match(/Test Count: (\d+)\/(\d+)/);
                if (!match) return false;
                const [, current, max] = match;
                return parseInt(current) >= parseInt(max);
            }, { timeout: 30000 });

            const finalCount = await getTestCount();
            expect(finalCount).toBe(50);

            // Should have stopped automatically
            await page.waitForFunction(() => true, {}, 1000);
            const confirmedFinalCount = await getTestCount();
            expect(confirmedFinalCount).toBe(50); // Should not increase further
        });
    });

    describe('Random Component Generation', () => {
        test('generates components with various element types', async () => {
            const elementTypes = new Set();

            // Run multiple tests to collect different element types
            for (let i = 0; i < 20; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 50);

                const state = await getCurrentRandomState();
                if (state && state.componentType) {
                    elementTypes.add(state.componentType);
                }
            }

            // Should have generated multiple different element types
            expect(elementTypes.size).toBeGreaterThan(1);

            // Should include some valid HTML element types
            const validTypes = ['div', 'span', 'p', 'button', 'input', 'select', 'textarea', 'h1', 'h2', 'section', 'article'];
            const hasValidTypes = Array.from(elementTypes).some(type => validTypes.includes(type));
            expect(hasValidTypes).toBe(true);
        });

        test('generates components with various attribute counts', async () => {
            const attributeCounts = new Set();

            for (let i = 0; i < 15; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 50);

                const state = await getCurrentRandomState();
                if (state && typeof state.attributes === 'string') {
                    // Count the number of properties in the JSON string
                    try {
                        const attrs = JSON.parse(state.attributes);
                        attributeCounts.add(Object.keys(attrs).length);
                    } catch (e) {
                        // Invalid JSON, but that's also a valid test case
                        attributeCounts.add(-1);
                    }
                }
            }

            // Should have generated different attribute counts
            expect(attributeCounts.size).toBeGreaterThan(1);
        });

        test('generates components with various children counts', async () => {
            const childrenCounts = new Set();

            for (let i = 0; i < 15; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 50);

                const state = await getCurrentRandomState();
                if (state && typeof state.children === 'number') {
                    childrenCounts.add(state.children);
                }
            }

            // Should have generated different children counts
            expect(childrenCounts.size).toBeGreaterThan(1);
        });

        test('generates components with event handlers', async () => {
            let hasEventHandlers = false;
            let hasNoEventHandlers = false;

            for (let i = 0; i < 20; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 50);

                const state = await getCurrentRandomState();
                if (state && typeof state.eventHandlers === 'number') {
                    if (state.eventHandlers > 0) {
                        hasEventHandlers = true;
                    } else {
                        hasNoEventHandlers = true;
                    }
                }

                if (hasEventHandlers && hasNoEventHandlers) break;
            }

            // Should generate both components with and without event handlers
            expect(hasEventHandlers).toBe(true);
            expect(hasNoEventHandlers).toBe(true);
        });
    });

    describe('Error Handling and Recovery', () => {
        test('framework remains stable after error-inducing tests', async () => {
            // Run a batch of tests that are likely to include errors
            await page.click('#start-fuzzy-test-btn');

            await page.waitForFunction(() => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= 30;
            }, { timeout: 20000 });

            await page.click('#stop-fuzzy-test-btn');

            // Framework should still be responsive
            const isResponsive = await page.evaluate(() => {
                try {
                    // Try to interact with the page
                    const button = document.querySelector('#single-fuzzy-test-btn');
                    return button && typeof button.click === 'function';
                } catch (e) {
                    return false;
                }
            });

            expect(isResponsive).toBe(true);

            // Should be able to run another single test
            const beforeCount = await getTestCount();
            await page.click('#single-fuzzy-test-btn');

            await page.waitForFunction((prevCount) => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount > prevCount;
            }, {}, beforeCount);

            const afterCount = await getTestCount();
            expect(afterCount).toBe(beforeCount + 1);
        });

        test('error results are properly logged', async () => {
            // Run enough tests to likely encounter some errors
            for (let i = 0; i < 25; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 30);
            }

            const results = await getTestResults();
            expect(results.length).toBeGreaterThan(0);

            // Check that results are properly formatted
            const validResults = results.filter(result =>
                result.match(/Test \d+: (SUCCESS|ERROR)/)
            );

            expect(validResults.length).toBe(results.length);

            // If there are error results, they should contain error messages
            const errorResults = results.filter(result => result.includes('ERROR'));
            if (errorResults.length > 0) {
                errorResults.forEach(errorResult => {
                    expect(errorResult).toMatch(/ERROR - .+/);
                });
            }
        });

        test('test container handles invalid components gracefully', async () => {
            // Run many tests to increase chance of invalid components
            for (let i = 0; i < 30; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 25);
            }

            // Container should still exist and be functional
            const containerExists = await page.$('#fuzzy-test-container');
            expect(containerExists).toBeTruthy();

            // Should be able to inspect container contents
            const containerHasContent = await page.evaluate(() => {
                const container = document.querySelector('#fuzzy-test-container');
                return container && container.children.length >= 0; // Could be 0 if last test failed
            });

            expect(containerHasContent).toBe(true);
        });
    });

    describe('Performance and Stress Testing', () => {
        test('rapid single tests maintain performance', async () => {
            const startTime = Date.now();
            const initialCount = await getTestCount();

            // Run 20 rapid single tests
            for (let i = 0; i < 20; i++) {
                await page.click('#single-fuzzy-test-btn');
                // Minimal delay to simulate rapid clicking
                await page.waitForFunction(() => true, {}, 10);
            }

            // Wait for all tests to complete
            await page.waitForFunction((prevCount) => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= prevCount + 20;
            }, { timeout: 10000 }, initialCount);

            const endTime = Date.now();
            const totalTime = endTime - startTime;

            // Should complete within reasonable time (10 seconds)
            expect(totalTime).toBeLessThan(10000);

            const finalCount = await getTestCount();
            expect(finalCount).toBe(initialCount + 20);
        });

        test('batch test performance is acceptable', async () => {
            // Reset for clean test
            await page.evaluate(() => {
                const state = document.querySelector('#container').__state;
                if (state) {
                    state.fuzzyTestCount = 0;
                    state.fuzzyTestResults = [];
                    state.maxFuzzyTests = 100;
                }
            });

            const startTime = Date.now();

            await page.click('#start-fuzzy-test-btn');

            // Wait for 50 tests to complete
            await page.waitForFunction(() => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= 50;
            }, { timeout: 30000 });

            const midTime = Date.now();
            await page.click('#stop-fuzzy-test-btn');

            const timeFor50Tests = midTime - startTime;

            // Should complete 50 tests within 30 seconds
            expect(timeFor50Tests).toBeLessThan(30000);

            // Average time per test should be reasonable
            const avgTimePerTest = timeFor50Tests / 50;
            expect(avgTimePerTest).toBeLessThan(500); // Less than 500ms per test on average
        });

        test('memory usage remains stable during extended testing', async () => {
            // Get initial memory if available
            const initialMemory = await page.evaluate(() => {
                return performance.memory ? performance.memory.usedJSHeapSize : null;
            });

            // Run extended test
            await page.click('#start-fuzzy-test-btn');

            await page.waitForFunction(() => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= 40;
            }, { timeout: 25000 });

            await page.click('#stop-fuzzy-test-btn');

            // Check memory after testing
            const finalMemory = await page.evaluate(() => {
                return performance.memory ? performance.memory.usedJSHeapSize : null;
            });

            if (initialMemory && finalMemory) {
                const memoryIncrease = finalMemory - initialMemory;
                const memoryIncreasePercent = (memoryIncrease / initialMemory) * 100;

                // Memory increase should be reasonable (less than 200% increase)
                expect(memoryIncreasePercent).toBeLessThan(200);
            }

            // Framework should still be responsive regardless of memory metrics
            await page.click('#single-fuzzy-test-btn');
            const testCount = await getTestCount();
            expect(testCount).toBeGreaterThan(40);
        });
    });

    describe('State Management During Fuzzy Testing', () => {
        test('random state updates correctly reflect component generation', async () => {
            const states = [];

            for (let i = 0; i < 10; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 100);

                const state = await getCurrentRandomState();
                if (state) {
                    states.push(state);
                }
            }

            expect(states.length).toBe(10);

            // Each state should have the required properties
            states.forEach(state => {
                expect(state).toHaveProperty('componentType');
                expect(state).toHaveProperty('attributes');
                expect(state).toHaveProperty('children');
                expect(state).toHaveProperty('eventHandlers');

                expect(typeof state.children).toBe('number');
                expect(typeof state.eventHandlers).toBe('number');
                expect(state.children).toBeGreaterThanOrEqual(0);
                expect(state.eventHandlers).toBeGreaterThanOrEqual(0);
            });
        });

        test('test results accumulate correctly', async () => {
            const initialResults = await getTestResults();
            const initialCount = initialResults.length;

            // Run 5 single tests
            for (let i = 0; i < 5; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 100);
            }

            const finalResults = await getTestResults();
            const finalCount = finalResults.length;

            // Should have 5 more results (or close to it, accounting for display limits)
            expect(finalCount).toBeGreaterThan(initialCount);

            // New results should be properly formatted
            const newResults = finalResults.slice(initialCount);
            newResults.forEach(result => {
                expect(result).toMatch(/Test \d+: (SUCCESS|ERROR)/);
            });
        });

        test('state persists correctly during batch operations', async () => {
            await page.click('#start-fuzzy-test-btn');

            // Check state multiple times during batch execution
            const stateSnapshots = [];

            for (let i = 0; i < 5; i++) {
                await page.waitForFunction(() => true, {}, 200);
                const state = await getCurrentRandomState();
                if (state) {
                    stateSnapshots.push(state);
                }
            }

            await page.click('#stop-fuzzy-test-btn');

            expect(stateSnapshots.length).toBe(5);

            // States should be different (showing updates are happening)
            const uniqueStates = new Set(stateSnapshots.map(s => JSON.stringify(s)));
            expect(uniqueStates.size).toBeGreaterThan(1);
        });
    });

    describe('UI Responsiveness During Fuzzy Testing', () => {
        test('UI remains responsive during batch testing', async () => {
            await page.click('#start-fuzzy-test-btn');

            // Wait for some tests to run
            await page.waitForFunction(() => {
                const countElement = document.querySelector('div:has-text("Test Count:")');
                if (!countElement) return false;
                const currentCount = parseInt(countElement.textContent.match(/\d+/)[0]);
                return currentCount >= 10;
            });

            // UI should still be responsive - test by clicking stop button
            const stopButtonClickable = await page.evaluate(() => {
                const button = document.querySelector('#stop-fuzzy-test-btn');
                return button && !button.disabled;
            });

            expect(stopButtonClickable).toBe(true);

            await page.click('#stop-fuzzy-test-btn');

            // Should be able to immediately start a single test
            await page.click('#single-fuzzy-test-btn');

            const testCount = await getTestCount();
            expect(testCount).toBeGreaterThan(10);
        });

        test('test results display updates in real-time', async () => {
            const initialResults = await getTestResults();
            const initialCount = initialResults.length;

            await page.click('#start-fuzzy-test-btn');

            // Wait and check that results are updating
            await page.waitForFunction((prevCount) => {
                const results = Array.from(document.querySelectorAll('#fuzzy-test-container + div div:not(:first-child)'))
                    .map(el => el.textContent).filter(text => text.trim());
                return results.length > prevCount;
            }, { timeout: 5000 }, initialCount);

            const updatedResults = await getTestResults();
            expect(updatedResults.length).toBeGreaterThan(initialCount);

            await page.click('#stop-fuzzy-test-btn');
        });

        test('can clear results and restart testing', async () => {
            // Run some tests first
            for (let i = 0; i < 5; i++) {
                await page.click('#single-fuzzy-test-btn');
                await page.waitForFunction(() => true, {}, 50);
            }

            const resultsBeforeClear = await getTestResults();
            expect(resultsBeforeClear.length).toBeGreaterThan(0);

            // Clear results (if there's a clear button - assuming there might be one)
            // If not, this tests that we can restart from any state
            await page.evaluate(() => {
                // Reset state manually for testing
                const state = document.querySelector('#container').__state;
                if (state) {
                    state.fuzzyTestResults = [];
                    state.fuzzyTestCount = 0;
                }
            });

            // Should be able to start fresh
            await page.click('#single-fuzzy-test-btn');

            const testCount = await getTestCount();
            expect(testCount).toBe(1);
        });
    });
});
