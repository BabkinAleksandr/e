document.addEventListener('e:init', () => {
    const state = createState({
        // Error testing
        throwError: false,
        errorInRender: false,
        errorInEvent: false,

        // Null/undefined testing
        nullComponent: false,
        undefinedComponent: false,
        nullAttributes: false,
        nullChildren: false,

        // Invalid data testing
        invalidType: false,
        invalidAttributes: false,
        invalidChildren: false,

        // Timing edge cases
        asyncComponent: false,
        delayedUpdate: false,

        // DOM manipulation edge cases
        externalDOMChanges: false,

        // State corruption testing
        corruptState: false,

        // Extreme values
        extremeValues: false,

        // Error log
        errorLog: []
    });

    const refs = {
        external: r()
    }


    const ErrorBoundary = (children) => {
        return errb(children, (err) => {
            state.errorLog.push(`Error caught: ${err.message} at ${Date.now()}`);
            return e('div', { class: 'error-boundary' }, `Error: ${err.message}`)
        })
    };

    // Components that can throw errors
    const ErrorThrowingComponent = () => {
        if (state.throwError) {
            throw new Error('Intentional error in component');
        }
        return e('div', { id: 'error-throwing-component' }, 'No error thrown');
    };

    const RenderErrorComponent = () => {
        if (state.errorInRender) {
            // This should cause a render error
            return e(undefined, {}, 'Invalid element type');
        }
        return e('div', { id: 'render-error-component' }, 'Render OK');
    };

    const EventErrorComponent = () => {
        return e('button', {
            id: 'event-error-component',
            onclick: () => {
                if (state.errorInEvent) {
                    throw new Error('Error in event handler');
                }
                state.errorLog.push('Event executed successfully');
            }
        }, 'Click me (might throw error)');
    };

    // Null/undefined components
    const NullComponent = () => {
        if (state.nullComponent) return null;
        return e('div', { id: 'null-component' }, 'Not null');
    };

    const UndefinedComponent = () => {
        if (state.undefinedComponent) return undefined;
        return e('div', { id: 'undefined-component' }, 'Not undefined');
    };

    // Invalid data components
    const InvalidTypeComponent = () => {
        if (state.invalidType) {
            return e(123, {}, 'Invalid type'); // Number as element type
        }
        return e('div', { id: 'invalid-type-component' }, 'Valid type');
    };

    const InvalidAttributesComponent = () => {
        if (state.invalidAttributes) {
            return e('div', {
                id: 'invalid-attributes-component',
                [Symbol('invalid')]: 'symbol key',
                [{}]: 'object key',
                onclick: 'not a function' // String instead of function
            }, 'Invalid attributes');
        }
        return e('div', { id: 'invalid-attributes-component' }, 'Valid attributes');
    };

    const InvalidChildrenComponent = () => {
        if (state.invalidChildren) {
            return e('div', { id: 'invalid-children-component' }, [
                'Valid child',
                123, // Number as child
                {}, // Object as child
                Symbol('invalid'), // Symbol as child
                null,
                undefined
            ]);
        }
        return e('div', { id: 'invalid-children-component' }, 'Valid children');
    };

    // Async component
    const AsyncComponent = () => {
        if (!state.asyncComponent) return null;

        // Simulate async behavior
        setTimeout(() => {
            state.delayedUpdate = true;
        }, 1000);

        return e('div', { id: 'async-component' }, () =>
            state.delayedUpdate ? 'Async update completed' : 'Waiting for async update...'
        );
    };

    // External DOM manipulation test
    const ExternalDOMComponent = () => {
        if (!state.externalDOMChanges) return null;

        return e('div', {
            id: 'external-dom-component',
            ref: refs.external,
        }, 'Original content')
            .with(() => {
                // Simulate external DOM manipulation
                setTimeout(() => {
                    if (refs.external) {
                        refs.external.ref.innerHTML = '<span>Externally modified</span>';
                        refs.external.ref.setAttribute('data-external', 'true');
                    }
                }, 50);
            })
    };

    // State corruption test
    const StateCorruptionComponent = () => {
        if (!state.corruptState) return null;

        // Try to corrupt the state object
        try {
            Object.defineProperty(state, '__corrupted', {
                get() { throw new Error('Corrupted state access'); }
            });
        } catch (e) {
            state.errorLog.push(`State corruption attempt: ${e.message}`);
        }

        return e('div', { id: 'state-corruption-component' }, 'State corruption test');
    };

    // Extreme values test
    const ExtremeValuesComponent = () => {
        if (!state.extremeValues) return null;

        const extremeString = 'x'.repeat(10000);
        const extremeNumber = Number.MAX_SAFE_INTEGER;

        return e('div', {
            id: 'extreme-values-component',
            'data-extreme-string': extremeString.substring(0, 100) + '...',
            'data-extreme-number': extremeNumber,
            style: `z-index: ${extremeNumber}; font-size: 1px;`
        }, `Extreme values: ${extremeString.substring(0, 50)}... (${extremeNumber})`);
    };

    const App = e('div', [
        e('div', { class: 'warning' }, [
            e('h3', 'Warning'),
            e('p', 'These tests intentionally trigger errors and edge cases. Check console for detailed error information.'),
            e('div', { id: 'error-log' }, () => [
                e('h4', 'Error Log:'),
                ...state.errorLog.slice(-5).map((log, index) =>
                    e('div', { key: `error-${index}` }, log)
                ),
                e('button', { onclick: () => state.errorLog.length = 0 }, 'Clear Log')
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Error Throwing Tests'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-component-error-btn',
                    onclick: () => state.throwError = !state.throwError
                }, () => `Component Error: ${state.throwError ? 'ON' : 'OFF'}`),
                e('button', {
                    id: 'trigger-render-error-btn',
                    onclick: () => state.errorInRender = !state.errorInRender
                }, () => `Render Error: ${state.errorInRender ? 'ON' : 'OFF'}`),
                e('button', {
                    id: 'trigger-event-error-btn',
                    onclick: () => state.errorInEvent = !state.errorInEvent
                }, () => `Event Error: ${state.errorInEvent ? 'ON' : 'OFF'}`)
            ]),
            ErrorBoundary(ErrorThrowingComponent),
            ErrorBoundary(RenderErrorComponent),
            ErrorBoundary(EventErrorComponent)
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Null/Undefined Tests'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-null-component-btn',
                    onclick: () => state.nullComponent = !state.nullComponent
                }, () => `Null Component: ${state.nullComponent ? 'ON' : 'OFF'}`),
                e('button', {
                    id: 'toggle-undefined-component-btn',
                    onclick: () => state.undefinedComponent = !state.undefinedComponent
                }, () => `Undefined Component: ${state.undefinedComponent ? 'ON' : 'OFF'}`)
            ]),
            NullComponent,
            UndefinedComponent
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Invalid Data Tests'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-invalid-type-btn',
                    onclick: () => state.invalidType = !state.invalidType
                }, () => `Invalid Type: ${state.invalidType ? 'ON' : 'OFF'}`),
                e('button', {
                    id: 'toggle-invalid-attributes-btn',
                    onclick: () => state.invalidAttributes = !state.invalidAttributes
                }, () => `Invalid Attributes: ${state.invalidAttributes ? 'ON' : 'OFF'}`),
                e('button', {
                    id: 'toggle-invalid-children-btn',
                    onclick: () => state.invalidChildren = !state.invalidChildren
                }, () => `Invalid Children: ${state.invalidChildren ? 'ON' : 'OFF'}`)
            ]),
            ErrorBoundary(InvalidTypeComponent),
            ErrorBoundary(InvalidAttributesComponent),
            ErrorBoundary(InvalidChildrenComponent)
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Timing Edge Cases'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-async-component-btn',
                    onclick: () => {
                        state.asyncComponent = !state.asyncComponent;
                        state.delayedUpdate = false;
                    }
                }, () => `Async Component: ${state.asyncComponent ? 'ON' : 'OFF'}`)
            ]),
            AsyncComponent
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'DOM Manipulation Edge Cases'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-external-dom-btn',
                    onclick: () => state.externalDOMChanges = !state.externalDOMChanges
                }, () => `External DOM: ${state.externalDOMChanges ? 'ON' : 'OFF'}`)
            ]),
            ExternalDOMComponent
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'State Corruption Tests'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-state-corruption-btn',
                    onclick: () => state.corruptState = !state.corruptState
                }, () => `State Corruption: ${state.corruptState ? 'ON' : 'OFF'}`)
            ]),
            StateCorruptionComponent
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Extreme Values Tests'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-extreme-values-btn',
                    onclick: () => state.extremeValues = !state.extremeValues
                }, () => `Extreme Values: ${state.extremeValues ? 'ON' : 'OFF'}`)
            ]),
            ExtremeValuesComponent
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
