document.addEventListener('e:init', () => {
    const state = createState({
        // Stress testing
        stressComponentCount: 0,
        stressMaxCount: 1000,
        stressRunning: false,

        // Memory leak testing
        memoryTestRunning: false,
        memoryTestCycles: 0,
        memoryTestMaxCycles: 100,

        // Performance monitoring
        performanceStats: {
            renderTime: 0,
            updateTime: 0,
            memoryUsage: 0
        },

        // Circular reference testing
        circularRefTest: false,

        // Deep nesting stress
        deepNestingLevel: 0,
        maxNestingLevel: 50,

        // Rapid state changes
        rapidChangeCounter: 0,
        rapidChangeRunning: false,

        // Large data sets
        largeDataSet: [],
        largeDataSize: 0,

        responsivenessValue: 1
    });

    // Performance monitoring utilities
    const measurePerformance = (fn, label) => {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`${label}: ${end - start}ms`);
        return { result, time: end - start };
    };

    // Stress test component
    const StressTestItem = (index) => {
        return e('div', {
            id: `stress-item-${index}`,
            class: 'stress-item',
            onclick: () => state.performanceStats.renderTime += Math.random(),
            onmouseenter: () => state.performanceStats.updateTime += Math.random(),
            'data-index': index,
            style: () => `background-color: hsl(${index % 360}, 50%, 90%)`
        }, [
            `Stress Item ${index}`,
            e('span', { style: 'font-size: 0.8em; color: #666;' }, ` (${Math.random().toFixed(3)})`)
        ]);
    };

    // Deep nesting component
    const DeepNestingComponent = (level) => {
        if (level >= state.deepNestingLevel) return null;

        return e('div', {
            id: `deep-level-${level}`,
            'data-level': level,
            style: `margin-left: ${level * 10}px; border-left: 1px solid #ccc; padding-left: 5px;`
        }, [
            `Level ${level}`,
            () => DeepNestingComponent(level + 1)
        ]);
    };

    // Memory leak test component
    const MemoryLeakTestComponent = () => {
        if (!state.memoryTestRunning) return null;

        // Create components with complex state and event handlers
        const items = Array.from({ length: 100 }, (_, i) => {
            const itemState = createState({
                value: Math.random(),
                nested: { deep: { value: i } }
            });

            return e('div', {
                key: `memory-test-${i}-${state.memoryTestCycles}`,
                onclick: () => {
                    itemState.value = Math.random();
                    itemState.nested.deep.value = Math.random();
                },
                onmouseenter: () => itemState.nested = { deep: { value: Math.random() } }
            }, () => `Memory Test ${i}: ${itemState.value.toFixed(3)}`);
        });

        return e('div', { id: 'memory-leak-test-container' }, items);
    };

    // Large dataset component
    const LargeDataSetComponent = () => {
        return e('div', { id: 'large-dataset-container', class: 'container' }, () =>
            state.largeDataSet.slice(0, 100).map((item) => // Only render first 100 for visibility
                e('div', {
                    key: item.id,
                    class: 'stress-item',
                    onclick: () => {
                        item.value = Math.random();
                        item.timestamp = Date.now();
                    }
                }, () => `Item ${item.id}: ${item.value.toFixed(3)} (${item.timestamp})`)
            )
        );
    };

    // Circular reference test
    const CircularRefComponent = () => {
        if (!state.circularRefTest) return null;

        // Create intentional circular references to test cleanup
        const obj1 = { name: 'obj1' };
        const obj2 = { name: 'obj2' };
        obj1.ref = obj2;
        obj2.ref = obj1;

        return e('div', {
            id: 'circular-ref-component',
            class: 'container',
            onclick: () => {
                // Force garbage collection test
                obj1.timestamp = Date.now();
                obj2.timestamp = Date.now();
            }
        }, `Circular Ref Test: ${obj1.name} <-> ${obj2.name}`);
    };

    const App = e('div', [
        e('div', { class: 'performance-stats' }, [
            e('h3', 'Performance Stats'),
            e('div', () => `Render Time: ${state.performanceStats.renderTime.toFixed(2)}ms`),
            e('div', () => `Update Time: ${state.performanceStats.updateTime.toFixed(2)}ms`),
            e('div', () => `Memory Usage: ${state.performanceStats.memoryUsage.toFixed(2)}MB`),
            e('button', {
                onclick: () => {
                    state.performanceStats.renderTime = 0;
                    state.performanceStats.updateTime = 0;
                    state.performanceStats.memoryUsage = 0;
                }
            }, 'Reset Stats')
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Stress Testing'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'start-stress-test-btn',
                    onclick: () => {
                        state.stressRunning = true;
                        const interval = setInterval(() => {
                            if (state.stressComponentCount < state.stressMaxCount && state.stressRunning) {
                                state.stressComponentCount += 10;
                            } else {
                                clearInterval(interval);
                                state.stressRunning = false;
                            }
                        }, 100);
                    }
                }, 'Start Stress Test'),
                e('button', {
                    id: 'stop-stress-test-btn',
                    onclick: () => {
                        state.stressRunning = false;
                        state.stressComponentCount = 0;
                    }
                }, 'Stop Stress Test'),
                e('button', {
                    id: 'instant-stress-btn',
                    onclick: () => state.stressComponentCount = 500
                }, 'Instant 500 Components')
            ]),
            e('div', () => `Component Count: ${state.stressComponentCount}`),
            e('div', { id: 'stress-test-container', class: 'container' }, () =>
                Array.from({ length: state.stressComponentCount }, (_, i) => StressTestItem(i))
            )
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Memory Leak Testing'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'start-memory-test-btn',
                    onclick: () => {
                        state.memoryTestRunning = true;
                        const interval = setInterval(() => {
                            if (state.memoryTestCycles < state.memoryTestMaxCycles && state.memoryTestRunning) {
                                state.memoryTestCycles++;
                                // Force component recreation
                                state.memoryTestRunning = false;
                                setTimeout(() => state.memoryTestRunning = true, 10);
                            } else {
                                clearInterval(interval);
                                state.memoryTestRunning = false;
                            }
                        }, 50);
                    }
                }, 'Start Memory Test'),
                e('button', {
                    id: 'stop-memory-test-btn',
                    onclick: () => {
                        state.memoryTestRunning = false;
                        state.memoryTestCycles = 0;
                    }
                }, 'Stop Memory Test'),
                e('button', {
                    id: 'force-gc-btn',
                    onclick: () => {
                        // Trigger potential garbage collection
                        if (window.gc) window.gc();
                        state.performanceStats.memoryUsage = performance.memory ?
                            performance.memory.usedJSHeapSize / 1024 / 1024 : 0;
                    }
                }, 'Force GC')
            ]),
            e('div', { id: 'memory-test-cycles' }, () => `Memory Test Cycles: ${state.memoryTestCycles}`),
            e('div', { class: 'container' }, [
                MemoryLeakTestComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Deep Nesting Stress'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'increase-nesting-btn',
                    onclick: () => state.deepNestingLevel = Math.min(state.deepNestingLevel + 5, state.maxNestingLevel)
                }, 'Increase Nesting'),
                e('button', {
                    id: 'decrease-nesting-btn',
                    onclick: () => state.deepNestingLevel = Math.max(state.deepNestingLevel - 5, 0)
                }, 'Decrease Nesting'),
                e('button', {
                    id: 'max-nesting-btn',
                    onclick: () => state.deepNestingLevel = state.maxNestingLevel
                }, 'Max Nesting')
            ]),
            e('div', () => `Nesting Level: ${state.deepNestingLevel}`),
            e('div', { id: 'deep-nesting-container', class: 'container' }, [
                () => DeepNestingComponent(0)
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Rapid State Changes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'start-rapid-changes-btn',
                    onclick: () => {
                        state.rapidChangeRunning = true;
                        const interval = setInterval(() => {
                            if (state.rapidChangeRunning) {
                                state.rapidChangeCounter++;
                                // Trigger multiple state changes simultaneously
                                state.stressComponentCount = Math.floor(Math.random() * 100);
                                state.deepNestingLevel = Math.floor(Math.random() * 10);
                                state.performanceStats.renderTime += Math.random();
                            } else {
                                clearInterval(interval);
                            }
                        }, 10);
                    }
                }, 'Start Rapid Changes'),
                e('button', {
                    id: 'stop-rapid-changes-btn',
                    onclick: () => state.rapidChangeRunning = false
                }, 'Stop Rapid Changes'),
                e('button', {
                    id: 'reset-rapid-changes-btn',
                    onclick: () => state.rapidChangeCounter = 0
                }, 'Reset Rapid Changes')
            ]),
            e('div', { id: 'rapid-change-counter' }, () => `Rapid Change Counter: ${state.rapidChangeCounter}`)
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Large Dataset Testing'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'create-large-dataset-btn',
                    onclick: () => {
                        const size = 10000;
                        state.largeDataSet = Array.from({ length: size }, (_, i) =>
                        ({
                            id: i,
                            value: Math.random(),
                            timestamp: Date.now(),
                            nested: { data: Math.random() }
                        })
                        );
                        state.largeDataSize = size;
                    }
                }, 'Create 10k Items'),
                e('button', {
                    id: 'shuffle-large-dataset-btn',
                    onclick: () => {
                        if (state.largeDataSet.length > 0) {
                            state.largeDataSet.sort(() => Math.random() - 0.5);
                        }
                    }
                }, 'Shuffle Dataset'),
                e('button', {
                    id: 'clear-large-dataset-btn',
                    onclick: () => {
                        state.largeDataSet = [];
                        state.largeDataSize = 0;
                    }
                }, 'Clear Dataset')
            ]),
            e('div', { id: 'large-dataset-size' }, () => `Dataset Size: ${state.largeDataSize} (showing first 100)`),
            LargeDataSetComponent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Circular Reference Testing'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'enable-circular-ref-btn',
                    onclick: () => state.circularRefTest = true
                }, 'Enable Circular Ref'),
                e('button', {
                    id: 'disable-circular-ref-btn',
                    onclick: () => state.circularRefTest = false
                }, 'Disable Circular Ref')
            ]),
            CircularRefComponent
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Responsiveness testing'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'update-responsive-state',
                    onclick: () => state.responsivenessValue += 1
                }, 'Update value'),
            ]),
            e('div', { id: 'responsiveness-value' }, () => `Responsiveness value: ${state.responsivenessValue}`)
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
