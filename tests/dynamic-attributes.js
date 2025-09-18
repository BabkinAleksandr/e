document.addEventListener('e:init', () => {
    // State for all test scenarios
    const state = createState({
        // Whole attributes object updates
        wholeAttrsMode: 'initial',

        // Individual attribute updates
        singleClass: 'initial-style',
        singleId: 'element-1',
        singleTitle: 'Initial title',
        singleDataValue: 'initial-data',
        singleStyle: { backgroundColor: 'red', padding: '10px' },
        singleHidden: false,
        singleDisabled: false,
        singleRequired: false,
        singleChecked: false,
        singleValue: 'initial value',
        singlePlaceholder: 'Initial placeholder',
        singleTabIndex: 1,
        singleAriaLabel: 'Initial aria label',
        singleRole: 'button',

        // Event tracking
        clickCount: 0,
        lastClickHandler: '',
        mouseEnterCount: 0,
        lastMouseHandler: '',
        inputValue: '',
        lastInputHandler: '',
        changeValue: '',
        lastChangeHandler: '',

        // Complex scenarios
        multipleAttrsMode: 'mode1',
        conditionalAttrs: true,
        dynamicAttrsCount: 1,

        // Form-specific attributes
        formInputType: 'text',
        formInputName: 'input1',
        formInputRequired: false,
        formInputDisabled: false,
        formInputReadonly: false,
        formInputMin: 0,
        formInputMax: 100,
        formInputStep: 1,

        // Media attributes
        mediaAutoplay: false,
        mediaControls: true,
        mediaLoop: false,
        mediaMuted: false,

        // Custom attributes
        customAttr1: 'value1',
        customAttr2: 'value2',
        customDataAttr: 'custom-data',

        // Style object updates
        styleMode: 'red',

        // Class list updates
        classListMode: 'single',

        // Rapid updates
        rapidUpdateCounter: 0,

        // Null/undefined handling
        nullableAttr: 'value',
        undefinedAttr: 'value'
    });

    // Event handlers
    const eventHandlers = {
        click: () => {
            state.clickCount++;
        },
        mouseenter: () => {
            state.mouseEnterCount++;
        },
        input: (e) => {
            state.inputValue = e.target.value;
            state.singleValue = e.target.value;
        },
        change: (e) => {
            state.changeValue = e.target.value;
            state.singleValue = e.target.value;
        }
    };

    // Helper components
    const WholeAttributesElement = () => {
        const getAttrs = () => {
            switch (state.wholeAttrsMode) {
                case 'initial':
                    return {
                        id: 'whole-attrs-element',
                        class: 'initial-style',
                        title: 'Initial title',
                        'data-test': 'initial',
                        tabindex: 1
                    };
                case 'updated':
                    return {
                        id: 'whole-attrs-element-updated',
                        class: 'updated-style',
                        title: 'Updated title',
                        'data-test': 'updated',
                        'data-new': 'new-attribute',
                        tabindex: 2,
                        role: 'button'
                    };
                case 'minimal':
                    return {
                        id: 'whole-attrs-element-minimal',
                        class: 'test-element'
                    };
                case 'empty':
                    return {};
                default:
                    return { id: 'whole-attrs-element' };
            }
        };

        return e('div', () => getAttrs(), 'Whole attributes element');
    };

    const SingleAttributeElement = () => {
        return e('div', {
            id: () => state.singleId,
            class: () => state.singleClass,
            title: () => state.singleTitle,
            'data-value': () => state.singleDataValue,
            style: () => state.singleStyle,
            hidden: () => state.singleHidden,
            tabindex: () => state.singleTabIndex,
            'aria-label': () => state.singleAriaLabel,
            role: () => state.singleRole
        }, 'Single attribute element');
    };

    const FormElement = () => {
        return e('input', {
            id: 'form-element',
            type: () => state.formInputType,
            name: () => state.formInputName,
            required: () => state.formInputRequired,
            disabled: () => state.formInputDisabled,
            readOnly: () => state.formInputReadonly,
            min: () => state.formInputMin,
            max: () => state.formInputMax,
            step: () => state.formInputStep,
            placeholder: () => state.singlePlaceholder,
            value: () => state.singleValue,
            oninput: (e) => eventHandlers.input(e),
            onchange: (e) => eventHandlers.change(e)
        });
    };

    const MediaElement = () => {
        return e('video', {
            id: 'media-element',
            autoplay: () => state.mediaAutoplay,
            controls: () => state.mediaControls,
            loop: () => state.mediaLoop,
            muted: () => state.mediaMuted,
            width: 200,
            height: 150
        }, [
            e('source', { src: 'test.mp4', type: 'video/mp4' }),
            'Your browser does not support video.'
        ]);
    };

    const CustomAttributesElement = () => {
        return e('div', {
            id: 'custom-attrs-element',
            'data-custom': () => state.customDataAttr,
            'custom-attr-1': () => state.customAttr1,
            'custom-attr-2': () => state.customAttr2,
            'aria-custom': () => `custom-${state.customAttr1}`
        }, 'Custom attributes element');
    };

    const StyleObjectElement = () => {
        const getStyle = () => {
            switch (state.styleMode) {
                case 'red':
                    return { backgroundColor: 'red', padding: '10px', border: '1px solid black' };
                case 'blue':
                    return { backgroundColor: 'blue', padding: '20px', border: '2px solid white', color: 'white' };
                case 'green':
                    return { backgroundColor: 'green', margin: '10px', borderRadius: '5px' };
                case 'complex':
                    return {
                        backgroundColor: 'purple',
                        padding: '15px',
                        margin: '5px',
                        border: '3px dashed yellow',
                        borderRadius: '10px',
                        color: 'white',
                        fontSize: '18px',
                        fontWeight: 'bold'
                    };
                default:
                    return {};
            }
        };

        return e('div', {
            id: 'style-object-element',
            style: () => getStyle()
        }, 'Style object element');
    };

    const ClassListElement = () => {
        const getClass = () => {
            switch (state.classListMode) {
                case 'single':
                    return 'test-element';
                case 'multiple':
                    return 'test-element dynamic-class';
                case 'different':
                    return 'another-class dynamic-class';
                case 'empty':
                    return '';
                default:
                    return 'test-element';
            }
        };

        return e('div', {
            id: 'class-list-element',
            class: () => getClass()
        }, 'Class list element');
    };

    const MultipleAttributesElement = () => {
        const getAttrs = () => {
            switch (state.multipleAttrsMode) {
                case 'mode1':
                    return {
                        id: 'multiple-attrs-element',
                        class: 'test-element',
                        title: 'Mode 1',
                        'data-mode': 'mode1',
                        tabindex: 1,
                        role: 'button'
                    };
                case 'mode2':
                    return {
                        id: 'multiple-attrs-element',
                        class: 'test-element dynamic-class',
                        title: 'Mode 2',
                        'data-mode': 'mode2',
                        'data-extra': 'extra-value',
                        tabindex: 2,
                        role: 'tab',
                        'aria-selected': 'true'
                    };
                case 'mode3':
                    return {
                        id: 'multiple-attrs-element',
                        class: 'another-class',
                        title: 'Mode 3',
                        'data-mode': 'mode3',
                        tabindex: 3,
                        hidden: true
                    };
                default:
                    return { id: 'multiple-attrs-element' };
            }
        };

        return e('div', () => getAttrs(), 'Multiple attributes element');
    };

    const ConditionalAttributesElement = () => {
        const getAttrs = () => {
            const baseAttrs = {
                id: 'conditional-attrs-element',
                class: 'test-element'
            };

            if (state.conditionalAttrs) {
                return {
                    ...baseAttrs,
                    title: 'Conditional title',
                    'data-conditional': 'true',
                    role: 'button',
                    tabindex: 0
                };
            }

            return baseAttrs;
        };

        return e('div', () => getAttrs(), 'Conditional attributes element');
    };

    const DynamicAttributesElement = () => {
        const getAttrs = () => {
            const attrs = {
                id: 'dynamic-attrs-element',
                class: 'test-element'
            };

            for (let i = 1; i <= state.dynamicAttrsCount; i++) {
                attrs[`data-dynamic-${i}`] = `value-${i}`;
            }

            return attrs;
        };

        return e('div', () => getAttrs(), 'Dynamic attributes element');
    };

    const RapidUpdateElement = () => {
        return e('div', {
            id: 'rapid-update-element',
            'data-counter': () => state.rapidUpdateCounter,
            class: () => state.rapidUpdateCounter % 2 === 0 ? 'test-element' : 'dynamic-class',
            title: () => `Counter: ${state.rapidUpdateCounter}`
        }, () => `Rapid update: ${state.rapidUpdateCounter}`);
    };

    const NullableAttributesElement = () => {
        return e('div', {
            id: 'nullable-attrs-element',
            'data-nullable': () => state.nullableAttr,
            'data-undefined': () => state.undefinedAttr,
            title: () => state.nullableAttr || 'No title'
        }, 'Nullable attributes element');
    };

    const App = e('div', [
        e('div', { class: 'test-section' }, [
            e('h2', 'Whole Attributes Object Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-initial-attrs-btn',
                    onclick: () => state.wholeAttrsMode = 'initial'
                }, 'Set Initial'),
                e('button', {
                    id: 'set-updated-attrs-btn',
                    onclick: () => state.wholeAttrsMode = 'updated'
                }, 'Set Updated'),
                e('button', {
                    id: 'set-minimal-attrs-btn',
                    onclick: () => state.wholeAttrsMode = 'minimal'
                }, 'Set Minimal'),
                e('button', {
                    id: 'set-empty-attrs-btn',
                    onclick: () => state.wholeAttrsMode = 'empty'
                }, 'Set Empty')
            ]),
            e('div', { id: 'whole-attrs-marker' }),
            WholeAttributesElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Single Attribute Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'update-class-btn',
                    onclick: () => state.singleClass = state.singleClass === 'initial-style' ? 'updated-style' : 'initial-style'
                }, 'Toggle Class'),
                e('button', {
                    id: 'update-id-btn',
                    onclick: () => state.singleId = state.singleId === 'element-1' ? 'element-2' : 'element-1'
                }, 'Toggle ID'),
                e('button', {
                    id: 'set-initial-id-btn',
                    onclick: () => state.singleId = 'element-1'
                }, 'Set initial ID'),
                e('button', {
                    id: 'update-title-btn',
                    onclick: () => state.singleTitle = state.singleTitle === 'Initial title' ? 'Updated title' : 'Initial title'
                }, 'Toggle Title'),
                e('button', {
                    id: 'update-data-btn',
                    onclick: () => state.singleDataValue = state.singleDataValue === 'initial-data' ? 'updated-data' : 'initial-data'
                }, 'Toggle Data'),
                e('button', {
                    id: 'update-hidden-btn',
                    onclick: () => state.singleHidden = !state.singleHidden
                }, 'Toggle Hidden'),
                e('button', {
                    id: 'update-tabindex-btn',
                    onclick: () => state.singleTabIndex = state.singleTabIndex === 1 ? 2 : 1
                }, 'Toggle TabIndex'),
                e('button', {
                    id: 'update-aria-btn',
                    onclick: () => state.singleAriaLabel = state.singleAriaLabel === 'Initial aria label' ? 'Updated aria label' : 'Initial aria label'
                }, 'Toggle ARIA'),
                e('button', {
                    id: 'update-role-btn',
                    onclick: () => state.singleRole = state.singleRole === 'button' ? 'tab' : 'button'
                }, 'Toggle Role')
            ]),
            SingleAttributeElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Form Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-form-type-btn',
                    onclick: () => state.formInputType = state.formInputType === 'text' ? 'password' : 'text'
                }, 'Toggle Type'),
                e('button', {
                    id: 'toggle-form-required-btn',
                    onclick: () => state.formInputRequired = !state.formInputRequired
                }, 'Toggle Required'),
                e('button', {
                    id: 'toggle-form-disabled-btn',
                    onclick: () => state.formInputDisabled = !state.formInputDisabled
                }, 'Toggle Disabled'),
                e('button', {
                    id: 'toggle-form-readonly-btn',
                    onclick: () => state.formInputReadonly = !state.formInputReadonly
                }, 'Toggle Readonly'),
                e('button', {
                    id: 'update-form-range-btn',
                    onclick: () => {
                        state.formInputType = 'range'
                        state.formInputMin = state.formInputMin === 0 ? 10 : 0;
                        state.formInputMax = state.formInputMax === 100 ? 200 : 100;
                        state.formInputStep = state.formInputStep === 1 ? 5 : 1;
                    }
                }, 'Update Range'),
                e('button', {
                    id: 'update-form-placeholder-btn',
                    onclick: () => state.singlePlaceholder = state.singlePlaceholder === 'Initial placeholder' ? 'Updated placeholder' : 'Initial placeholder'
                }, 'Update Placeholder'),
                e('button', {
                    id: 'update-form-value-btn',
                    onclick: () => state.singleValue = state.singleValue === 'initial value' ? 'updated value' : 'initial value'
                }, 'Update Value'),
            ]),
            FormElement(),
            e('div', { id: 'form-stats' }, [
                e('div', { id: 'input-stats' }, () => `Input value: ${state.inputValue}`),
                e('div', { id: 'change-stats' }, () => `Change value: ${state.changeValue}`)
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Media Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-autoplay-btn',
                    onclick: () => state.mediaAutoplay = !state.mediaAutoplay
                }, 'Toggle Autoplay'),
                e('button', {
                    id: 'toggle-controls-btn',
                    onclick: () => state.mediaControls = !state.mediaControls
                }, 'Toggle Controls'),
                e('button', {
                    id: 'toggle-loop-btn',
                    onclick: () => state.mediaLoop = !state.mediaLoop
                }, 'Toggle Loop'),
                e('button', {
                    id: 'toggle-muted-btn',
                    onclick: () => state.mediaMuted = !state.mediaMuted
                }, 'Toggle Muted')
            ]),
            MediaElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Custom Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'update-custom1-btn',
                    onclick: () => state.customAttr1 = state.customAttr1 === 'value1' ? 'updated1' : 'value1'
                }, 'Update Custom 1'),
                e('button', {
                    id: 'update-custom2-btn',
                    onclick: () => state.customAttr2 = state.customAttr2 === 'value2' ? 'updated2' : 'value2'
                }, 'Update Custom 2'),
                e('button', {
                    id: 'update-data-custom-btn',
                    onclick: () => state.customDataAttr = state.customDataAttr === 'custom-data' ? 'updated-custom-data' : 'custom-data'
                }, 'Update Data Custom')
            ]),
            CustomAttributesElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Style Object Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-red-style-btn',
                    onclick: () => state.styleMode = 'red'
                }, 'Red Style'),
                e('button', {
                    id: 'set-blue-style-btn',
                    onclick: () => state.styleMode = 'blue'
                }, 'Blue Style'),
                e('button', {
                    id: 'set-green-style-btn',
                    onclick: () => state.styleMode = 'green'
                }, 'Green Style'),
                e('button', {
                    id: 'set-complex-style-btn',
                    onclick: () => state.styleMode = 'complex'
                }, 'Complex Style')
            ]),
            StyleObjectElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Class List Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-single-class-btn',
                    onclick: () => state.classListMode = 'single'
                }, 'Single Class'),
                e('button', {
                    id: 'set-multiple-class-btn',
                    onclick: () => state.classListMode = 'multiple'
                }, 'Multiple Classes'),
                e('button', {
                    id: 'set-different-class-btn',
                    onclick: () => state.classListMode = 'different'
                }, 'Different Classes'),
                e('button', {
                    id: 'set-empty-class-btn',
                    onclick: () => state.classListMode = 'empty'
                }, 'Empty Classes')
            ]),
            ClassListElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Multiple Attributes Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-mode1-btn',
                    onclick: () => state.multipleAttrsMode = 'mode1'
                }, 'Mode 1'),
                e('button', {
                    id: 'set-mode2-btn',
                    onclick: () => state.multipleAttrsMode = 'mode2'
                }, 'Mode 2'),
                e('button', {
                    id: 'set-mode3-btn',
                    onclick: () => state.multipleAttrsMode = 'mode3'
                }, 'Mode 3')
            ]),
            MultipleAttributesElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Conditional Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'toggle-conditional-attrs-btn',
                    onclick: () => state.conditionalAttrs = !state.conditionalAttrs
                }, 'Toggle Conditional Attrs')
            ]),
            ConditionalAttributesElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Dynamic Attributes Count'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'increase-attrs-btn',
                    onclick: () => state.dynamicAttrsCount++
                }, 'Increase Attrs'),
                e('button', {
                    id: 'decrease-attrs-btn',
                    onclick: () => state.dynamicAttrsCount = Math.max(0, state.dynamicAttrsCount - 1)
                }, 'Decrease Attrs'),
                e('button', {
                    id: 'reset-attrs-btn',
                    onclick: () => state.dynamicAttrsCount = 1
                }, 'Reset Attrs')
            ]),
            DynamicAttributesElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Rapid Updates'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'rapid-increment-btn',
                    onclick: () => state.rapidUpdateCounter++
                }, 'Increment'),
                e('button', {
                    id: 'rapid-decrement-btn',
                    onclick: () => state.rapidUpdateCounter--
                }, 'Decrement'),
                e('button', {
                    id: 'rapid-reset-btn',
                    onclick: () => state.rapidUpdateCounter = 0
                }, 'Reset'),
                e('button', {
                    id: 'rapid-batch-btn',
                    onclick: () => {
                        for (let i = 0; i < 10; i++) {
                            setTimeout(() => state.rapidUpdateCounter++, i * 10);
                        }
                    }
                }, 'Batch Update')
            ]),
            RapidUpdateElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Null/Undefined Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-null-attr-btn',
                    onclick: () => state.nullableAttr = null
                }, 'Set Null'),
                e('button', {
                    id: 'set-undefined-attr-btn',
                    onclick: () => state.undefinedAttr = undefined
                }, 'Set Undefined'),
                e('button', {
                    id: 'restore-attrs-btn',
                    onclick: () => {
                        state.nullableAttr = 'restored';
                        state.undefinedAttr = 'restored';
                    }
                }, 'Restore Attrs')
            ]),
            NullableAttributesElement()
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
