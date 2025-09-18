document.addEventListener('e:init', () => {
    // State for all test scenarios
    const state = createState({
        // Static rendering errors
        staticError: false,

        // Conditional component errors
        showConditional: false,
        conditionalError: false,
        conditionalErrorMessage: 'Conditional component error',

        // Type update errors
        showTypeComponent: false,
        typeError: false,
        typeErrorMessage: 'Type update error',
        elementType: 'div',

        // Attributes update errors
        showAttributesComponent: false,
        attributesError: false,
        attributesErrorMessage: 'Attributes update error',
        attributesValue: 'initial',

        // Single attribute update errors
        showSingleAttrComponent: false,
        singleAttrError: false,
        singleAttrErrorMessage: 'Single attribute error',
        singleAttrValue: 'initial',

        // Children update errors
        showChildrenComponent: false,
        childrenError: false,
        childrenErrorMessage: 'Children update error',
        childrenCount: 1,

        // Nested error boundaries
        showNestedParent: false,
        nestedParentError: false,
        nestedChild1Error: false,
        nestedChild2Error: false,
        nestedChild3Error: false,
        nestedNestedChild1Error: false,
        nestedNestedChild2Error: false,

        // Error recovery
        recoveryError: false,
        recoveryAttempts: 0,

        // Multiple errors
        multipleError1: false,
        multipleError2: false,

        // Deep nesting errors
        deepError: false,
        deepLevel: 1
    });

    const StaticErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'static-error-fallback'
    }, `Static Error: ${err.message}`)

    const ConditionalErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'conditional-error-fallback'
    }, `Conditional Error: ${err.message}`);

    const TypeErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'type-error-fallback'
    }, `Type Error: ${err.message}`);

    const AttributesErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'attributes-error-fallback'
    }, `Attributes Error: ${err.message}`);

    const SingleAttrErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'single-attr-error-fallback'
    }, `Single Attr Error: ${err.message}`);

    const ChildrenErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'children-error-fallback'
    }, `Children Error: ${err.message}`);

    const NestedParentErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'nested-parent-error-fallback'
    }, `Nested Parent Error: ${err.message}`);

    const NestedChildErrorFallback = (id) => (err) => {
        return e('div', {
            id,
            class: 'error-boundary child-error',
        }, `Nested Child Error: ${err.message}`)
    };

    const RecoveryErrorFallback = (err) => e('div', {
        class: 'error-boundary',
        id: 'recovery-error-fallback'
    }, `Recovery Error: ${err.message} (Attempt: ${state.recoveryAttempts})`);

    // Test components that can throw errors
    const StaticErrorComponent = errb(() => {
        throw new Error('Static rendering error');
    }, StaticErrorFallback);

    const ConditionalErrorComponent = errb(() => {
        if (!state.showConditional) return null;
        if (state.conditionalError) {
            throw new Error(state.conditionalErrorMessage);
        }
        return e('div', {
            id: 'conditional-success-component',
            class: 'success-component'
        }, 'Conditional component rendered successfully');
    }, ConditionalErrorFallback);

    const TypeErrorComponent = errb(() => {
        if (!state.showTypeComponent) return null;
        if (state.typeError) {
            throw new Error(state.typeErrorMessage);
        }
        return e(() => {
            if (state.typeError) {
                throw new Error(state.typeErrorMessage);
            }
            return state.elementType;
        }, {
            id: 'type-success-component',
            class: 'success-component'
        }, 'Type component rendered successfully');
    }, TypeErrorFallback);

    const AttributesErrorComponent = errb(() => {
        if (!state.showAttributesComponent) return null;

        const attributes = () => {
            if (state.attributesError) throw new Error(state.attributesErrorMessage);

            return {
                id: 'attributes-success-component',
                class: 'success-component',
                'data-value': () => state.attributesValue
            }
        }

        return e('div', attributes, 'Attributes component rendered successfully');
    }, AttributesErrorFallback);

    const SingleAttrErrorComponent = errb(() => {
        if (!state.showSingleAttrComponent) return null;
        return e('div', {
            id: 'single-attr-success-component',
            class: 'success-component',
            title: () => {
                if (state.singleAttrError) {
                    throw new Error(state.singleAttrErrorMessage);
                }
                return state.singleAttrValue;
            }
        }, 'Single attribute component rendered successfully');
    }, SingleAttrErrorFallback);

    const ChildrenErrorComponent = errb(() => {
        if (!state.showChildrenComponent) return null;
        return e('div', {
            id: 'children-parent-component',
            class: 'success-component'
        }, () => {
            if (state.childrenError) {
                throw new Error(state.childrenErrorMessage);
            }
            const children = [];
            for (let i = 0; i < state.childrenCount; i++) {
                children.push(e('div', {
                    id: `child-${i}`,
                    class: 'component'
                }, `Child ${i + 1}`));
            }
            return children;
        });
    }, ChildrenErrorFallback);

    const NestedNestedChildComponent1 = errb(() => {
        if (state.nestedNestedChild1Error) {
            throw new Error('Nested child error');
        }
        return e('div', {
            id: 'nested-nested-child1-success',
            class: 'success-component'
        }, 'Nested Nested child 1 rendered successfully');
    }, NestedChildErrorFallback('nested-nested-child1-error-fallback'));

    const NestedNestedChildComponent2 = errb(() => {
        if (state.nestedNestedChild2Error) {
            throw new Error('Nested child error');
        }
        return e('div', {
            id: 'nested-nested-child2-success',
            class: 'success-component'
        }, 'Nested Nested child 2 rendered successfully');
    }, NestedChildErrorFallback('nested-nested-child2-error-fallback'));

    const NestedChildComponent1 = errb(() => {
        if (state.nestedChild1Error) {
            throw new Error('Nested child error');
        }
        return e('div', {
            id: 'nested-child1-success',
            class: 'success-component'
        }, 'Nested child 1 rendered successfully');
    }, NestedChildErrorFallback('nested-child1-error-fallback'));

    const NestedChildComponent2 = errb(() => {
        if (state.nestedChild2Error) {
            throw new Error('Nested child error');
        }
        return e('div', {
            id: 'nested-child2-success',
            class: 'success-component'
        }, [
            'Nested child 2 rendered successfully',
            NestedNestedChildComponent1,
            NestedNestedChildComponent2,
        ]);
    }, NestedChildErrorFallback('nested-child2-error-fallback'));

    const NestedChildComponent3 = errb(() => {
        if (state.nestedChild3Error) {
            throw new Error('Nested child error');
        }
        return e('div', {
            id: 'nested-child3-success',
            class: 'success-component'
        }, 'Nested child 3 rendered successfully');
    }, NestedChildErrorFallback('nested-child3-error-fallback'));

    const NestedParentComponent = errb(() => {
        if (!state.showNestedParent) return null;
        if (state.nestedParentError) {
            throw new Error('Nested parent error');
        }
        return e('div', {
            id: 'nested-parent-success',
            class: 'success-component'
        }, [
            'Nested parent rendered successfully',
            NestedChildComponent1,
            NestedChildComponent2,
            NestedChildComponent3
        ]);
    }, NestedParentErrorFallback);

    const RecoveryComponent = errb(() => {
        if (state.recoveryError && state.recoveryAttempts < 3) {
            throw new Error(`Recovery attempt ${state.recoveryAttempts + 1}`);
        }
        return e('div', {
            id: 'recovery-success-component',
            class: 'success-component'
        }, `Recovery successful after ${state.recoveryAttempts} attempts`);
    }, RecoveryErrorFallback);

    const MultipleErrorComponent1 = errb(() => {
        if (state.multipleError1) {
            throw new Error('Multiple error 1');
        }
        return e('div', {
            id: 'multiple-success-1',
            class: 'success-component'
        }, 'Multiple component 1 success');
    }, (err) => e('div', {
        class: 'error-boundary',
        id: 'multiple-error-1'
    }, `Multiple Error 1: ${err.message}`));

    const MultipleErrorComponent2 = errb(() => {
        if (state.multipleError2) {
            throw new Error('Multiple error 2');
        }
        return e('div', {
            id: 'multiple-success-2',
            class: 'success-component'
        }, 'Multiple component 2 success');
    }, (err) => e('div', {
        class: 'error-boundary',
        id: 'multiple-error-2'
    }, `Multiple Error 2: ${err.message}`));

    const DeepNestedComponent = errb(() => {
        if (state.deepError && state.deepLevel === 3) {
            throw new Error('Deep nested error at level 3');
        }
        return e('div', {
            id: 'deep-level-3',
            class: 'success-component'
        }, 'Deep level 3 success');
    }, (err) => e('div', {
        class: 'error-boundary',
        id: 'deep-error-fallback'
    }, `Deep Error: ${err.message}`));

    const DeepLevel2Component = () => {
        if (state.deepError && state.deepLevel === 2) {
            throw new Error('Deep nested error at level 2');
        }
        return e('div', {
            id: 'deep-level-2',
            class: 'component'
        }, [
            'Deep level 2',
            DeepNestedComponent
        ]);
    };

    const DeepLevel1Component = () => {
        if (state.deepError && state.deepLevel === 1) {
            throw new Error('Deep nested error at level 1');
        }
        return e('div', {
            id: 'deep-level-1',
            class: 'component'
        }, [
            'Deep level 1',
            DeepLevel2Component
        ]);
    };

    const App = e('div', { id: 'app' }, [
        e('div', { class: 'test-section' }, [
            e('h2', 'Static Rendering Error Boundary'),
            e('div', { id: 'static-error-container' }, [
                StaticErrorComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Conditional Component Error Boundary'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-conditional-btn',
                    onclick: () => state.showConditional = true
                }, 'Show Conditional'),
                e('button', {
                    id: 'hide-conditional-btn',
                    onclick: () => state.showConditional = false
                }, 'Hide Conditional'),
                e('button', {
                    id: 'trigger-conditional-error-btn',
                    onclick: () => state.conditionalError = true
                }, 'Trigger Conditional Error'),
                e('button', {
                    id: 'resolve-conditional-error-btn',
                    onclick: () => state.conditionalError = false
                }, 'Resolve Conditional Error'),
                e('button', {
                    id: 'reset-conditional-error-btn',
                    onclick: () => {
                        state.conditionalError = false
                        state.showConditional = false
                    }
                }, 'Reset')
            ]),
            e('div', { id: 'conditional-error-container' }, [
                ConditionalErrorComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Type Update Error Boundary'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-type-component-btn',
                    onclick: () => state.showTypeComponent = true
                }, 'Show Type Component'),
                e('button', {
                    id: 'hide-type-component-btn',
                    onclick: () => state.showTypeComponent = false
                }, 'Hide Type Component'),
                e('button', {
                    id: 'trigger-type-error-btn',
                    onclick: () => state.typeError = true
                }, 'Trigger Type Error'),
                e('button', {
                    id: 'resolve-type-error-btn',
                    onclick: () => state.typeError = false
                }, 'Resolve Type Error'),
                e('button', {
                    id: 'change-element-type-btn',
                    onclick: () => state.elementType = state.elementType === 'div' ? 'span' : 'div'
                }, 'Change Element Type'),
                e('button', {
                    id: 'reset-element-type-btn',
                    onclick: () => {
                        state.showTypeComponent = false
                        state.typeError = false
                        state.elementType = 'div'
                    }
                }, 'Reset')
            ]),
            e('div', { id: 'type-error-container' }, [
                TypeErrorComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Attributes Update Error Boundary'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-attributes-component-btn',
                    onclick: () => state.showAttributesComponent = true
                }, 'Show Attributes Component'),
                e('button', {
                    id: 'hide-attributes-component-btn',
                    onclick: () => state.showAttributesComponent = false
                }, 'Hide Attributes Component'),
                e('button', {
                    id: 'trigger-attributes-error-btn',
                    onclick: () => state.attributesError = true
                }, 'Trigger Attributes Error'),
                e('button', {
                    id: 'resolve-attributes-error-btn',
                    onclick: () => state.attributesError = false
                }, 'Resolve Attributes Error'),
                e('button', {
                    id: 'update-attributes-value-btn',
                    onclick: () => state.attributesValue = 'updated'
                }, 'Update Attributes Value'),
                e('button', {
                    id: 'reset-attributes-value-btn',
                    onclick: () => {
                        state.showAttributesComponent = false
                        state.attributesValue = 'initial'
                    }
                }, 'Reset')
            ]),
            e('div', { id: 'attributes-error-container' }, [
                AttributesErrorComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Single Attribute Update Error Boundary'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-single-attr-component-btn',
                    onclick: () => state.showSingleAttrComponent = true
                }, 'Show Single Attr Component'),
                e('button', {
                    id: 'hide-single-attr-component-btn',
                    onclick: () => state.showSingleAttrComponent = false
                }, 'Hide Single Attr Component'),
                e('button', {
                    id: 'trigger-single-attr-error-btn',
                    onclick: () => state.singleAttrError = true
                }, 'Trigger Single Attr Error'),
                e('button', {
                    id: 'resolve-single-attr-error-btn',
                    onclick: () => state.singleAttrError = false
                }, 'Resolve Single Attr Error'),
                e('button', {
                    id: 'update-single-attr-value-btn',
                    onclick: () => state.singleAttrValue = 'updated'
                }, 'Update Single Attr Value'),
                e('button', {
                    id: 'reset-single-attr-value-btn',
                    onclick: () => {
                        state.showSingleAttrComponent = false
                        state.singleAttrError = false
                        state.singleAttrValue = 'initial'
                    }
                }, 'Reset')
            ]),
            e('div', { id: 'single-attr-error-container' }, [
                SingleAttrErrorComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Children Update Error Boundary'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-children-component-btn',
                    onclick: () => state.showChildrenComponent = true
                }, 'Show Children Component'),
                e('button', {
                    id: 'hide-children-component-btn',
                    onclick: () => state.showChildrenComponent = false
                }, 'Hide Children Component'),
                e('button', {
                    id: 'trigger-children-error-btn',
                    onclick: () => state.childrenError = true
                }, 'Trigger Children Error'),
                e('button', {
                    id: 'resolve-children-error-btn',
                    onclick: () => state.childrenError = false
                }, 'Resolve Children Error'),
                e('button', {
                    id: 'increase-children-count-btn',
                    onclick: () => state.childrenCount++
                }, 'Increase Children Count'),
                e('button', {
                    id: 'decrease-children-count-btn',
                    onclick: () => state.childrenCount = Math.max(1, state.childrenCount - 1)
                }, 'Decrease Children Count'),
                e('button', {
                    id: 'reset-children-count-btn',
                    onclick: () => {
                        state.showChildrenComponent = false
                        state.childrenError = false
                        state.childrenCount = 1
                    }
                }, 'Reset')
            ]),
            e('div', { id: 'children-error-container' }, [
                ChildrenErrorComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Nested Error Boundaries'),
            e('div', { class: 'controls' }, [
                e('div', [
                    e('button', {
                        id: 'show-nested-parent-btn',
                        onclick: () => state.showNestedParent = true
                    }, 'Show Nested Parent'),
                    e('button', {
                        id: 'hide-nested-parent-btn',
                        onclick: () => state.showNestedParent = false
                    }, 'Hide Nested Parent'),
                ]),
                e('div', [
                    e('button', {
                        id: 'trigger-nested-parent-error-btn',
                        onclick: () => state.nestedParentError = true
                    }, 'Trigger Parent Error'),
                    e('button', {
                        id: 'resolve-parent-error-btn',
                        onclick: () => state.nestedParentError = false
                    }, 'Resolve Parent Error'),
                ]),
                e('div', { class: 'pl-8' }, [
                    e('button', {
                        id: 'trigger-nested-child1-error-btn',
                        onclick: () => state.nestedChild1Error = true
                    }, 'Trigger Child 1 Error'),
                    e('button', {
                        id: 'resolve-nested-child1-error-btn',
                        onclick: () => state.nestedChild1Error = false
                    }, 'Resolve Child 1 Error'),
                ]),
                e('div', { class: 'pl-8' }, [
                    e('button', {
                        id: 'trigger-nested-child2-error-btn',
                        onclick: () => state.nestedChild2Error = true
                    }, 'Trigger Child 2 Error'),
                    e('button', {
                        id: 'resolve-nested-child2-error-btn',
                        onclick: () => state.nestedChild2Error = false
                    }, 'Resolve Child 2 Error'),
                    e('div', { class: 'pl-8' }, [
                        e('div', { class: 'pl-8' }, [
                            e('button', {
                                id: 'trigger-nested-nested-child1-error-btn',
                                onclick: () => state.nestedNestedChild1Error = true
                            }, 'Trigger Nested Child 1 Error'),
                            e('button', {
                                id: 'resolve-nested-nested-child1-error-btn',
                                onclick: () => state.nestedNestedChild1Error = false
                            }, 'Resolve Nested Child 1 Error'),
                        ]),
                        e('div', { class: 'pl-8' }, [
                            e('button', {
                                id: 'trigger-nested-nested-child2-error-btn',
                                onclick: () => state.nestedNestedChild2Error = true
                            }, 'Trigger Nested Child 2 Error'),
                            e('button', {
                                id: 'resolve-nested-nested-child2-error-btn',
                                onclick: () => state.nestedNestedChild2Error = false
                            }, 'Resolve Nested Child 2 Error'),
                        ])
                    ]),
                ]),
                e('div', { class: 'pl-8' }, [
                    e('button', {
                        id: 'trigger-nested-child3-error-btn',
                        onclick: () => state.nestedChild3Error = true
                    }, 'Trigger Child 3 Error'),
                    e('button', {
                        id: 'resolve-nested-child3-error-btn',
                        onclick: () => state.nestedChild3Error = false
                    }, 'Resolve Child 3 Error'),
                ]),
                e('div', [
                    e('button', {
                        id: 'resolve-nested-errors-btn',
                        onclick: () => {
                            state.nestedChild2Error = false;
                            state.nestedNestedChild1Error = false;
                            state.nestedParentError = false;
                            state.nestedNestedChild2Error = false;
                            state.nestedChild3Error = false;
                            state.nestedChild1Error = false;

                        }
                    }, 'Resolve All Nested Errors')
                ])
            ]),
            e('div', { id: 'nested-error-container' }, [
                NestedParentComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Error Recovery'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-recovery-error-btn',
                    onclick: () => {
                        state.recoveryError = true;
                        state.recoveryAttempts = 0;
                    }
                }, 'Trigger Recovery Error'),
                e('button', {
                    id: 'attempt-recovery-btn',
                    onclick: () => state.recoveryAttempts++
                }, 'Attempt Recovery'),
                e('button', {
                    id: 'reset-recovery-btn',
                    onclick: () => {
                        state.recoveryError = false;
                        state.recoveryAttempts = 0

                    }
                }, 'Reset Recovery')
            ]),
            e('div', { id: 'recovery-error-container' }, [
                RecoveryComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Multiple Error Boundaries'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-multiple-error-1-btn',
                    onclick: () => state.multipleError1 = true
                }, 'Trigger Error 1'),
                e('button', {
                    id: 'trigger-multiple-error-2-btn',
                    onclick: () => state.multipleError2 = true
                }, 'Trigger Error 2'),
                e('button', {
                    id: 'trigger-both-multiple-errors-btn',
                    onclick: () => {
                        state.multipleError1 = true;
                        state.multipleError2 = true;
                    }
                }, 'Trigger Both Errors'),
                e('button', {
                    id: 'resolve-multiple-errors-btn',
                    onclick: () => {
                        state.multipleError1 = false;
                        state.multipleError2 = false;
                    }
                }, 'Resolve All Errors')
            ]),
            e('div', { id: 'multiple-error-container' }, [
                MultipleErrorComponent1,
                MultipleErrorComponent2
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Deep Nesting Error Boundary'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'trigger-deep-error-level-1-btn',
                    onclick: () => {
                        state.deepLevel = 1;
                        state.deepError = true;
                    }
                }, 'Trigger Level 1 Error'),
                e('button', {
                    id: 'trigger-deep-error-level-2-btn',
                    onclick: () => {
                        state.deepLevel = 2;
                        state.deepError = true;
                    }
                }, 'Trigger Level 2 Error'),
                e('button', {
                    id: 'trigger-deep-error-level-3-btn',
                    onclick: () => {
                        state.deepLevel = 3;
                        state.deepError = true;
                    }
                }, 'Trigger Level 3 Error'),
                e('button', {
                    id: 'resolve-deep-error-btn',
                    onclick: () => state.deepError = false
                }, 'Resolve Deep Error')
            ]),
            e('div', { id: 'deep-error-container' }, [
                DeepLevel1Component
            ])
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
