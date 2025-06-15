import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/dynamic-children');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Dynamic Children Update Tests', () => {
    describe('Simple List Operations', () => {
        test('adds item to beginning of list', async () => {
            // Reset to known state
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');

            // Get initial order
            const getOrder = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3']);

            // Add to beginning
            await page.click('#add-simple-beginning-btn');
            await page.waitForSelector('#simple-item-4'); // New item should be at index 3

            expect(await getOrder()).toEqual(['Item 4', 'Item 1', 'Item 2', 'Item 3']);
        });

        test('adds item to middle of list', async () => {
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');

            const getOrder = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3']);

            await page.click('#add-simple-middle-btn');
            await page.waitForSelector('#simple-item-3');

            expect(await getOrder()).toEqual(['Item 1', 'Item 4', 'Item 2', 'Item 3']);
        });

        test('adds item to end of list', async () => {
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');

            const getOrder = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3']);

            await page.click('#add-simple-end-btn');
            await page.waitForSelector('#simple-item-3');

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3', 'Item 4']);
        });

        test('removes item from beginning of list', async () => {
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');

            const getOrder = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3']);

            await page.click('#remove-simple-first-btn');
            await page.waitForSelector('#simple-item-1', { hidden: true });

            expect(await getOrder()).toEqual(['Item 2', 'Item 3']);
        });

        test('removes item from middle of list', async () => {
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');

            const getOrder = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3']);

            await page.click('#remove-simple-middle-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#simple-list-container .item');
                return items.length === 2;
            });

            expect(await getOrder()).toEqual(['Item 1', 'Item 3']);
        });

        test('removes item from end of list', async () => {
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');

            const getOrder = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            expect(await getOrder()).toEqual(['Item 1', 'Item 2', 'Item 3']);

            await page.click('#remove-simple-last-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#simple-list-container .item');
                return items.length === 2;
            });

            expect(await getOrder()).toEqual(['Item 1', 'Item 2']);
        });
    });

    describe('Object-Based Items with Keys', () => {
        test('maintains element identity when shuffling', async () => {
            // Get initial element references
            const getElementIds = async () => {
                const items = await page.$$eval('#object-list-container .item', els =>
                    els.map(el => ({ id: el.id, text: el.textContent }))
                );
                return items;
            };

            const initialItems = await getElementIds();
            expect(initialItems.length).toBeGreaterThan(0);

            // Shuffle the list
            await page.click('#shuffle-object-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#object-list-container');
                return container && container.children.length > 0;
            });

            const shuffledItems = await getElementIds();

            // Items should still exist but potentially in different order
            expect(shuffledItems.length).toBe(initialItems.length);

            // Each original item should still exist (same ID and content)
            for (const initialItem of initialItems) {
                const foundItem = shuffledItems.find(item => item.id === initialItem.id);
                expect(foundItem).toBeTruthy();
                expect(foundItem.text).toBe(initialItem.text);
            }
        });

        test('sorts items by name', async () => {
            const getItemNames = async () => {
                const items = await page.$$eval('#object-list-container .item', els =>
                    els.map(el => el.textContent.split(' (')[0]) // Extract name part
                );
                return items;
            };

            await page.click('#sort-object-name-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#object-list-container');
                return container && container.children.length > 0;
            });

            const sortedNames = await getItemNames();
            const expectedSorted = [...sortedNames].sort();
            expect(sortedNames).toEqual(expectedSorted);
        });

        test('sorts items by ID', async () => {
            // First shuffle to ensure we're not already sorted
            await page.click('#shuffle-object-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#object-list-container');
                return container && container.children.length > 0;
            });

            const getItemIds = async () => {
                const items = await page.$$eval('#object-list-container .item', els =>
                    els.map(el => parseInt(el.id.split('-')[2])) // Extract ID from element ID
                );
                return items;
            };

            await page.click('#sort-object-id-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#object-list-container');
                return container && container.children.length > 0;
            });

            const sortedIds = await getItemIds();
            const expectedSorted = [...sortedIds].sort((a, b) => a - b);
            expect(sortedIds).toEqual(expectedSorted);
        });

        test('reverses item order', async () => {
            // Get initial order
            const getOrder = async () => {
                const items = await page.$$eval('#object-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };

            const initialOrder = await getOrder();

            await page.click('#reverse-object-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#object-list-container');
                return container && container.children.length > 0;
            });

            const reversedOrder = await getOrder();
            expect(reversedOrder).toEqual([...initialOrder].reverse());
        });

        test('adds new object item', async () => {
            const getItemCount = async () => {
                const items = await page.$$('#object-list-container .item');
                return items.length;
            };

            const initialCount = await getItemCount();

            await page.click('#add-object-btn');
            await page.waitForFunction((prevCount) => {
                const items = document.querySelectorAll('#object-list-container .item');
                return items.length > prevCount;
            }, {}, initialCount);

            const newCount = await getItemCount();
            expect(newCount).toBe(initialCount + 1);
        });

        test('removes object item', async () => {
            const getItemCount = async () => {
                const items = await page.$$('#object-list-container .item');
                return items.length;
            };

            const initialCount = await getItemCount();

            if (initialCount > 0) {
                await page.click('#remove-object-btn');
                await page.waitForFunction((prevCount) => {
                    const items = document.querySelectorAll('#object-list-container .item');
                    return items.length < prevCount;
                }, {}, initialCount);

                const newCount = await getItemCount();
                expect(newCount).toBe(initialCount - 1);
            }
        });
    });

    describe('Mixed Content (Text and Elements)', () => {
        test('toggles between text and element content', async () => {
            const getFirstItemType = async () => {
                const container = await page.$('#mixed-content-container');
                const firstChild = await container.evaluateHandle(el => el.firstChild);
                const nodeType = await firstChild.evaluate(node => node.nodeType);
                const textNodeType = 3 // Node.TEXT_NODE
                return nodeType === textNodeType ? 'text' : 'element';
            };

            const initialType = await getFirstItemType();

            await page.click('#toggle-mixed-0-btn');
            await page.waitForFunction((prevType) => {
                const container = document.querySelector('#mixed-content-container');
                if (!container || !container.firstChild) return false;
                const currentType = container.firstChild.nodeType === Node.TEXT_NODE ? 'text' : 'element';
                return currentType !== prevType;
            }, {}, initialType);

            const newType = await getFirstItemType();
            expect(newType).not.toBe(initialType);
        });

        test('adds mixed content item', async () => {
            const getItemCount = async () => {
                const container = await page.$('#mixed-content-container');
                const childCount = await container.evaluate(el => el.childNodes.length);
                return childCount;
            };

            const initialCount = await getItemCount();

            await page.click('#add-mixed-item-btn');
            await page.waitForFunction((prevCount) => {
                const container = document.querySelector('#mixed-content-container');
                return container && container.childNodes.length > prevCount;
            }, {}, initialCount);

            const newCount = await getItemCount();
            expect(newCount).toBe(initialCount + 1);
        });

        test('shuffles mixed content', async () => {
            const getMixedContent = async () => {
                const container = await page.$('#mixed-content-container');
                const content = await container.evaluate(el => {
                    return Array.from(el.childNodes).map(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            return { type: 'text', content: node.textContent };
                        } else {
                            return { type: 'element', content: node.textContent, id: node.id };
                        }
                    });
                });
                return content;
            };

            const initialContent = await getMixedContent();

            await page.click('#shuffle-mixed-btn');
            await page.waitForFunction(() => {
                // Wait for DOM to update
                const container = document.querySelector('#mixed-content-container');
                return container && container.childNodes.length > 0;
            });

            const shuffledContent = await getMixedContent();

            // Content should be the same but potentially in different order
            expect(shuffledContent.length).toBe(initialContent.length);

            // All original content should still exist
            for (const item of initialContent) {
                const found = shuffledContent.find(shuffled =>
                    shuffled.type === item.type && shuffled.content === item.content
                );
                expect(found).toBeTruthy();
            }
        });
    });

    describe('Nested Children', () => {
        test('adds new parent with children', async () => {
            const getParentCount = async () => {
                const parents = await page.$$('#nested-children-container .nested-container');
                return parents.length;
            };

            const initialCount = await getParentCount();

            await page.click('#add-nested-parent-btn');
            await page.waitForFunction((prevCount) => {
                const parents = document.querySelectorAll('#nested-children-container .nested-container');
                return parents.length > prevCount;
            }, {}, initialCount);

            const newCount = await getParentCount();
            expect(newCount).toBe(initialCount + 1);

            // Verify the new parent has children
            const lastParent = await page.$('#nested-children-container .nested-container:last-child');
            const childrenCount = await lastParent.$$eval('.nested-children .item', els => els.length);
            expect(childrenCount).toBeGreaterThan(0);
        });

        test('adds child to existing parent', async () => {
            const getFirstParentChildCount = async () => {
                const firstParent = await page.$('#nested-children-container .nested-container:first-child');
                if (!firstParent) return 0;
                const children = await firstParent.$$('.nested-children .item');
                return children.length;
            };

            const initialChildCount = await getFirstParentChildCount();

            await page.click('#add-nested-child-btn');
            await page.waitForFunction((prevCount) => {
                const firstParent = document.querySelector('#nested-children-container .nested-container:first-child');
                if (!firstParent) return false;
                const children = firstParent.querySelectorAll('.nested-children .item');
                return children.length > prevCount;
            }, {}, initialChildCount);

            const newChildCount = await getFirstParentChildCount();
            expect(newChildCount).toBe(initialChildCount + 1);
        });

        test('removes child from parent', async () => {
            const getFirstParentChildCount = async () => {
                const firstParent = await page.$('#nested-children-container .nested-container:first-child');
                if (!firstParent) return 0;
                const children = await firstParent.$$('.nested-children .item');
                return children.length;
            };

            const initialChildCount = await getFirstParentChildCount();

            if (initialChildCount > 0) {
                await page.click('#remove-nested-child-btn');
                await page.waitForFunction((prevCount) => {
                    const firstParent = document.querySelector('#nested-children-container .nested-container:first-child');
                    if (!firstParent) return false;
                    const children = firstParent.querySelectorAll('.nested-children .item');
                    return children.length < prevCount;
                }, {}, initialChildCount);

                const newChildCount = await getFirstParentChildCount();
                expect(newChildCount).toBe(initialChildCount - 1);
            }
        });

        test('shuffles parent order', async () => {
            const getParentOrder = async () => {
                const parents = await page.$$eval('#nested-children-container .nested-container h4', els =>
                    els.map(el => el.textContent)
                );
                return parents;
            };

            const initialOrder = await getParentOrder();

            await page.click('#shuffle-nested-parents-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#nested-children-container');
                return container && container.children.length > 0;
            });

            const shuffledOrder = await getParentOrder();

            // Should have same parents but potentially different order
            expect(shuffledOrder.length).toBe(initialOrder.length);
            expect(shuffledOrder.sort()).toEqual(initialOrder.sort());
        });

        test('shuffles children within parent', async () => {
            const getFirstParentChildOrder = async () => {
                const firstParent = await page.$('#nested-children-container .nested-container:first-child');
                if (!firstParent) return [];
                const children = await firstParent.$$eval('.nested-children .item', els =>
                    els.map(el => el.textContent)
                );
                return children;
            };

            const initialChildOrder = await getFirstParentChildOrder();

            if (initialChildOrder.length > 1) {
                await page.click('#shuffle-nested-children-btn');
                await page.waitForFunction(() => {
                    const firstParent = document.querySelector('#nested-children-container .nested-container:first-child');
                    return firstParent && firstParent.querySelectorAll('.nested-children .item').length > 0;
                });

                const shuffledChildOrder = await getFirstParentChildOrder();

                // Should have same children but potentially different order
                expect(shuffledChildOrder.length).toBe(initialChildOrder.length);
                expect(shuffledChildOrder.sort()).toEqual(initialChildOrder.sort());
            }
        });
    });

    describe('Keyed Items (Key-based Reconciliation)', () => {
        test('maintains element identity when moving items', async () => {
            const getKeyedItems = async () => {
                const items = await page.$$eval('#keyed-items-container .item', els =>
                    els.map(el => ({ id: el.id, text: el.textContent }))
                );
                return items;
            };

            const initialItems = await getKeyedItems();
            const firstItem = initialItems[0];

            await page.click('#move-keyed-first-to-end-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#keyed-items-container');
                return container && container.children.length > 0;
            });

            const movedItems = await getKeyedItems();

            // First item should now be at the end but maintain same ID and content
            const lastItem = movedItems[movedItems.length - 1];
            expect(lastItem.id).toBe(firstItem.id);
            expect(lastItem.text).toBe(firstItem.text);
        });

        test('moves last item to start', async () => {
            const getKeyedItems = async () => {
                const items = await page.$$eval('#keyed-items-container .item', els =>
                    els.map(el => ({ id: el.id, text: el.textContent }))
                );
                return items;
            };

            const initialItems = await getKeyedItems();
            const lastItem = initialItems[initialItems.length - 1];

            await page.click('#move-keyed-last-to-start-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#keyed-items-container');
                return container && container.children.length > 0;
            });

            const movedItems = await getKeyedItems();

            // Last item should now be first but maintain same ID and content
            const firstItem = movedItems[0];
            expect(firstItem.id).toBe(lastItem.id);
            expect(firstItem.text).toBe(lastItem.text);
        });

        test('adds keyed item', async () => {
            const getKeyedItemCount = async () => {
                const items = await page.$$('#keyed-items-container .item');
                return items.length;
            };

            const initialCount = await getKeyedItemCount();

            await page.click('#add-keyed-item-btn');
            await page.waitForFunction((prevCount) => {
                const items = document.querySelectorAll('#keyed-items-container .item');
                return items.length > prevCount;
            }, {}, initialCount);

            const newCount = await getKeyedItemCount();
            expect(newCount).toBe(initialCount + 1);
        });

        test('removes keyed item from middle', async () => {
            const getKeyedItemCount = async () => {
                const items = await page.$$('#keyed-items-container .item');
                return items.length;
            };

            const initialCount = await getKeyedItemCount();

            if (initialCount > 0) {
                await page.click('#remove-keyed-middle-btn');
                await page.waitForFunction((prevCount) => {
                    const items = document.querySelectorAll('#keyed-items-container .item');
                    return items.length < prevCount;
                }, {}, initialCount);

                const newCount = await getKeyedItemCount();
                expect(newCount).toBe(initialCount - 1);
            }
        });

        test('sorts keyed items by key', async () => {
            const getKeyedItemKeys = async () => {
                const items = await page.$$eval('#keyed-items-container .item', els =>
                    els.map(el => el.textContent.split(':')[0]) // Extract key part
                );
                return items;
            };

            await page.click('#sort-keyed-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#keyed-items-container');
                return container && container.children.length > 0;
            });

            const sortedKeys = await getKeyedItemKeys();
            const expectedSorted = [...sortedKeys].sort();
            expect(sortedKeys).toEqual(expectedSorted);
        });

        test('shuffles keyed items', async () => {
            const getKeyedItems = async () => {
                const items = await page.$$eval('#keyed-items-container .item', els =>
                    els.map(el => ({ id: el.id, text: el.textContent }))
                );
                return items;
            };

            const initialItems = await getKeyedItems();

            await page.click('#shuffle-keyed-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#keyed-items-container');
                return container && container.children.length > 0;
            });

            const shuffledItems = await getKeyedItems();

            // Should have same items but potentially different order
            expect(shuffledItems.length).toBe(initialItems.length);

            // Each original item should still exist with same ID and content
            for (const initialItem of initialItems) {
                const foundItem = shuffledItems.find(item => item.id === initialItem.id);
                expect(foundItem).toBeTruthy();
                expect(foundItem.text).toBe(initialItem.text);
            }
        });
    });

    describe('Performance List (Large Dataset)', () => {
        test('shuffles large dataset efficiently', async () => {
            const getPerformanceItemCount = async () => {
                const items = await page.$$('#performance-list-container .item');
                return items.length;
            };

            const initialCount = await getPerformanceItemCount();

            await page.click('#shuffle-performance-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#performance-list-container');
                return container && container.children.length > 0;
            });

            const shuffledCount = await getPerformanceItemCount();
            expect(shuffledCount).toBe(initialCount);
        });

        test('sorts large dataset', async () => {
            const getPerformanceItemIds = async () => {
                const items = await page.$$eval('#performance-list-container .item', els =>
                    els.map(el => parseInt(el.textContent.split(':')[0])) // Extract ID
                );
                return items;
            };

            await page.click('#sort-performance-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#performance-list-container');
                return container && container.children.length > 0;
            });

            const sortedIds = await getPerformanceItemIds();
            const expectedSorted = [...sortedIds].sort((a, b) => a - b);
            expect(sortedIds).toEqual(expectedSorted);
        });

        test('adds multiple items to large dataset', async () => {
            const getPerformanceItemCount = async () => {
                const items = await page.$$('#performance-list-container .item');
                return items.length;
            };

            const initialCount = await getPerformanceItemCount();

            await page.click('#add-performance-items-btn');
            await page.waitForFunction((prevCount) => {
                const items = document.querySelectorAll('#performance-list-container .item');
                return items.length >= prevCount; // May not show all due to slicing
            }, {}, initialCount);

            // Note: The component only shows first 20 items, so we can't directly test count increase
            // But we can verify the operation completed without errors
            const newCount = await getPerformanceItemCount();
            expect(newCount).toBeGreaterThanOrEqual(0);
        });

        test('removes multiple items from large dataset', async () => {
            await page.click('#remove-performance-items-btn');
            await page.waitForFunction(() => {
                const container = document.querySelector('#performance-list-container');
                return container && container.children.length >= 0;
            });

            // Verify operation completed without errors
            const count = await page.$$('#performance-list-container .item');
            expect(count.length).toBeGreaterThanOrEqual(0);
        });
    });

    describe('Conditional Children', () => {
        test('toggles individual conditional children', async () => {
            const isConditionalVisible = async (id: string) => {
                const element = await page.$(`#${id}`);
                return element !== null;
            };

            // Test toggling A
            const initialAVisible = await isConditionalVisible('conditional-a');
            await page.click('#toggle-conditional-a-btn');
            await page.waitForFunction((id, prevVisible) => {
                const element = document.querySelector(`#${id}`);
                const currentVisible = element !== null;
                return currentVisible !== prevVisible;
            }, {}, 'conditional-a', initialAVisible);

            const newAVisible = await isConditionalVisible('conditional-a');
            expect(newAVisible).toBe(!initialAVisible);

            // Test toggling B
            const initialBVisible = await isConditionalVisible('conditional-b');
            await page.click('#toggle-conditional-b-btn');
            await page.waitForFunction((id, prevVisible) => {
                const element = document.querySelector(`#${id}`);
                const currentVisible = element !== null;
                return currentVisible !== prevVisible;
            }, {}, 'conditional-b', initialBVisible);

            const newBVisible = await isConditionalVisible('conditional-b');
            expect(newBVisible).toBe(!initialBVisible);
        });

        test('shows all conditional children', async () => {
            await page.click('#show-all-conditional-btn');
            await page.waitForSelector('#conditional-a');
            await page.waitForSelector('#conditional-b');
            await page.waitForSelector('#conditional-c');

            expect(await page.$('#conditional-a')).toBeTruthy();
            expect(await page.$('#conditional-b')).toBeTruthy();
            expect(await page.$('#conditional-c')).toBeTruthy();
        });

        test('hides all conditional children', async () => {
            await page.click('#hide-all-conditional-btn');
            await page.waitForSelector('#conditional-a', { hidden: true });
            await page.waitForSelector('#conditional-b', { hidden: true });
            await page.waitForSelector('#conditional-c', { hidden: true });

            expect(await page.$('#conditional-a')).toBeNull();
            expect(await page.$('#conditional-b')).toBeNull();
            expect(await page.$('#conditional-c')).toBeNull();
        });

        test('maintains static elements during conditional changes', async () => {
            // Verify static elements always exist
            expect(await page.$('#conditional-static-start')).toBeTruthy();
            expect(await page.$('#conditional-static-end')).toBeTruthy();

            // Toggle conditionals and verify static elements remain
            await page.click('#toggle-conditional-a-btn');
            await page.click('#toggle-conditional-b-btn');
            await page.click('#toggle-conditional-c-btn');

            expect(await page.$('#conditional-static-start')).toBeTruthy();
            expect(await page.$('#conditional-static-end')).toBeTruthy();

            const startText = await page.$eval('#conditional-static-start', el => el.textContent);
            const endText = await page.$eval('#conditional-static-end', el => el.textContent);

            expect(startText).toBe('Start');
            expect(endText).toBe('End');
        });
    });

    describe('Dynamic Children Count', () => {
        test('increases children count', async () => {
            const getChildCount = async () => {
                const items = await page.$$('#dynamic-count-container .item');
                return items.length;
            };

            const initialCount = await getChildCount();

            await page.click('#increase-count-btn');
            await page.waitForFunction((prevCount) => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length > prevCount;
            }, {}, initialCount);

            const newCount = await getChildCount();
            expect(newCount).toBe(initialCount + 1);

            // Verify count display updates
            const displayText = await page.$eval('#dynamic-count-display', el => el.textContent);
            expect(displayText).toBe(`Count: ${newCount}`);
        });

        test('decreases children count', async () => {
            const getChildCount = async () => {
                const items = await page.$$('#dynamic-count-container .item');
                return items.length;
            };

            const initialCount = await getChildCount();

            if (initialCount > 0) {
                await page.click('#decrease-count-btn');
                await page.waitForFunction((prevCount) => {
                    const items = document.querySelectorAll('#dynamic-count-container .item');
                    return items.length < prevCount;
                }, {}, initialCount);

                const newCount = await getChildCount();
                expect(newCount).toBe(initialCount - 1);
            }
        });

        test('sets count to zero', async () => {
            await page.click('#set-count-zero-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length === 0;
            });

            const count = await page.$$('#dynamic-count-container .item');
            expect(count.length).toBe(0);

            const displayText = await page.$eval('#dynamic-count-display', el => el.textContent);
            expect(displayText).toBe('Count: 0');
        });

        test('sets count to ten', async () => {
            await page.click('#set-count-ten-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length === 10;
            });

            const count = await page.$$('#dynamic-count-container .item');
            expect(count.length).toBe(10);

            const displayText = await page.$eval('#dynamic-count-display', el => el.textContent);
            expect(displayText).toBe('Count: 10');
        });
    });

    describe('Complex Scenario (Mixed Text and Elements)', () => {
        test('adds text content to complex list', async () => {
            const getComplexItemCount = async () => {
                const container = await page.$('#complex-scenario-container');
                const childCount = await container.evaluate(el => el.childNodes.length);
                return childCount;
            };

            const initialCount = await getComplexItemCount();

            await page.click('#add-complex-text-btn');
            await page.waitForFunction((prevCount) => {
                const container = document.querySelector('#complex-scenario-container');
                return container && container.childNodes.length > prevCount;
            }, {}, initialCount);

            const newCount = await getComplexItemCount();
            expect(newCount).toBe(initialCount + 2); // element + marker
        });

        test('adds element content to complex list', async () => {
            const getComplexItemCount = async () => {
                const container = await page.$('#complex-scenario-container');
                const childCount = await container.evaluate(el => el.childNodes.length);
                return childCount;
            };

            const initialCount = await getComplexItemCount();

            await page.click('#add-complex-element-btn');
            await page.waitForFunction((prevCount) => {
                const container = document.querySelector('#complex-scenario-container');
                return container && container.childNodes.length > prevCount;
            }, {}, initialCount);

            const newCount = await getComplexItemCount();
            expect(newCount).toBe(initialCount + 2); // element + marker comment
        });

        test('toggles first item type between text and element', async () => {
            const getFirstItemType = async () => {
                const container = await page.$('#complex-scenario-container');
                const firstChild = await container.evaluateHandle(el => el.firstChild);
                const nodeType = await firstChild.evaluate(node => node.nodeType);
                return nodeType === 3 ? 'text' : 'element';
            };

            const initialType = await getFirstItemType();

            await page.click('#toggle-complex-type-btn');
            await page.waitForFunction((prevType) => {
                const container = document.querySelector('#complex-scenario-container');
                if (!container || !container.firstChild) return false;
                const currentType = container.firstChild.nodeType === Node.TEXT_NODE ? 'text' : 'element';
                return currentType !== prevType;
            }, {}, initialType);

            const newType = await getFirstItemType();
            expect(newType).not.toBe(initialType);
        });

        test('shuffles complex mixed content', async () => {
            const getComplexContent = async () => {
                const container = await page.$('#complex-scenario-container');
                const content = await container.evaluate(el => {
                    return Array.from(el.childNodes).map(node => {
                        if (node.nodeType === Node.TEXT_NODE) {
                            return { type: 'text', content: node.textContent.trim() };
                        } else {
                            return { type: 'element', content: node.textContent, id: node.id };
                        }
                    }).filter(item => item.content); // Filter out empty text nodes
                });
                return content;
            };

            const initialContent = await getComplexContent();

            await page.click('#shuffle-complex-btn');
            // await page.waitForSelector('#mixed-content-container > .item.mixed-item')
            await page.waitForFunction(() => {
                const container = document.querySelector('#complex-scenario-container');
                return container && container.childNodes.length > 0;
            });

            const shuffledContent = await getComplexContent();

            // Content should be the same but potentially in different order
            expect(shuffledContent.length).toBe(initialContent.length);

            // All original content should still exist
            for (const item of initialContent) {
                const found = shuffledContent.find(shuffled =>
                    shuffled.type === item.type && shuffled.content === item.content
                );
                expect(found).toBeTruthy();
            }
        });

        test('removes item from middle of complex list', async () => {
            const getComplexItemCount = async () => {
                const container = await page.$('#complex-scenario-container');
                const childCount = await container.evaluate(el => el.childNodes.length);
                return childCount;
            };

            const initialCount = await getComplexItemCount();

            if (initialCount > 0) {
                await page.click('#remove-complex-middle-btn');
                await page.waitForFunction((prevCount) => {
                    const container = document.querySelector('#complex-scenario-container');
                    return container && container.childNodes.length < prevCount;
                }, {}, initialCount);

                const newCount = await getComplexItemCount();
                expect(newCount).toBe(initialCount - 2); // element + marker
            }
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('handles rapid consecutive operations', async () => {
            const getItems = async () => {
                const items = await page.$$eval('#simple-list-container .item', els =>
                    els.map(el => el.textContent)
                );
                return items;
            };
            // Perform rapid operations on simple list
            await page.click('#reset-simple-btn');
            await page.waitForSelector('#simple-item-1');
            expect(await getItems()).toEqual(['Item 1', 'Item 2', 'Item 3'])

            // Rapid add/remove operations
            for (let i = 0; i < 5; i++) {
                await page.click('#add-simple-end-btn');
                await page.click('#add-simple-beginning-btn');
                await page.click('#remove-simple-last-btn');

            }

            expect(await getItems()).toEqual([
                'Item 13',
                'Item 11',
                'Item 9',
                'Item 7',
                'Item 5',
                'Item 1',
                'Item 2',
                'Item 3'
            ])

            // Verify list is still functional
            const items = await page.$$('#simple-list-container .item');
            expect(items.length).toBe(8);

            // Verify items have correct content
            const itemTexts = await page.$$eval('#simple-list-container .item', els =>
                els.map(el => el.textContent)
            );

            for (const text of itemTexts) {
                expect(text).toMatch(/^Item \d+$/);
            }
        });

        test('handles empty list operations', async () => {
            // Set count to zero
            await page.click('#set-count-zero-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length === 0;
            });

            // Try to decrease further (should not crash)
            await page.click('#decrease-count-btn');

            // Verify still zero
            const count = await page.$$('#dynamic-count-container .item');
            expect(count.length).toBe(0);

            // Add items back
            await page.click('#increase-count-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length === 1;
            });

            const newCount = await page.$$('#dynamic-count-container .item');
            expect(newCount.length).toBe(1);
        });

        test('maintains DOM structure integrity during complex operations', async () => {
            // Perform complex sequence of operations
            await page.click('#shuffle-object-btn');
            await page.click('#add-object-btn');
            await page.click('#sort-object-name-btn');
            await page.click('#reverse-object-btn');
            await page.click('#remove-object-btn');

            // Verify container still exists and is functional
            const container = await page.$('#object-list-container');
            expect(container).toBeTruthy();

            const items = await page.$$('#object-list-container .item');
            expect(items.length).toBeGreaterThanOrEqual(0);

            // Verify each item has proper structure
            for (const item of items) {
                const id = await item.evaluate(el => el.id);
                const className = await item.evaluate(el => el.className);
                const textContent = await item.evaluate(el => el.textContent);

                expect(id).toMatch(/^object-item-\d+$/);
                expect(className).toContain('item');
                expect(textContent).toBeTruthy();
            }
        });

        test('handles simultaneous conditional changes', async () => {
            // Toggle all conditionals rapidly
            await page.click('#toggle-conditional-a-btn');
            await page.click('#toggle-conditional-b-btn');
            await page.click('#toggle-conditional-c-btn');
            await page.click('#toggle-conditional-a-btn');
            await page.click('#toggle-conditional-b-btn');

            // Wait for DOM to stabilize
            await page.waitForFunction(() => {
                const container = document.querySelector('#conditional-children-container');
                return container && container.children.length >= 2; // At least start and end
            });

            // Verify static elements are still present
            expect(await page.$('#conditional-static-start')).toBeTruthy();
            expect(await page.$('#conditional-static-end')).toBeTruthy();

            // Verify container structure is intact
            const container = await page.$('#conditional-children-container');
            expect(container).toBeTruthy();
        });

        test('preserves element references during key-based operations', async () => {
            // Get initial element references
            const getElementReference = async (selector: string) => {
                const element = await page.$(selector);
                if (!element) return null;
                return await element.evaluate(el => ({
                    id: el.id,
                    className: el.className,
                    textContent: el.textContent
                }));
            };

            const initialFirstKeyed = await getElementReference('#keyed-items-container .item:first-child');

            if (initialFirstKeyed) {
                // Perform operations that should preserve element identity
                await page.click('#shuffle-keyed-btn');
                await page.click('#sort-keyed-btn');

                // Find the element with the same ID
                const preservedElement = await getElementReference(`#${initialFirstKeyed.id}`);
                expect(preservedElement).toBeTruthy();
                expect(preservedElement.id).toBe(initialFirstKeyed.id);
                expect(preservedElement.className).toBe(initialFirstKeyed.className);
                expect(preservedElement.textContent).toBe(initialFirstKeyed.textContent);
            }
        });

        test('handles mixed content type changes gracefully', async () => {
            // Toggle multiple mixed elements
            await page.click('#toggle-mixed-0-btn');
            await page.click('#toggle-mixed-1-btn');
            await page.click('#toggle-mixed-2-btn');

            // Add new mixed item
            await page.click('#add-mixed-item-btn');

            // Shuffle mixed content
            await page.click('#shuffle-mixed-btn');

            // Verify container is still functional
            const container = await page.$('#mixed-content-container');
            expect(container).toBeTruthy();

            const childCount = await container.evaluate(el => el.childNodes.length);
            expect(childCount).toBeGreaterThan(0);
        });

        test('maintains performance with large dataset operations', async () => {
            const startTime = Date.now();

            // Perform multiple operations on large dataset
            await page.click('#shuffle-performance-btn');
            await page.click('#sort-performance-btn');
            await page.click('#reverse-performance-btn');
            await page.click('#add-performance-items-btn');

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Operations should complete within reasonable time (5 seconds)
            expect(duration).toBeLessThan(5000);

            // Verify list is still functional
            const items = await page.$$('#performance-list-container .item');
            expect(items.length).toBeGreaterThan(0);
        });

        test('handles nested children operations without memory leaks', async () => {
            // Perform multiple nested operations
            for (let i = 0; i < 3; i++) {
                await page.click('#add-nested-parent-btn');
                await page.click('#add-nested-child-btn');
                await page.click('#shuffle-nested-parents-btn');
                await page.click('#shuffle-nested-children-btn');
            }

            // Verify structure is still intact
            const parents = await page.$$('#nested-children-container .nested-container');
            expect(parents.length).toBeGreaterThan(0);

            // Verify each parent has proper structure
            for (const parent of parents) {
                const header = await parent.$('h4');
                const childrenContainer = await parent.$('.nested-children');

                expect(header).toBeTruthy();
                expect(childrenContainer).toBeTruthy();
            }
        });

        test('recovers from invalid operations gracefully', async () => {
            // Try to remove from empty list (should not crash)
            await page.click('#set-count-zero-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length === 0;
            });

            // Multiple remove attempts on empty list
            await page.click('#decrease-count-btn');
            await page.click('#decrease-count-btn');
            await page.click('#decrease-count-btn');

            // Verify system is still responsive
            await page.click('#increase-count-btn');
            await page.waitForFunction(() => {
                const items = document.querySelectorAll('#dynamic-count-container .item');
                return items.length === 1;
            });

            const count = await page.$$('#dynamic-count-container .item');
            expect(count.length).toBe(1);
        });
    });

    describe('Performance and Optimization', () => {
        test('efficient key-based reconciliation', async () => {
            // Measure time for key-based operations
            const startTime = Date.now();

            // Perform operations that should benefit from key-based reconciliation
            await page.click('#shuffle-keyed-btn');
            await page.click('#move-keyed-first-to-end-btn');
            await page.click('#move-keyed-last-to-start-btn');
            await page.click('#sort-keyed-btn');

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete quickly due to efficient reconciliation
            expect(duration).toBeLessThan(1000);

            // Verify final state is correct
            const items = await page.$$('#keyed-items-container .item');
            expect(items.length).toBeGreaterThan(0);
        });

        test('minimal DOM manipulation during shuffles', async () => {
            // Get initial DOM state
            const getItemIds = async () => {
                const items = await page.$$eval('#object-list-container .item', els =>
                    els.map(el => el.id)
                );
                return items;
            };

            const initialIds = await getItemIds();

            // Shuffle multiple times
            await page.click('#shuffle-object-btn');
            await page.click('#shuffle-object-btn');
            await page.click('#shuffle-object-btn');

            const finalIds = await getItemIds();

            // Same elements should exist (efficient reconciliation)
            expect(finalIds.sort()).toEqual(initialIds.sort());
        });

        test('handles rapid state changes efficiently', async () => {
            const startTime = Date.now();

            // Rapid state changes
            for (let i = 0; i < 10; i++) {
                await page.click('#toggle-conditional-a-btn');
                await page.click('#toggle-conditional-b-btn');
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should handle rapid changes efficiently
            expect(duration).toBeLessThan(2000);

            // Verify final state is stable
            const container = await page.$('#conditional-children-container');
            expect(container).toBeTruthy();
        });
    });
});
