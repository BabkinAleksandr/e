import { beforeAll, afterAll, describe, expect, test, beforeEach } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/error-boundary');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Error Boundary Tests', () => {
    describe('Static Rendering Error Boundary', () => {
        test('renders successfully without error', async () => {
            expect(await page.$('#static-error-fallback')).toBeTruthy();
        });
    });

    describe('Conditional Component Error Boundary', () => {
        beforeEach(async () => {
            await page.click('#reset-conditional-error-btn')
        })

        test('handles error in conditional component', async () => {
            // Show conditional component
            await page.click('#show-conditional-btn');
            await page.waitForSelector('#conditional-success-component');

            // Trigger error
            await page.click('#trigger-conditional-error-btn');
            await page.waitForSelector('#conditional-error-fallback');

            expect(await page.$eval('#conditional-error-fallback', el => el.textContent))
                .toBe('Conditional Error: Conditional component error');
            expect(await page.$('#conditional-success-component')).toBeNull();
        });

        test('hides error boundary when component is hidden', async () => {
            // Show and trigger error
            await page.click('#show-conditional-btn');
            await page.waitForSelector('#conditional-success-component');
            await page.click('#trigger-conditional-error-btn');
            await page.waitForSelector('#conditional-error-fallback');

            // Hide component
            await page.click('#hide-conditional-btn');
            await page.waitForSelector('#conditional-error-fallback', { hidden: true });

            expect(await page.$('#conditional-error-fallback')).toBeNull();
            expect(await page.$('#conditional-success-component')).toBeNull();
        });

        test('recovers when shown again after error resolution', async () => {
            // Show, error, hide, resolve, show
            await page.click('#show-conditional-btn');
            await page.waitForSelector('#conditional-success-component');
            await page.click('#trigger-conditional-error-btn');
            await page.waitForSelector('#conditional-error-fallback');
            await page.click('#hide-conditional-btn');
            await page.waitForSelector('#conditional-error-fallback', { hidden: true });
            await page.click('#resolve-conditional-error-btn');
            await page.click('#show-conditional-btn');
            await page.waitForSelector('#conditional-success-component');

            expect(await page.$('#conditional-success-component')).toBeTruthy();
            expect(await page.$('#conditional-error-fallback')).toBeNull();
        });
    });

    describe('Type Update Error Boundary', () => {
        beforeEach(async () => {
            await page.click('#reset-element-type-btn');
        })

        test('handles error during type updates', async () => {
            // Show component
            await page.click('#show-type-component-btn');
            await page.waitForSelector('#type-success-component');

            expect(await page.$('#type-success-component')).toBeTruthy();

            // Trigger error and change type
            await page.click('#trigger-type-error-btn');
            await page.click('#change-element-type-btn');
            await page.waitForSelector('#type-error-fallback');

            expect(await page.$('#type-error-fallback')).toBeTruthy();
            expect(await page.$eval('#type-error-fallback', el => el.textContent))
                .toBe('Type Error: Type update error');
        });

        test('recovers from type update error', async () => {
            // Ensure error state
            await page.click('#show-type-component-btn');
            await page.click('#trigger-type-error-btn');
            await page.click('#change-element-type-btn');
            await page.waitForSelector('#type-error-fallback');

            // Resolve error
            await page.click('#resolve-type-error-btn');
            await page.waitForSelector('#type-success-component');

            expect(await page.$('#type-success-component')).toBeTruthy();
            expect(await page.$('#type-error-fallback')).toBeNull();
        });
    });

    describe('Attributes Update Error Boundary', () => {
        beforeEach(async () => {
            await page.click('#reset-attributes-value-btn');
        })

        test('handles error during attributes update', async () => {
            // Show component
            await page.click('#show-attributes-component-btn');
            await page.waitForSelector('#attributes-success-component');

            expect(await page.$('#attributes-success-component')).toBeTruthy();

            // Trigger error and update attributes
            await page.click('#trigger-attributes-error-btn');
            await page.click('#update-attributes-value-btn');
            await page.waitForSelector('#attributes-error-fallback');

            expect(await page.$('#attributes-error-fallback')).toBeTruthy();
            expect(await page.$eval('#attributes-error-fallback', el => el.textContent))
                .toBe('Attributes Error: Attributes update error');
        });

        test('recovers from attributes update error', async () => {
            // Ensure error state
            await page.click('#show-attributes-component-btn');
            await page.click('#trigger-attributes-error-btn');
            await page.click('#update-attributes-value-btn');
            await page.waitForSelector('#attributes-error-fallback');

            // Resolve error
            await page.click('#resolve-attributes-error-btn');
            await page.waitForSelector('#attributes-success-component');

            expect(await page.$('#attributes-success-component')).toBeTruthy();
            expect(await page.$('#attributes-error-fallback')).toBeNull();
        });
    });

    describe('Single Attribute Update Error Boundary', () => {
        beforeEach(async () => {
            await page.click('#reset-single-attr-value-btn');
        })

        test('handles error during single attribute update', async () => {
            // Show component
            await page.click('#show-single-attr-component-btn');
            await page.waitForSelector('#single-attr-success-component');

            expect(await page.$('#single-attr-success-component')).toBeTruthy();

            // Trigger error and update single attribute
            await page.click('#trigger-single-attr-error-btn');
            await page.click('#update-single-attr-value-btn');
            await page.waitForSelector('#single-attr-error-fallback');

            expect(await page.$('#single-attr-error-fallback')).toBeTruthy();
            expect(await page.$eval('#single-attr-error-fallback', el => el.textContent))
                .toBe('Single Attr Error: Single attribute error');
        });

        test('recovers from single attribute update error', async () => {
            // Ensure error state
            await page.click('#show-single-attr-component-btn');
            await page.click('#trigger-single-attr-error-btn');
            await page.click('#update-single-attr-value-btn');
            await page.waitForSelector('#single-attr-error-fallback');

            // Resolve error
            await page.click('#resolve-single-attr-error-btn');
            await page.waitForSelector('#single-attr-success-component');

            expect(await page.$('#single-attr-success-component')).toBeTruthy();
            expect(await page.$('#single-attr-error-fallback')).toBeNull();
        });
    });

    describe('Children Update Error Boundary', () => {
        beforeEach(async () => {
            await page.click('#reset-children-count-btn');
        })

        test('handles error during children update', async () => {
            // Show component
            await page.click('#show-children-component-btn');
            await page.waitForSelector('#children-parent-component');

            expect(await page.$('#children-parent-component')).toBeTruthy();
            expect(await page.$('#child-0')).toBeTruthy();

            // Trigger error and update children
            await page.click('#trigger-children-error-btn');
            await page.click('#increase-children-count-btn');
            await page.waitForSelector('#children-error-fallback');

            expect(await page.$('#children-error-fallback')).toBeTruthy();
            expect(await page.$eval('#children-error-fallback', el => el.textContent))
                .toBe('Children Error: Children update error');
        });

        test('recovers from children update error', async () => {
            // Ensure error state
            await page.click('#show-children-component-btn');
            await page.click('#trigger-children-error-btn');
            await page.click('#increase-children-count-btn');
            await page.waitForSelector('#children-error-fallback');

            // Resolve error
            await page.click('#resolve-children-error-btn');
            await page.waitForSelector('#children-parent-component');

            expect(await page.$('#children-parent-component')).toBeTruthy();
            expect(await page.$('#children-error-fallback')).toBeNull();
        });
    });

    describe('Nested Error Boundaries Tests', () => {
        // Helper function to get current component state
        const getComponentState = async () => {
            return await page.evaluate(() => {
                return {
                    parent: !!document.querySelector('#nested-parent-success'),
                    parentError: !!document.querySelector('#nested-parent-error-fallback'),
                    child1: !!document.querySelector('#nested-child1-success'),
                    child2: !!document.querySelector('#nested-child2-success'),
                    child3: !!document.querySelector('#nested-child3-success'),
                    nestedChild1: !!document.querySelector('#nested-nested-child1-success'),
                    nestedChild2: !!document.querySelector('#nested-nested-child2-success'),
                    childErrors: document.querySelectorAll('.child-error').length
                };
            });
        };

        // Helper function to get element order within the nested container
        const getElementOrder = async () => {
            return await page.evaluate(() => {
                const container = document.querySelector('#nested-error-container');
                if (!container) return [];

                const getAllElements = (element) => {
                    const elements = [];
                    const walker = document.createTreeWalker(
                        element,
                        NodeFilter.SHOW_ELEMENT,
                        {
                            acceptNode: (node) => {
                                // Only include elements with IDs that are part of our nested structure
                                if (node.id && (
                                    node.id.includes('nested-parent') ||
                                    node.id.includes('nested-child') ||
                                    node.id.includes('nested-nested-child')
                                )) {
                                    return NodeFilter.FILTER_ACCEPT;
                                }
                                return NodeFilter.FILTER_SKIP;
                            }
                        }
                    );

                    let currentNode;
                    while (currentNode = walker.nextNode()) {
                        elements.push(currentNode.id);
                    }
                    return elements;
                };

                return getAllElements(container);
            });
        };

        const getElementsTextValues = async () => {
            return await page.evaluate(() => {
                const container = document.querySelector('#nested-error-container');
                if (!container) return [];

                const getAllElements = (element) => {
                    const elements = [];
                    const walker = document.createTreeWalker(
                        element,
                        NodeFilter.SHOW_TEXT,
                    );

                    let currentNode;
                    while (currentNode = walker.nextNode()) {
                        elements.push(currentNode.data);
                    }
                    return elements;
                };

                return getAllElements(container);
            });
        }

        // Helper function to verify expected order based on current state
        const verifyExpectedOrder = async (state) => {
            const order = await getElementOrder();
            const expectedOrder = [];

            // Parent should always be first if present
            if (state.parent) {
                expectedOrder.push('nested-parent-success');
            } else if (state.parentError) {
                expectedOrder.push('nested-parent-error-fallback');
                // If parent has error, no children should be present
                expect(order).toEqual(expectedOrder);
                return;
            }

            // Children order when parent is present
            if (state.parent) {
                // Child 1
                if (state.child1) {
                    expectedOrder.push('nested-child1-success');
                } else {
                    // Check if there's an error boundary for child 1
                    const hasChild1Error = order.includes('nested-child1-error-fallback');
                    if (hasChild1Error) {
                        // Find position where child1 error should be
                        const child1ErrorIndex = order.findIndex(id =>
                            id === 'nested-child1-error-fallback' &&
                            order.indexOf(id) === order.findIndex(id2 => id2 === 'nested-child1-error-fallback')
                        );
                        if (child1ErrorIndex !== -1) {
                            expectedOrder.push('nested-child1-error-fallback');
                        }
                    }
                }

                // Child 2
                if (state.child2) {
                    expectedOrder.push('nested-child2-success');
                    // Nested children of child 2
                    if (state.nestedChild1) {
                        expectedOrder.push('nested-nested-child1-success');
                    } else {
                        // Check for nested child 1 error
                        const hasNestedChild1Error = order.some(id =>
                            id === 'nested-nested-child1-error-fallback'
                        );
                        if (hasNestedChild1Error && !state.child1 && state.child2) {
                            expectedOrder.push('nested-nested-child1-error-fallback');
                        }
                    }

                    if (state.nestedChild2) {
                        expectedOrder.push('nested-nested-child2-success');
                    } else {
                        // Check for nested child 2 error
                        const hasNestedChild2Error = order.some(id =>
                            id === 'nested-nested-child2-error-fallback'
                        );
                        if (hasNestedChild2Error && !state.child1 && state.child2 && state.nestedChild1) {
                            expectedOrder.push('nested-nested-child2-error-fallback');
                        }
                    }
                } else {
                    // Child 2 has error, check for error boundary
                    const hasChild2Error = order.some(id => id === 'nested-child2-error-fallback');
                    if (hasChild2Error) {
                        expectedOrder.push('nested-child2-error-fallback');
                    }
                }

                // Child 3
                if (state.child3) {
                    expectedOrder.push('nested-child3-success');
                } else {
                    // Check if there's an error boundary for child 3
                    const hasChild3Error = order.some(id => id === 'nested-child3-error-fallback');
                    if (hasChild3Error) {
                        expectedOrder.push('nested-child3-error-fallback');
                    }
                }
            }

            // Verify the order matches expected (allowing for multiple error boundaries)
            const parentIndex = order.findIndex(id => id.includes('nested-parent'));
            expect(parentIndex).toBe(0); // Parent should always be first

            // Verify children appear after parent
            const childIndices = order.map((id, index) =>
                id.includes('nested-child') && !id.includes('nested-nested') ? index : -1
            ).filter(index => index !== -1);

            const nestedChildIndices = order.map((id, index) =>
                id.includes('nested-nested-child') ? index : -1
            ).filter(index => index !== -1);

            // All child indices should be greater than parent index
            childIndices.forEach(index => {
                expect(index).toBeGreaterThan(parentIndex);
            });

            // All nested child indices should be greater than their parent child index
            nestedChildIndices.forEach(nestedIndex => {
                const parentChildIndex = childIndices.find(childIndex => childIndex < nestedIndex);
                if (parentChildIndex !== undefined) {
                    expect(nestedIndex).toBeGreaterThan(parentChildIndex);
                }
            });
        };

        beforeEach(async () => {
            await page.click('#resolve-nested-errors-btn');
            await page.click('#hide-nested-parent-btn');
            await page.click('#show-nested-parent-btn');
            await page.waitForSelector('#nested-parent-success');
        });

        describe('Initial State and Basic Functionality', () => {
            test('renders complete nested structure successfully with correct order', async () => {
                const state = await getComponentState();

                expect(state.parent).toBe(true);
                expect(state.parentError).toBe(false);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);

                // Verify specific expected order for initial state
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully'
                ])
            });

            test('hides entire structure when parent is hidden maintaining order', async () => {
                await page.click('#show-nested-parent-btn');
                await page.waitForSelector('#nested-parent-success');

                await page.click('#hide-nested-parent-btn');
                await page.waitForSelector('#nested-parent-success', { hidden: true });

                const state = await getComponentState();
                expect(state.parent).toBe(false);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(false);
                expect(state.child3).toBe(false);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);

                expect(await getElementOrder()).toEqual([]);
                expect(await getElementsTextValues()).toEqual([])
            });
        });

        describe('Parent Error Scenarios', () => {
            test('parent error affects entire structure maintaining order', async () => {
                await page.click('#trigger-nested-parent-error-btn');
                await page.waitForSelector('#nested-parent-error-fallback');

                const state = await getComponentState();
                expect(state.parent).toBe(false);
                expect(state.parentError).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(false);
                expect(state.child3).toBe(false);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual(['nested-parent-error-fallback']);
                expect(await getElementsTextValues()).toEqual(['Nested Parent Error: Nested parent error'])
            });

            test('parent error recovery restores entire structure with correct order', async () => {
                await page.click('#trigger-nested-parent-error-btn');
                await page.waitForSelector('#nested-parent-error-fallback');

                await page.click('#resolve-parent-error-btn');
                await page.waitForSelector('#nested-parent-success');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.parentError).toBe(false);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully'
                ])
            });
        });

        describe('Individual Child Error Scenarios', () => {
            test('child 1 error only affects child 1 maintaining order', async () => {
                await page.click('#trigger-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-error-fallback');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully'
                ])
            });

            test('child 2 error affects child 2 and its nested children maintaining order', async () => {
                await page.click('#trigger-nested-child2-error-btn');
                await page.waitForSelector('#nested-child2-error-fallback');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(false);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully'
                ])
            });

            test('child 3 error only affects child 3 maintaining order', async () => {
                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForSelector('#nested-child3-error-fallback');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(false);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error'
                ])
            });
        });

        describe('Nested Child Error Scenarios', () => {
            test('nested child 1 error only affects nested child 1 maintaining order', async () => {
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.waitForSelector('#nested-nested-child1-error-fallback');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-error-fallback',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('nested child 2 error only affects nested child 2 maintaining order', async () => {
                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.waitForSelector('#nested-nested-child2-error-fallback');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Multiple Error Combinations', () => {
            test('multiple child errors create multiple error boundaries maintaining order', async () => {
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(false);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error'
                ])
            });

            test('child 2 error with nested child errors maintains order', async () => {
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.waitForSelector('#nested-nested-child1-error-fallback');

                await page.click('#trigger-nested-child2-error-btn');
                await page.waitForSelector('#nested-child2-error-fallback');

                // Child 2 error should override nested child errors since child 2 contains them
                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(false);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('all children errors simultaneously maintaining order', async () => {
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child2-error-btn');
                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 3
                );

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(false);
                expect(state.child3).toBe(false);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(3);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-error-fallback',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error'
                ])
            });

            test('both nested children errors simultaneously maintaining order', async () => {
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-error-fallback',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Sequential Error Triggering', () => {
            test('sequential child errors accumulate maintaining order', async () => {
                // Trigger errors one by one
                await page.click('#trigger-nested-child1-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 1
                );

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ])
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#trigger-nested-child2-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 3
                );

                const state = await getComponentState();
                expect(state.childErrors).toBe(3);
                expect(state.parent).toBe(true);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-error-fallback',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                ])
            });

            test('sequential nested child errors accumulate maintaining order', async () => {
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 1
                );

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-error-fallback',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                const state = await getComponentState();
                expect(state.childErrors).toBe(2);
                expect(state.child2).toBe(true);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-error-fallback',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Individual Error Recovery', () => {
            test('child 1 error recovery restores only child 1 maintaining order', async () => {
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                await page.click('#resolve-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-success');

                const state = await getComponentState();
                expect(state.child1).toBe(true);
                expect(state.child3).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                ])
            });

            test('child 2 error recovery restores child 2 and nested children maintaining order', async () => {
                await page.click('#trigger-nested-child2-error-btn');
                await page.waitForSelector('#nested-child2-error-fallback');

                await page.click('#resolve-nested-child2-error-btn');
                await page.waitForSelector('#nested-child2-success');

                const state = await getComponentState();
                expect(state.child2).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('nested child error recovery restores only that nested child maintaining order', async () => {
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                await page.click('#resolve-nested-nested-child1-error-btn');
                await page.waitForSelector('#nested-nested-child1-success');

                const state = await getComponentState();
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);

                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Sequential Error Recovery', () => {
            test('sequential recovery of multiple child errors maintaining order', async () => {
                // Trigger all child errors
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child2-error-btn');
                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 3
                );

                // Recover one by one
                await page.click('#resolve-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-success');
                let state = await getComponentState();
                expect(state.child1).toBe(true);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-error-fallback',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                ])

                await page.click('#resolve-nested-child2-error-btn');
                await page.waitForSelector('#nested-child2-success');
                state = await getComponentState();
                expect(state.child2).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-error-fallback'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                ])

                await page.click('#resolve-nested-child3-error-btn');
                await page.waitForSelector('#nested-child3-success');
                state = await getComponentState();
                expect(state.child3).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('reverse order recovery of multiple child errors maintaining order', async () => {
                // Trigger all child errors
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child2-error-btn');
                await page.click('#trigger-nested-child3-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 3
                );

                // Recover in reverse order
                await page.click('#resolve-nested-child3-error-btn');
                await page.waitForSelector('#nested-child3-success');
                let state = await getComponentState();
                expect(state.child3).toBe(true);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#resolve-nested-child2-error-btn');
                await page.waitForSelector('#nested-child2-success');
                state = await getComponentState();
                expect(state.child2).toBe(true);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#resolve-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-success');
                state = await getComponentState();
                expect(state.child1).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Complex Error Sequences', () => {
            test('error-recovery-error sequence on same component maintaining order', async () => {
                // Error -> Recovery -> Error again
                await page.click('#trigger-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-error-fallback')

                expect((await getElementOrder())[1]).toBe('nested-child1-error-fallback');
                expect((await getElementsTextValues())[1]).toEqual('Nested Child Error: Nested child error')

                await page.click('#resolve-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-success');

                expect((await getElementOrder())[1]).toBe('nested-child1-success');
                expect((await getElementsTextValues())[1]).toEqual('Nested child 1 rendered successfully')

                await page.click('#trigger-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-error-fallback')

                const state = await getComponentState();
                expect(state.child1).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);
                expect((await getElementOrder())[1]).toBe('nested-child1-error-fallback');
                expect((await getElementsTextValues())[1]).toEqual('Nested Child Error: Nested child error')
            });

            test('cascading error recovery with parent override maintaining order', async () => {
                // Trigger child errors first
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child2-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 2
                );

                // Trigger parent error (should override all child errors)
                await page.click('#trigger-nested-parent-error-btn');
                await page.waitForSelector('#nested-parent-error-fallback');

                let state = await getComponentState();
                expect(state.parent).toBe(false);
                expect(state.parentError).toBe(true);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual(['nested-parent-error-fallback']);
                expect(await getElementsTextValues()).toEqual(['Nested Parent Error: Nested parent error'])

                // Resolve parent error (should restore all children)
                await page.click('#resolve-parent-error-btn');
                await page.waitForSelector('#nested-parent-success');

                state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(false);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#resolve-nested-child2-error-btn')
                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('mixed level error triggering and recovery maintaining order', async () => {
                // Trigger errors at different levels
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.waitForFunction(() =>
                    document.querySelectorAll('.child-error').length === 3
                );

                await page.click('#trigger-nested-nested-child2-error-btn')

                // Resolve child 1 (should not affect nested children)
                await page.click('#resolve-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-success');

                let state = await getComponentState();
                expect(state.child1).toBe(true);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-error-fallback',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])

                // Resolve nested children one by one
                await page.click('#resolve-nested-nested-child1-error-btn');
                await page.waitForSelector('#nested-nested-child1-success');

                state = await getComponentState();
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(1);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])

                await page.click('#resolve-nested-nested-child2-error-btn');
                await page.waitForSelector('#nested-nested-child2-success');

                state = await getComponentState();
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Bulk Operations', () => {
            test('resolve all errors at once maintaining order', async () => {
                // Trigger multiple errors
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-child2-error-btn');
                await page.click('#trigger-nested-child3-error-btn');
                await page.click('#trigger-nested-parent-error-btn');
                await page.waitForSelector('#nested-parent-error-fallback')

                // Resolve all at once
                await page.click('#resolve-nested-errors-btn');
                await page.waitForSelector('#nested-parent-success');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('bulk resolution after parent error maintaining order', async () => {
                // Trigger parent error
                await page.click('#trigger-nested-parent-error-btn');
                await page.waitForSelector('#nested-parent-error-fallback');

                // Bulk resolve (should restore everything)
                await page.click('#resolve-nested-errors-btn');
                await page.waitForSelector('#nested-parent-success');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.parentError).toBe(false);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested child 1 rendered successfully',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Nested child 2 rendered successfully',
                    'Nested child 3 rendered successfully',
                ])
            });
        });

        describe('Hide/Show with Errors', () => {
            test('hide parent with active errors and show again maintaining order', async () => {
                // Trigger errors
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#trigger-nested-nested-child2-error-btn');
                await page.waitForFunction(() => document.querySelectorAll('.child-error').length === 2);

                // Hide parent
                await page.click('#hide-nested-parent-btn');
                await page.waitForSelector('#nested-parent-success', { hidden: true });

                let state = await getComponentState();
                expect(state.parent).toBe(false);

                expect(await getElementOrder()).toEqual([]);
                expect(await getElementsTextValues()).toEqual([]);

                // Show parent again (errors should persist)
                await page.click('#show-nested-parent-btn');
                await page.waitForSelector('#nested-parent-success');

                state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.nestedChild2).toBe(false);
                expect(state.childErrors).toBe(2);

                await verifyExpectedOrder(state);
                expect(await getElementOrder()).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-error-fallback',
                    'nested-child3-success'
                ]);
                expect(await getElementsTextValues()).toEqual([
                    'Nested parent rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 2 rendered successfully',
                    'Nested Nested child 1 rendered successfully',
                    'Nested Child Error: Nested child error',
                    'Nested child 3 rendered successfully',
                ])
            });

            test('resolve errors while parent is hidden maintaining order', async () => {
                // Trigger errors and hide
                await page.click('#trigger-nested-child1-error-btn');
                await page.click('#hide-nested-parent-btn');
                await page.waitForSelector('#nested-parent-success', { hidden: true });

                // Resolve errors while hidden
                await page.click('#resolve-nested-child1-error-btn');

                // Show parent (should be fully recovered)
                await page.click('#show-nested-parent-btn');
                await page.waitForSelector('#nested-parent-success');

                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                const order = await getElementOrder();
                expect(order).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
            });
        });

        describe('Stress Testing', () => {
            test('rapid error triggering and resolution maintaining order', async () => {
                // Rapidly trigger and resolve errors
                for (let i = 0; i < 3; i++) {
                    await page.click('#trigger-nested-child1-error-btn');
                    await page.click('#trigger-nested-child2-error-btn');
                    await page.click('#resolve-nested-child1-error-btn');
                    await page.click('#resolve-nested-child2-error-btn');
                }

                await page.waitForSelector('#nested-parent-success');
                const state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                const order = await getElementOrder();
                expect(order).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
            });

            test('all possible error combinations maintaining order', async () => {
                const errorButtons = [
                    '#trigger-nested-child1-error-btn',
                    '#trigger-nested-child2-error-btn',
                    '#trigger-nested-child3-error-btn',
                    '#trigger-nested-nested-child1-error-btn',
                    '#trigger-nested-nested-child2-error-btn'
                ];

                // Trigger all errors
                for (const button of errorButtons) {
                    await page.click(button);
                }

                await page.waitForFunction(() =>
                    document.querySelectorAll('.error-boundary.child-error').length >= 3
                );

                // Verify maximum error state
                let state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(false);
                expect(state.child3).toBe(false);
                expect(state.nestedChild1).toBe(false);
                expect(state.nestedChild2).toBe(false);

                await verifyExpectedOrder(state);

                // Bulk resolve
                await page.click('#resolve-nested-errors-btn');
                await page.waitForSelector('#nested-parent-success');

                state = await getComponentState();
                expect(state.parent).toBe(true);
                expect(state.child1).toBe(true);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);
                expect(state.childErrors).toBe(0);

                await verifyExpectedOrder(state);
                const order = await getElementOrder();
                expect(order).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
            });
        });

        describe('Error Boundary Isolation', () => {
            test('error boundaries are properly isolated maintaining order', async () => {
                // Trigger child 1 error
                await page.click('#trigger-nested-child1-error-btn');
                await page.waitForSelector('#nested-child1-error-fallback')

                // Verify other components are unaffected
                const state = await getComponentState();
                expect(state.child1).toBe(false);
                expect(state.child2).toBe(true);
                expect(state.child3).toBe(true);
                expect(state.nestedChild1).toBe(true);
                expect(state.nestedChild2).toBe(true);

                await verifyExpectedOrder(state);

                // Verify error boundary content
                const errorText = await page.$eval('#nested-child1-error-fallback', el => el.textContent);
                expect(errorText).toBe('Nested Child Error: Nested child error');

                const order = await getElementOrder();
                expect(order).toEqual([
                    'nested-parent-success',
                    'nested-child1-error-fallback',
                    'nested-child2-success',
                    'nested-nested-child1-success',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
            });

            test('nested error boundaries maintain hierarchy and order', async () => {
                // Trigger nested child error
                await page.click('#trigger-nested-nested-child1-error-btn');
                await page.waitForSelector('#nested-nested-child1-error-fallback');

                // Verify parent hierarchy is maintained
                const isChildOfParent = await page.evaluate(() => {
                    const parent = document.querySelector('#nested-child2-success');
                    const errorBoundary = document.querySelector('#nested-nested-child1-error-fallback');
                    return parent && errorBoundary && parent.contains(errorBoundary);
                });

                expect(isChildOfParent).toBe(true);

                await verifyExpectedOrder(await getComponentState());

                const order = await getElementOrder();
                expect(order).toEqual([
                    'nested-parent-success',
                    'nested-child1-success',
                    'nested-child2-success',
                    'nested-nested-child1-error-fallback',
                    'nested-nested-child2-success',
                    'nested-child3-success'
                ]);
            });
        });
    });

    describe('Error Recovery Scenarios', () => {
        test('handles progressive error recovery', async () => {
            // Trigger recovery error
            await page.click('#trigger-recovery-error-btn');
            await page.waitForSelector('#recovery-error-fallback');

            expect(await page.$eval('#recovery-error-fallback', el => el.textContent))
                .toBe('Recovery Error: Recovery attempt 1 (Attempt: 0)');

            // Attempt recovery (should still fail)
            await page.click('#attempt-recovery-btn');
            await page.waitForFunction(() => {
                const element = document.querySelector('#recovery-error-fallback');
                return element && element.textContent.includes('(Attempt: 1)');
            });

            // Continue attempts until success
            await page.click('#attempt-recovery-btn');
            await page.click('#attempt-recovery-btn');
            await page.waitForSelector('#recovery-success-component');

            expect(await page.$('#recovery-success-component')).toBeTruthy();
            expect(await page.$eval('#recovery-success-component', el => el.textContent))
                .toBe('Recovery successful after 3 attempts');
        });

        test('resets recovery state', async () => {
            // Trigger and reset
            await page.click('#trigger-recovery-error-btn');
            await page.waitForSelector('#recovery-error-fallback');
            await page.click('#reset-recovery-btn');
            await page.waitForSelector('#recovery-success-component');

            expect(await page.$('#recovery-success-component')).toBeTruthy();
            expect(await page.$eval('#recovery-success-component', el => el.textContent))
                .toBe('Recovery successful after 0 attempts');
        });
    });

    describe('Multiple Error Boundaries', () => {
        test('handles multiple independent error boundaries', async () => {
            // Initially both should be successful
            expect(await page.$('#multiple-success-1')).toBeTruthy();
            expect(await page.$('#multiple-success-2')).toBeTruthy();

            // Trigger first error
            await page.click('#trigger-multiple-error-1-btn');
            await page.waitForSelector('#multiple-error-1');

            expect(await page.$('#multiple-error-1')).toBeTruthy();
            expect(await page.$('#multiple-success-1')).toBeNull();
            expect(await page.$('#multiple-success-2')).toBeTruthy();

            // Trigger second error
            await page.click('#trigger-multiple-error-2-btn');
            await page.waitForSelector('#multiple-error-2');

            expect(await page.$('#multiple-error-1')).toBeTruthy();
            expect(await page.$('#multiple-error-2')).toBeTruthy();
            expect(await page.$('#multiple-success-1')).toBeNull();
            expect(await page.$('#multiple-success-2')).toBeNull();
        });

        test('resolves multiple errors independently', async () => {
            // Trigger both errors
            await page.click('#trigger-both-multiple-errors-btn');
            await page.waitForSelector('#multiple-error-1');
            await page.waitForSelector('#multiple-error-2');

            // Resolve all errors
            await page.click('#resolve-multiple-errors-btn');
            await page.waitForSelector('#multiple-success-1');
            await page.waitForSelector('#multiple-success-2');

            expect(await page.$('#multiple-success-1')).toBeTruthy();
            expect(await page.$('#multiple-success-2')).toBeTruthy();
            expect(await page.$('#multiple-error-1')).toBeNull();
            expect(await page.$('#multiple-error-2')).toBeNull();
        });
    });

    describe('Deep Nesting Error Boundaries', () => {
        test('catches errors at different nesting levels', async () => {
            // Initially all levels should render
            expect(await page.$('#deep-level-1')).toBeTruthy();
            expect(await page.$('#deep-level-2')).toBeTruthy();
            expect(await page.$('#deep-level-3')).toBeTruthy();

            // Trigger level 3 error (deepest level with error boundary)
            await page.click('#trigger-deep-error-level-3-btn');
            await page.waitForSelector('#deep-error-fallback');

            expect(await page.$('#deep-level-1')).toBeTruthy();
            expect(await page.$('#deep-level-2')).toBeTruthy();
            expect(await page.$('#deep-error-fallback')).toBeTruthy();
            expect(await page.$('#deep-level-3')).toBeNull();
        });

        test('errors at higher levels crashes app', async () => {
            // Trigger level 1 error (no error boundary at this level)
            await page.click('#trigger-deep-error-level-1-btn');
            await page.waitForSelector('#e-root-error-boundary');


            // Since level 1 has no error boundary, the error should propagate up to root error boundary
            expect(await page.$('#deep-level-1')).toBeNull();
            expect(await page.$('#deep-level-2')).toBeNull();
            expect(await page.$('#deep-level-3')).toBeNull();
            expect(await page.$eval('#e-root-error-boundary', (e) => e.textContent))
                .toBe('Error occured during app rendering:Error: Deep nested error at level 1')

            await page.reload()
        });
    });

    describe('Error Boundary Edge Cases', () => {
        test('error boundary maintains component hierarchy', async () => {
            // Show nested structure and trigger child error
            await page.click('#show-nested-parent-btn');
            await page.waitForSelector('#nested-parent-success');
            await page.click('#trigger-nested-child1-error-btn');
            await page.waitForSelector('.child-error');

            // Parent should still be rendered with error boundary as child
            const parentElement = await page.$('#nested-parent-success');
            const childErrorElement = await page.$('.child-error');

            expect(parentElement).toBeTruthy();
            expect(childErrorElement).toBeTruthy();

            // Check that error boundary is actually a child of parent
            const isChildOfParent = await page.evaluate(() => {
                const parent = document.querySelector('#nested-parent-success');
                const child = document.querySelector('.child-error');
                return parent && child && parent.contains(child);
            });

            expect(isChildOfParent).toBe(true);
        });

        test('error boundary preserves sibling components', async () => {
            // Trigger one error in multiple error boundaries
            await page.click('#trigger-multiple-error-1-btn');
            await page.waitForSelector('#multiple-error-1');

            // Second component should remain unaffected
            expect(await page.$('#multiple-success-2')).toBeTruthy();
            expect(await page.$('#multiple-error-2')).toBeNull();
        });
    });
});
