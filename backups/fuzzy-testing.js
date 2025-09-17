document.addEventListener('e:init', () => {
    const state = createState({
        fuzzyTestRunning: false,
        fuzzyTestResults: [],
        fuzzyTestCount: 0,
        maxFuzzyTests: 1000,

        // Random state for fuzzy testing
        randomState: {
            componentType: 'div',
            attributes: {},
            children: [],
            eventHandlers: {}
        }
    });

    // Fuzzy test generators
    const generateRandomString = (length = 10) => {
        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
        return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const generateRandomElementType = () => {
        const validTypes = ['div', 'span', 'p', 'button', 'input', 'select', 'textarea', 'h1', 'h2', 'section', 'article'];
        const invalidTypes = [null, undefined, 123, {}, [], Symbol('test'), generateRandomString()];
        const allTypes = [...validTypes, ...invalidTypes];
        return allTypes[Math.floor(Math.random() * allTypes.length)];
    };

    const generateRandomAttributes = () => {
        const attrs = {};
        const attrCount = Math.floor(Math.random() * 10);

        for (let i = 0; i < attrCount; i++) {
            const key = Math.random() > 0.7 ? generateRandomString(5) : ['id', 'class', 'style', 'data-test'][Math.floor(Math.random() * 4)];
            const value = [
                generateRandomString(),
                Math.random() * 1000,
                Math.random() > 0.5,
                null,
                undefined,
                {},
                [],
                () => generateRandomString()
            ][Math.floor(Math.random() * 8)];

            attrs[key] = value;
        }

        return attrs;
    };

    const generateRandomChildren = (depth = 0) => {
        if (depth > 5) return [];

        const childCount = Math.floor(Math.random() * 5);
        const children = [];

        for (let i = 0; i < childCount; i++) {
            const childType = Math.random();

            if (childType < 0.3) {
                // Text node
                children.push(generateRandomString());
            } else if (childType < 0.6) {
                // Simple element
                children.push(e(generateRandomElementType(), generateRandomAttributes(), generateRandomString()));
            } else if (childType < 0.8) {
                // Nested element
                children.push(e(generateRandomElementType(), generateRandomAttributes(), generateRandomChildren(depth + 1)));
            } else {
                // Invalid child
                children.push([null, undefined, 123, {}, Symbol('test')][Math.floor(Math.random() * 5)]);
            }
        }

        return children;
    };

    // Fuzzy test runner
    const runFuzzyTest = () => {
        try {
            const componentType = generateRandomElementType();
            const attributes = generateRandomAttributes();
            const children = generateRandomChildren();

            // Add random event handlers
            if (Math.random() > 0.5) {
                attributes.onclick = () => state.fuzzyTestResults.push(`Random click at ${Date.now()}`);
            }
            if (Math.random() > 0.7) {
                attributes.onmouseenter = () => state.fuzzyTestResults.push(`Random mouse at ${Date.now()}`);
            }

            // Try to create and render the component
            const component = e(componentType, attributes, children);

            // Update random state
            state.randomState = {
                componentType,
                attributes: JSON.stringify(attributes, null, 2).substring(0, 100),
                children: children.length,
                eventHandlers: Object.keys(attributes).filter(k => k.startsWith('on')).length
            };

            state.fuzzyTestResults.push(`Test ${state.fuzzyTestCount}: SUCCESS`);
            return component;
        } catch (error) {
            state.fuzzyTestResults.push(`Test ${state.fuzzyTestCount}: ERROR - ${error.message}`);
            return e('div', { style: 'color: red;' }, `Fuzzy test error: ${error.message}`);
        }
    };

    const FuzzyTestComponent = () => {
        if (!state.fuzzyTestRunning) return null;
        return runFuzzyTest();
    };

    const App = e('div', [
        e('div', { class: 'test-section' }, [
            e('h2', 'Fuzzy Testing'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'start-fuzzy-test-btn',
                    onclick: () => {
                        state.fuzzyTestRunning = true;
                        state.fuzzyTestCount = 0;
                        state.fuzzyTestResults = [];

                        const interval = setInterval(() => {
                            if (state.fuzzyTestCount < state.maxFuzzyTests && state.fuzzyTestRunning) {
                                state.fuzzyTestCount++;
                                // Force component recreation for each test
                                state.fuzzyTestRunning = false;
                                setTimeout(() => state.fuzzyTestRunning = true, 10);
                            } else {
                                clearInterval(interval);
                                state.fuzzyTestRunning = false;
                            }
                        }, 1000);
                    }
                }, 'Start Fuzzy Test'),
                e('button', {
                    id: 'stop-fuzzy-test-btn',
                    onclick: () => state.fuzzyTestRunning = false
                }, 'Stop Fuzzy Test'),
                e('button', {
                    id: 'single-fuzzy-test-btn',
                    onclick: () => {
                        state.fuzzyTestCount++;
                        state.fuzzyTestRunning = true;
                        // setTimeout(() => {
                        //     state.fuzzyTestRunning = true;
                        //     setTimeout(() => state.fuzzyTestRunning = false, 100);
                        // }, 10);
                    }
                }, 'Single Test')
            ]),
            e('div', () => `Test Count: ${state.fuzzyTestCount}/${state.maxFuzzyTests}`),
            e('div', { style: 'max-height: 200px; overflow-y: auto; background: #f5f5f5; padding: 10px;' }, () => [
                e('h4', 'Test Results:'),
                ...state.fuzzyTestResults.slice(-10).map((result, index) =>
                    e('div', { key: `result-${index}` }, result)
                )
            ]),
            e('div', [
                e('h4', 'Current Random State:'),
                e('pre', { style: 'font-size: 0.8em; background: #f0f0f0; padding: 5px;' }, () =>
                    JSON.stringify(state.randomState, null, 2)
                )
            ]),
            e('div', { id: 'fuzzy-test-container', style: 'border: 2px dashed #ccc; padding: 10px; min-height: 100px;' }, [
                FuzzyTestComponent
            ])
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
