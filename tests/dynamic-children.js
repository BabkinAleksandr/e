document.addEventListener('e:init', () => {
    // State for all test scenarios
    const state = createState({
        // Simple list operations
        simpleItems: ['Item 1', 'Item 2', 'Item 3'],

        // Object-based items with IDs
        objectItems: [
            { id: 1, name: 'Alpha', type: 'a' },
            { id: 2, name: 'Beta', type: 'b' },
            { id: 3, name: 'Gamma', type: 'c' }
        ],

        // Mixed content (text and elements)
        mixedItems: ['Text 1', 'Text 2', 'Text 3'],
        showMixedElements: [false, true, false],

        // Nested children
        nestedItems: [
            { id: 1, name: 'Parent 1', children: ['Child 1.1', 'Child 1.2'] },
            { id: 2, name: 'Parent 2', children: ['Child 2.1'] }
        ],

        // Keyed items for testing key-based reconciliation
        keyedItems: [
            { key: 'a', value: 'Apple' },
            { key: 'b', value: 'Banana' },
            { key: 'c', value: 'Cherry' }
        ],

        // Large list for performance testing
        performanceItems: Array.from({ length: 100 }, (_, i) => ({ id: i, value: `Item ${i}` })),

        // Conditional children
        showConditionalA: true,
        showConditionalB: true,
        showConditionalC: true,

        // Dynamic children count
        dynamicChildrenCount: 3,

        // Complex scenario state
        complexItems: [
            { id: 1, type: 'text', content: 'First' },
            { id: 2, type: 'element', content: 'Second' },
            { id: 3, type: 'text', content: 'Third' }
        ]
    });

    // Helper functions for list operations
    const moveItem = (list, fromIndex, toIndex) => {
        const item = list.splice(fromIndex, 1)[0];
        list.splice(toIndex, 0, item);
    };
    const shuffleArray = (array) => {
        array.sort(() => Math.random() - 0.5)
    };

    // Component definitions
    const SimpleListComponent = () => {
        return e('div', { id: 'simple-list-container' }, () =>
            state.simpleItems.map((item) =>
                e('div', {
                    id: `simple-item-${item.slice(5)}`,
                    class: 'item',
                    key: item
                }, item)
            )
        );
    };

    const ObjectListComponent = () => {
        return e('div', { id: 'object-list-container' }, () =>
            state.objectItems.map(item =>
                e('div', {
                    id: `object-item-${item.id}`,
                    class: `item item-${item.type}`,
                    key: item.id
                }, `${item.name} (${item.type})`)
            )
        );
    };

    const MixedContentComponent = () => {
        return e('div', { id: 'mixed-content-container' }, () =>
            state.mixedItems.map((item, index) => {
                if (state.showMixedElements[index]) {
                    return e('div', {
                        id: `mixed-element-${index}`,
                        class: 'item mixed-item',
                        key: `element-${index}`
                    }, `Element: ${item}`);
                } else {
                    return item;
                }
            })
        );
    };

    const NestedChildrenComponent = () => {
        return e('div', { id: 'nested-children-container' }, () =>
            state.nestedItems.map(parent =>
                e('div', {
                    id: `nested-parent-${parent.id}`,
                    class: 'nested-container',
                    key: parent.id
                }, [
                    e('h4', parent.name),
                    e('div', { class: 'nested-children' }, () =>
                        parent.children.map((child, index) =>
                            e('div', {
                                id: `nested-child-${parent.id}-${index}`,
                                class: 'item',
                                key: `${parent.id}-${child}`
                            }, child)
                        )
                    )
                ])
            )
        );
    };

    const KeyedItemsComponent = () => {
        return e('div', { id: 'keyed-items-container' }, () =>
            state.keyedItems.map(item =>
                e('div', {
                    id: `keyed-item-${item.key}`,
                    class: 'item keyed-item',
                    key: item.key
                }, `${item.key}: ${item.value}`)
            )
        );
    };

    const PerformanceListComponent = () => {
        return e('div', { id: 'performance-list-container' }, () =>
            state.performanceItems.map(item =>
                e('div', {
                    id: `perf-item-${item.id}`,
                    class: 'item performance-item',
                    key: item.id
                }, `${item.id}: ${item.value}`)
            )
        );
    };

    const ConditionalChildrenComponent = () => {
        return e('div', { id: 'conditional-children-container' }, [
            e('div', { id: 'conditional-static-start' }, 'Start'),
            () => state.showConditionalA ? e('div', {
                id: 'conditional-a',
                class: 'item item-a'
            }, 'Conditional A') : null,
            () => state.showConditionalB ? e('div', {
                id: 'conditional-b',
                class: 'item item-b'
            }, 'Conditional B') : null,
            () => state.showConditionalC ? e('div', {
                id: 'conditional-c',
                class: 'item item-c'
            }, 'Conditional C') : null,
            e('div', { id: 'conditional-static-end' }, 'End')
        ]);
    };

    const DynamicChildrenCountComponent = () => {
        return e('div', { id: 'dynamic-count-container' }, () =>
            Array.from({ length: state.dynamicChildrenCount }, (_, index) =>
                e('div', {
                    id: `dynamic-child-${index}`,
                    class: 'item',
                    key: index
                }, `Dynamic Child ${index + 1}`)
            )
        );
    };

    const ComplexScenarioComponent = () => {
        return e('div', { id: 'complex-scenario-container' }, () =>
            state.complexItems.map(item => () => {
                if (item.type === 'text') {
                    return item.content;
                } else {
                    return e('div', {
                        id: `complex-item-${item.id}`,
                        class: 'item',
                        key: item.content
                    }, item.content);
                }
            })
        );
    };

    const App = e('div', [
        e('div', { class: 'test-section' }, [
            e('h2', 'Simple List Operations'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'add-simple-beginning-btn',
                    onclick: () => {
                        const newId = Math.max(...state.simpleItems.map((item) => Number(item.slice(5)))) + 1
                        const newItem = `Item ${newId}`;
                        state.simpleItems.unshift(newItem);
                    }
                }, 'Add to Beginning'),
                e('button', {
                    id: 'add-simple-middle-btn',
                    onclick: () => {
                        const newId = Math.max(...state.simpleItems.map((item) => Number(item.slice(5)))) + 1
                        const newItem = `Item ${newId}`;
                        const middleIndex = Math.floor(state.simpleItems.length / 2);
                        state.simpleItems.splice(middleIndex, 0, newItem)
                    }
                }, 'Add to Middle'),
                e('button', {
                    id: 'add-simple-end-btn',
                    onclick: () => {
                        const newId = Math.max(...state.simpleItems.map((item) => Number(item.slice(5)))) + 1
                        const newItem = `Item ${newId}`;
                        state.simpleItems.push(newItem);
                    }
                }, 'Add to End'),
                e('button', {
                    id: 'remove-simple-first-btn',
                    onclick: () => {
                        if (state.simpleItems.length > 0) {
                            state.simpleItems.splice(0, 1);
                        }
                    }
                }, 'Remove First'),
                e('button', {
                    id: 'remove-simple-middle-btn',
                    onclick: () => {
                        if (state.simpleItems.length > 0) {
                            const middleIndex = Math.floor(state.simpleItems.length / 2);
                            state.simpleItems.splice(middleIndex, 1);
                        }
                    }
                }, 'Remove Middle'),
                e('button', {
                    id: 'remove-simple-last-btn',
                    onclick: () => {
                        if (state.simpleItems.length > 0) {
                            state.simpleItems.splice(state.simpleItems.length - 1, 1);
                        }
                    }
                }, 'Remove Last'),
                e('button', {
                    id: 'reset-simple-btn',
                    onclick: () => {
                        state.simpleItems = ['Item 1', 'Item 2', 'Item 3'];
                    }
                }, 'Reset')
            ]),
            SimpleListComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Object-Based Items'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'add-object-btn',
                    onclick: () => {
                        const newId = Math.max(...state.objectItems.map(item => item.id)) + 1;
                        const types = ['a', 'b', 'c', 'd', 'e'];
                        const names = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta'];
                        const newItem = {
                            id: newId,
                            name: names[newId % names.length],
                            type: types[newId % types.length]
                        };
                        state.objectItems.push(newItem);
                    }
                }, 'Add Object'),
                e('button', {
                    id: 'remove-object-btn',
                    onclick: () => {
                        if (state.objectItems.length > 0) {
                            state.objectItems.splice(0, 1);
                        }
                    }
                }, 'Remove First'),
                e('button', {
                    id: 'sort-object-name-btn',
                    onclick: () => {
                        state.objectItems.sort((a, b) => a.name.localeCompare(b.name))
                    }
                }, 'Sort by Name'),
                e('button', {
                    id: 'sort-object-id-btn',
                    onclick: () => {
                        state.objectItems.sort((a, b) => a.id - b.id)
                    }
                }, 'Sort by ID'),
                e('button', {
                    id: 'shuffle-object-btn',
                    onclick: () => {
                        state.objectItems.sort(() => Math.random() - 0.5)
                    }
                }, 'Shuffle'),
                e('button', {
                    id: 'reverse-object-btn',
                    onclick: () => {
                        state.objectItems.reverse()
                    }
                }, 'Reverse')
            ]),
            ObjectListComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Mixed Content (Text and Elements)'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-mixed-0-btn',
                    onclick: () => {
                        state.showMixedElements[0] = !state.showMixedElements[0];
                    }
                }, 'Toggle First Element'),
                e('button', {
                    id: 'toggle-mixed-1-btn',
                    onclick: () => {
                        state.showMixedElements[1] = !state.showMixedElements[1];
                    }
                }, 'Toggle Second Element'),
                e('button', {
                    id: 'toggle-mixed-2-btn',
                    onclick: () => {
                        state.showMixedElements[2] = !state.showMixedElements[2];
                    }
                }, 'Toggle Third Element'),
                e('button', {
                    id: 'add-mixed-item-btn',
                    onclick: () => {
                        const newText = `Text ${state.mixedItems.length + 1}`;
                        state.mixedItems.push(newText);
                        state.showMixedElements.push(false);
                    }
                }, 'Add Mixed Item'),
                e('button', {
                    id: 'shuffle-mixed-btn',
                    onclick: () => {
                        const indices = state.mixedItems.map((_, i) => i);
                        shuffleArray(indices);

                        state.mixedItems = indices.map(i => state.mixedItems[i]);
                        state.showMixedElements = indices.map(i => state.showMixedElements[i]);
                    }
                }, 'Shuffle Mixed')
            ]),
            MixedContentComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Nested Children'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'add-nested-parent-btn',
                    onclick: () => {
                        const newId = Math.max(...state.nestedItems.map(item => item.id)) + 1;
                        const newParent = {
                            id: newId,
                            name: `Parent ${newId}`,
                            children: [`Child ${newId}.1`]
                        };
                        state.nestedItems.push(newParent);
                    }
                }, 'Add Parent'),
                e('button', {
                    id: 'add-nested-child-btn',
                    onclick: () => {
                        if (state.nestedItems.length > 0) {
                            const parentIndex = 0;
                            const parent = state.nestedItems[parentIndex];
                            const newChild = `Child ${parent.id}.${parent.children.length + 1}`;
                            parent.children.push(newChild);
                        }
                    }
                }, 'Add Child to First Parent'),
                e('button', {
                    id: 'remove-nested-child-btn',
                    onclick: () => {
                        if (state.nestedItems.length > 0 && state.nestedItems[0].children.length > 0) {
                            const parent = state.nestedItems[0];
                            parent.children.splice(parent.children.length - 1, 1);
                        }
                    }
                }, 'Remove Last Child'),
                e('button', {
                    id: 'shuffle-nested-parents-btn',
                    onclick: () => {
                        shuffleArray(state.nestedItems);
                    }
                }, 'Shuffle Parents'),
                e('button', {
                    id: 'shuffle-nested-children-btn',
                    onclick: () => {
                        if (state.nestedItems.length > 0) {
                            const parent = state.nestedItems[0];
                            shuffleArray(parent.children);
                        }
                    }
                }, 'Shuffle First Parent Children')
            ]),
            NestedChildrenComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Keyed Items (Key-based Reconciliation)'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'add-keyed-item-btn',
                    onclick: () => {
                        const keys = ['d', 'e', 'f', 'g', 'h'];
                        const values = ['Date', 'Elderberry', 'Fig', 'Grape', 'Honeydew'];
                        const existingKeys = state.keyedItems.map(item => item.key);
                        const availableKeys = keys.filter(key => !existingKeys.includes(key));

                        if (availableKeys.length > 0) {
                            const newKey = availableKeys[0];
                            const newValue = values[keys.indexOf(newKey)];
                            const newItem = { key: newKey, value: newValue };
                            state.keyedItems.push(newItem);
                        }
                    }
                }, 'Add Keyed Item'),
                e('button', {
                    id: 'remove-keyed-middle-btn',
                    onclick: () => {
                        if (state.keyedItems.length > 0) {
                            const middleIndex = Math.floor(state.keyedItems.length / 2);
                            state.keyedItems.splice(middleIndex, 1);
                        }
                    }
                }, 'Remove Middle'),
                e('button', {
                    id: 'move-keyed-first-to-end-btn',
                    onclick: () => {
                        if (state.keyedItems.length > 1) {
                            moveItem(state.keyedItems, 0, state.keyedItems.length - 1);
                        }
                    }
                }, 'Move First to End'),
                e('button', {
                    id: 'move-keyed-last-to-start-btn',
                    onclick: () => {
                        if (state.keyedItems.length > 1) {
                            moveItem(state.keyedItems, state.keyedItems.length - 1, 0);
                        }
                    }
                }, 'Move Last to Start'),
                e('button', {
                    id: 'shuffle-keyed-btn',
                    onclick: () => {
                        shuffleArray(state.keyedItems);
                    }
                }, 'Shuffle Keyed'),
                e('button', {
                    id: 'sort-keyed-btn',
                    onclick: () => {
                        state.keyedItems = [...state.keyedItems].sort((a, b) => a.key.localeCompare(b.key));
                    }
                }, 'Sort by Key')
            ]),
            KeyedItemsComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Performance List (Large Dataset)'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'shuffle-performance-btn',
                    onclick: () => {
                        shuffleArray(state.performanceItems);
                    }
                }, 'Shuffle All'),
                e('button', {
                    id: 'sort-performance-btn',
                    onclick: () => {
                        state.performanceItems.sort((a, b) => a.id - b.id);
                    }
                }, 'Sort by ID'),
                e('button', {
                    id: 'reverse-performance-btn',
                    onclick: () => {
                        state.performanceItems.reverse();
                    }
                }, 'Reverse'),
                e('button', {
                    id: 'add-performance-items-btn',
                    onclick: () => {
                        const startId = state.performanceItems.length;
                        const newItems = Array.from({ length: 10 }, (_, i) => ({
                            id: startId + i,
                            value: `Item ${startId + i}`
                        }));
                        state.performanceItems.push(...newItems)
                    }
                }, 'Add 10 Items'),
                e('button', {
                    id: 'remove-performance-items-btn',
                    onclick: () => {
                        if (state.performanceItems.length >= 10) {
                            state.performanceItems.splice(Math.max(state.performanceItems.length - 11, 0), 10)
                        }
                    }
                }, 'Remove 10 Items')
            ]),
            PerformanceListComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Conditional Children'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-conditional-a-btn',
                    onclick: () => {
                        state.showConditionalA = !state.showConditionalA;
                    }
                }, 'Toggle A'),
                e('button', {
                    id: 'toggle-conditional-b-btn',
                    onclick: () => {
                        state.showConditionalB = !state.showConditionalB;
                    }
                }, 'Toggle B'),
                e('button', {
                    id: 'toggle-conditional-c-btn',
                    onclick: () => {
                        state.showConditionalC = !state.showConditionalC;
                    }
                }, 'Toggle C'),
                e('button', {
                    id: 'show-all-conditional-btn',
                    onclick: () => {
                        state.showConditionalA = true;
                        state.showConditionalB = true;
                        state.showConditionalC = true;
                    }
                }, 'Show All'),
                e('button', {
                    id: 'hide-all-conditional-btn',
                    onclick: () => {
                        state.showConditionalA = false;
                        state.showConditionalB = false;
                        state.showConditionalC = false;
                    }
                }, 'Hide All')
            ]),
            ConditionalChildrenComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Dynamic Children Count'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'increase-count-btn',
                    onclick: () => {
                        state.dynamicChildrenCount++;
                    }
                }, 'Increase Count'),
                e('button', {
                    id: 'decrease-count-btn',
                    onclick: () => {
                        if (state.dynamicChildrenCount > 0) {
                            state.dynamicChildrenCount--;
                        }
                    }
                }, 'Decrease Count'),
                e('button', {
                    id: 'set-count-zero-btn',
                    onclick: () => {
                        state.dynamicChildrenCount = 0;
                    }
                }, 'Set to Zero'),
                e('button', {
                    id: 'set-count-ten-btn',
                    onclick: () => {
                        state.dynamicChildrenCount = 10;
                    }
                }, 'Set to Ten')
            ]),
            DynamicChildrenCountComponent(),
            e('div', { id: 'dynamic-count-display' }, () => `Count: ${state.dynamicChildrenCount}`)
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Complex Scenario (Mixed Text and Elements)'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'add-complex-text-btn',
                    onclick: (() => {
                        let nextId = Math.max(...state.complexItems.map(item => item.id)) + 1;

                        return () => {
                            const newItem = {
                                id: nextId,
                                type: 'text',
                                content: `Text ${nextId}`
                            };
                            state.complexItems.push(newItem);
                            console.log('[STATE] complexItems', state.complexItems)
                            nextId++
                        }
                    })()
                }, 'Add Text'),
                e('button', {
                    id: 'add-complex-element-btn',
                    onclick: (() => {
                        let nextId = Math.max(...state.complexItems.map(item => item.id)) + 1;

                        return () => {
                            const newItem = {
                                id: nextId,
                                type: 'element',
                                content: `Element ${nextId}`
                            };
                            state.complexItems.push(newItem);
                            console.log('[STATE] complexItems', state.complexItems)
                            nextId++
                        }
                    })()
                }, 'Add Element'),
                e('button', {
                    id: 'toggle-complex-type-btn',
                    onclick: () => {
                        if (state.complexItems.length > 0) {
                            const item = state.complexItems[0];
                            item.type = item.type === 'text' ? 'element' : 'text';
                        }
                    }
                }, 'Toggle First Type'),
                e('button', {
                    id: 'shuffle-complex-btn',
                    onclick: () => {
                        shuffleArray(state.complexItems);
                    }
                }, 'Shuffle Complex'),
                e('button', {
                    id: 'remove-complex-middle-btn',
                    onclick: () => {
                        if (state.complexItems.length > 0) {
                            const middleIndex = Math.floor(state.complexItems.length / 2);
                            state.complexItems.splice(middleIndex, 1);
                        }
                    }
                }, 'Remove Middle')
            ]),
            ComplexScenarioComponent()
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
