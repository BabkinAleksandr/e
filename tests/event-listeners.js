document.addEventListener('e:init', () => {
    // State for all test scenarios
    const state = createState({
        // Component-level event updates
        showEventComponent: true,
        componentEventType: 'click', // 'click', 'mouseenter', 'focus'

        // Type-level event updates
        elementType: 'button',

        // Attributes-level event updates
        attributesMode: 'single', // 'single', 'multiple', 'mixed'

        // Children-level event updates
        childrenWithEvents: ['child1', 'child2'],

        // Event logs
        eventLog: [],

        // Complex scenarios
        multipleHandlersSameEvent: false,
        eventCapture: false,
        preventDefaultEnabled: false,
        stopPropagationEnabled: false,

        // Form-specific events
        inputValue: '',
        selectValue: 'option1',
        checkboxChecked: false,

        // Rapid event changes
        rapidEventType: 'click',
        rapidCounter: 0
    });

    // Event handler factories
    const createClickHandler = (id) => (e) => {
        state.eventLog.push(`Click: ${id} at ${Date.now()}`);
        if (state.preventDefaultEnabled) e.preventDefault();
        if (state.stopPropagationEnabled) e.stopPropagation();
    };

    const createMouseHandler = (id) => (e) => {
        state.eventLog.push(`Mouse: ${id} (${e.type}) at ${Date.now()}`);
    };

    const createFocusHandler = (id) => (e) => {
        state.eventLog.push(`Focus: ${id} (${e.type}) at ${Date.now()}`);
    };

    const createKeyHandler = (id) => (e) => {
        state.eventLog.push(`Key: ${id} (${e.key}) at ${Date.now()}`);
    };

    const createInputHandler = (id) => (e) => {
        state.eventLog.push(`Input: ${id} (${e.target.value}) at ${Date.now()}`);
        state.inputValue = e.target.value;
    };

    const createChangeHandler = (id) => (e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 'on' : 'off') : e.target.value
        state.eventLog.push(`Change: ${id} (${value}) at ${Date.now()}`);
        if (e.target.type === 'checkbox') {
            state.checkboxChecked = e.target.checked;
        } else {
            state.selectValue = e.target.value;
        }
    };

    // Component-level event updates
    const EventComponent = () => {
        if (!state.showEventComponent) return null;

        const getEventHandler = () => {
            switch (state.componentEventType) {
                case 'click':
                    return createClickHandler('component');
                case 'mouseenter':
                    return createMouseHandler('component');
                case 'focus':
                    return createFocusHandler('component');
                default:
                    return null;
            }
        };

        const getEventAttribute = () => {
            switch (state.componentEventType) {
                case 'click':
                    return 'onclick';
                case 'mouseenter':
                    return 'onmouseenter';
                case 'focus':
                    return 'onfocus';
                default:
                    return 'onclick';
            }
        };

        return e('div', () => ({
            id: 'event-component',
            class: 'test-element',
            tabindex: 0,
            [getEventAttribute()]: getEventHandler()
        }), `Component with ${state.componentEventType} handler`);
    };

    // Type-level event updates
    const TypeEventElement = () => {
        return e(() => state.elementType, {
            id: 'type-event-element',
            class: 'test-element',
            onclick: createClickHandler('type-element'),
            onmouseenter: createMouseHandler('type-element'),
            onfocus: createFocusHandler('type-element'),
            tabindex: () => state.elementType === 'div' ? 0 : undefined
        }, () => `${state.elementType} with events`);
    };

    // Attributes-level event updates
    const AttributesEventElement = () => {
        const getAttributes = () => {
            const base = {
                id: 'attributes-event-element',
                class: 'test-element'
            };

            switch (state.attributesMode) {
                case 'single':
                    return {
                        ...base,
                        onclick: createClickHandler('attributes-single')
                    };
                case 'multiple':
                    return {
                        ...base,
                        onclick: createClickHandler('attributes-multiple'),
                        onmouseenter: createMouseHandler('attributes-multiple'),
                        onfocus: createFocusHandler('attributes-multiple'),
                        tabindex: 0
                    };
                case 'mixed':
                    return {
                        ...base,
                        onclick: createClickHandler('attributes-mixed'),
                        onmouseenter: null, // Explicitly remove handler
                        'data-test': 'mixed-mode'
                    };
                default:
                    return base;
            }
        };

        return e('div', () => getAttributes(), 'Attributes event element');
    };

    // Children-level event updates
    const ChildrenEventElement = () => {
        return e('div', {
            id: 'children-event-container',
            class: 'test-element'
        }, () => state.childrenWithEvents.map(childId =>
            e('button', {
                id: `child-${childId}`,
                key: childId,
                onclick: createClickHandler(`child-${childId}`),
                onmouseenter: createMouseHandler(`child-${childId}`)
            }, `Child ${childId}`)
        ));
    };

    // Form events
    const FormEventsElement = () => {
        return e('div', { id: 'form-events-container' }, [
            e('input', {
                id: 'form-input',
                type: 'text',
                value: () => state.inputValue,
                oninput: createInputHandler('form-input'),
                onchange: createChangeHandler('form-input'),
                onfocus: createFocusHandler('form-input'),
                onblur: createFocusHandler('form-input')
            }),
            e('select', {
                id: 'form-select',
                onchange: createChangeHandler('form-select')
            }, [
                e('option', { value: 'option1', selected: () => state.selectValue === 'option1' }, 'Option 1'),
                e('option', { value: 'option2', selected: () => state.selectValue === 'option2' }, 'Option 2'),
                e('option', { value: 'option3', selected: () => state.selectValue === 'option3' }, 'Option 3')
            ]),
            e('input', {
                id: 'form-checkbox',
                type: 'checkbox',
                checked: () => state.checkboxChecked,
                onchange: createChangeHandler('form-checkbox')
            })
        ]);
    };

    // Rapid event changes
    const RapidEventElement = () => {
        const getHandler = () => {
            switch (state.rapidEventType) {
                case 'click':
                    return createClickHandler(`rapid-${state.rapidCounter}`);
                case 'dblclick':
                    return () => state.eventLog.push(`Double-click: rapid-${state.rapidCounter} at ${Date.now()}`);
                case 'contextmenu':
                    return (e) => {
                        e.preventDefault();
                        state.eventLog.push(`Context: rapid-${state.rapidCounter} at ${Date.now()}`);
                    };
                default:
                    return null;
            }
        };

        return e('button', () => ({
            id: 'rapid-event-element',
            [`on${state.rapidEventType}`]: getHandler()
        }), () => `Rapid event (${state.rapidEventType})`);
    };

    const EventBehaviour = () => (
        e('div', { id: 'event-behavior-test-container' }, [
            e('div', {
                id: 'outer-container',
                onclick: () => state.eventLog.push(`Outer container clicked at ${Date.now()}`),
                style: 'border: 2px solid blue; padding: 20px; margin: 10px;'
            }, [
                e('div', {
                    id: 'middle-container',
                    onclick: () => state.eventLog.push(`Middle container clicked at ${Date.now()}`),
                    style: 'border: 2px solid green; padding: 15px; margin: 10px;'
                }, [
                    e('button', {
                        id: 'inner-button',
                        onclick: (e) => {
                            state.eventLog.push(`Inner button clicked at ${Date.now()}`);
                            if (state.preventDefaultEnabled) e.preventDefault();
                            if (state.stopPropagationEnabled) e.stopPropagation();
                        },
                        style: 'padding: 10px; margin: 5px;'
                    }, 'Click me for event behavior test')
                ])
            ]),
            e('form', {
                id: 'test-form',
                action: "/event-listeners",
                method: "get",
                onsubmit: (e) => {
                    state.eventLog.push(`Form submitted at ${Date.now()}`);
                    if (state.preventDefaultEnabled) e.preventDefault();
                    if (state.stopPropagationEnabled) e.stopPropagation();
                },
                style: 'border: 2px solid orange; padding: 15px; margin: 10px;'
            }, [
                e('input', {
                    id: 'test-input-first-name',
                    type: 'text',
                    name: 'first-name',
                    placeholder: 'First name',
                    style: 'margin: 5px; padding: 5px;',
                    required: true
                }),
                e('input', {
                    id: 'test-input-last-name',
                    type: 'text',
                    name: 'last-name',
                    placeholder: 'Last name',
                    style: 'margin: 5px; padding: 5px;',
                    required: true
                }),
                e('button', {
                    id: 'submit-button',
                    type: 'submit',
                    style: 'margin: 5px; padding: 5px;'
                }, 'Submit Form')
            ]),
            e('a', {
                id: 'test-link',
                href: '#test-anchor',
                onclick: (e) => {
                    state.eventLog.push(`Link clicked at ${Date.now()}`);
                    if (state.preventDefaultEnabled) e.preventDefault();
                    if (state.stopPropagationEnabled) e.stopPropagation();
                },
                style: 'display: block; margin: 10px; padding: 10px; border: 1px solid purple;'
            }, 'Test Link (preventDefault test)'),
            e('div', {
                id: 'test-anchor',
                style: 'height: 20px; background: lightgray; margin: 10px;'
            }, 'Anchor target (scroll here if link works)')
        ])
    )

    // Event log display
    const EventLogDisplay = () => {
        return e('div', { class: 'event-log', id: 'event-log' }, [
            e('h4', 'Event Log:'),
            e('div', () => state.eventLog.slice(-10).map((log) =>
                e('div', { key: `log-${log}` }, log)
            )),
            e('button', {
                id: 'clear-log-btn',
                onclick: () => state.eventLog = []
            }, 'Clear Log')
        ]);
    };

    const App = e('div', [
        EventLogDisplay(),

        e('div', { class: 'test-section' }, [
            e('h2', 'Component-Level Event Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-event-component-btn',
                    onclick: () => state.showEventComponent = true
                }, 'Show Component'),
                e('button', {
                    id: 'hide-event-component-btn',
                    onclick: () => state.showEventComponent = false
                }, 'Hide Component'),
                e('button', {
                    id: 'set-click-event-btn',
                    onclick: () => state.componentEventType = 'click'
                }, 'Set Click'),
                e('button', {
                    id: 'set-mouseenter-event-btn',
                    onclick: () => state.componentEventType = 'mouseenter'
                }, 'Set Mouse Enter'),
                e('button', {
                    id: 'set-focus-event-btn',
                    onclick: () => state.componentEventType = 'focus'
                }, 'Set Focus')
            ]),
            EventComponent
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Type-Level Event Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-button-type-btn',
                    onclick: () => state.elementType = 'button'
                }, 'Set Button'),
                e('button', {
                    id: 'set-div-type-btn',
                    onclick: () => state.elementType = 'div'
                }, 'Set Div'),
                e('button', {
                    id: 'set-input-type-btn',
                    onclick: () => state.elementType = 'input'
                }, 'Set Input')
            ]),
            TypeEventElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Attributes-Level Event Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-single-attrs-btn',
                    onclick: () => state.attributesMode = 'single'
                }, 'Single Event'),
                e('button', {
                    id: 'set-multiple-attrs-btn',
                    onclick: () => state.attributesMode = 'multiple'
                }, 'Multiple Events'),
                e('button', {
                    id: 'set-mixed-attrs-btn',
                    onclick: () => state.attributesMode = 'mixed'
                }, 'Mixed Events')
            ]),
            AttributesEventElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Children-Level Event Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'add-event-child-btn',
                    onclick: () => {
                        const newId = `child${state.childrenWithEvents.length + 1}`;
                        state.childrenWithEvents.push(newId);
                    }
                }, 'Add Child'),
                e('button', {
                    id: 'remove-event-child-btn',
                    onclick: () => {
                        if (state.childrenWithEvents.length > 0) {
                            state.childrenWithEvents.pop();
                        }
                    }
                }, 'Remove Child'),
                e('button', {
                    id: 'shuffle-event-children-btn',
                    onclick: () => {
                        state.childrenWithEvents.sort(() => Math.random() - 0.5);
                    }
                }, 'Shuffle Children')
            ]),
            ChildrenEventElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Form Event Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'reset-form-btn',
                    onclick: () => {
                        state.inputValue = '';
                        state.selectValue = 'option1';
                        state.checkboxChecked = false;
                    }
                }, 'Reset Form')
            ]),
            FormEventsElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Rapid Event Changes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-click-rapid-btn',
                    onclick: () => {
                        state.rapidEventType = 'click';
                        state.rapidCounter++;
                    }
                }, 'Click Event'),
                e('button', {
                    id: 'set-dblclick-rapid-btn',
                    onclick: () => {
                        state.rapidEventType = 'dblclick';
                        state.rapidCounter++;
                    }
                }, 'Double Click'),
                e('button', {
                    id: 'set-contextmenu-rapid-btn',
                    onclick: () => {
                        state.rapidEventType = 'contextmenu';
                        state.rapidCounter++;
                    }
                }, 'Context Menu'),
                e('button', {
                    id: 'rapid-batch-update-btn',
                    onclick: () => {
                        const events = ['click', 'dblclick', 'contextmenu'];
                        events.forEach((eventType, index) => {
                            setTimeout(() => {
                                state.rapidEventType = eventType;
                                state.rapidCounter++;
                            }, index * 100);
                        });
                    }
                }, 'Batch Update')
            ]),
            RapidEventElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Event Behavior Controls'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'prevent-default-on-btn',
                    onclick: () => state.preventDefaultEnabled = true
                }, 'Turn on Prevent Default'),
                e('button', {
                    id: 'prevent-default-off-btn',
                    onclick: () => state.preventDefaultEnabled = false
                }, 'Turn off Prevent Default'),
                e('button', {
                    id: 'stop-propagation-on-btn',
                    onclick: () => state.stopPropagationEnabled = true
                }, 'Turn on Stop Propagation'),
                e('button', {
                    id: 'stop-propagation-off-btn',
                    onclick: () => state.stopPropagationEnabled = false
                }, 'Turn off Stop Propagation')
            ]),
            e('div', { id: 'prevent-default-status' }, () => `Prevent Default: ${state.preventDefaultEnabled ? 'ON' : 'OFF'}`),
            e('div', { id: 'stop-propagation-status' }, () => `Stop Propagation: ${state.stopPropagationEnabled ? 'ON' : 'OFF'}`),
            EventBehaviour()
        ]),
    ]);

    renderApp(App, document.getElementById('container'));
});
