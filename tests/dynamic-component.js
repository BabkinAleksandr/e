document.addEventListener('e:init', () => {
    // State for all test scenarios
    const state = createState({
        showComponent: false,
        showMiddle: false,
        showCond1: false,
        showCond2: false,
        showNestedParent: false,
        showNestedChild: false,
        showBetweenSiblings: false,
        showBetweenClickable: false,
        showBetweenInputs: false,
        clickResult1: '',
        clickResult2: '',
        componentType: 'none', // 'none', 'a', 'b'
        textOrElement: 'none', // 'none', 'text', 'element'
        condition1: false,
        condition2: false,
        showDynamicAttrs: false,
        attrsUpdated: false,
        showRapid: false,
        showNull: false,
        showValidFromNull: false,
        showStable: false,
        showDeep1: false,
        showDeep2: false,
        showDeep3: false,
        nestedCondition1: false,
        nestedCondition2: false
    });

    // Helper components
    const ConditionalComponent = () => {
        if (!state.showComponent) return null;
        return e('div', { id: 'conditional-component', class: 'component' },
            'I am a conditional component');
    };

    const MiddleComponent = () => {
        if (!state.showMiddle) return null;
        return e('div', { id: 'second-component', class: 'component' },
            'Middle component');
    };

    const ConditionalComponent1 = () => {
        if (!state.showCond1) return null;
        return e('div', { id: 'conditional-1', class: 'component' },
            'Conditional 1');
    };

    const ConditionalComponent2 = () => {
        if (!state.showCond2) return null;
        return e('div', { id: 'conditional-2', class: 'component' },
            'Conditional 2');
    };

    const NestedParent = () => {
        if (!state.showNestedParent) return null;
        return e('div', { id: 'nested-parent', class: 'component' }, [
            'Nested parent',
            e('div', { id: 'nested-static' }, 'Nested static'),
            NestedChild
        ]);
    };

    const NestedChild = () => {
        if (!state.showNestedChild) return null;
        return e('div', { id: 'nested-child', class: 'component' },
            'Nested child');
    };

    const BetweenSiblingsComponent = () => {
        if (!state.showBetweenSiblings) return null;
        return e('div', { id: 'between-siblings', class: 'component' },
            'Between siblings');
    };

    const BetweenClickableComponent = () => {
        if (!state.showBetweenClickable) return null;
        return e('div', { id: 'between-clickable', class: 'component' },
            'Between clickable');
    };

    const BetweenInputsComponent = () => {
        if (!state.showBetweenInputs) return null;
        return e('div', { id: 'between-inputs', class: 'component' },
            'Between inputs');
    };

    const SwitchableComponent = () => {
        if (state.componentType === 'a') {
            return e('div', { id: 'switchable-component', class: 'component' },
                'Component A Content');
        }
        if (state.componentType === 'b') {
            return e('div', { id: 'switchable-component', class: 'component' },
                'Component B Content');
        }
        return null;
    };

    const TextOrElementComponent = () => {
        if (state.textOrElement === 'text') {
            return 'Just text content';
        }
        if (state.textOrElement === 'element') {
            return e('div', { id: 'text-or-element', class: 'component' },
                'Element content');
        }
        return null;
    };

    const ComplexConditional1 = () => {
        if (!state.condition1) return null;
        return e('div', { id: 'complex-cond-1', class: 'component' },
            'Complex condition 1');
    };

    const ComplexConditional2 = () => {
        if (!state.condition2) return null;
        return e('div', { id: 'complex-cond-2', class: 'component' },
            'Complex condition 2');
    };

    const DynamicAttrsComponent = () => {
        if (!state.showDynamicAttrs) return null;
        return e('div', {
            id: 'dynamic-attrs-component',
            class: () => state.attrsUpdated ? 'updated-class' : 'initial-class'
        }, 'Dynamic attributes component');
    };

    const RapidComponent = () => {
        if (!state.showRapid) return null;
        return e('div', { id: 'rapid-component', class: 'component' },
            'Rapid component');
    };

    const NullComponent = () => {
        if (state.showNull) return null;
        if (state.showValidFromNull) {
            return e('div', { id: 'valid-from-null', class: 'component' },
                'Valid from null');
        }
        return null;
    };

    const StableComponent = () => {
        if (!state.showStable) return null;
        return e('div', { id: 'stable-component', class: 'component' },
            'Stable component');
    };

    const DeepLevel1 = () => {
        if (!state.showDeep1) return null;
        return e('div', { id: 'deep-level-1', class: 'component' }, [
            'Deep level 1',
            DeepLevel2
        ]);
    };

    const DeepLevel2 = () => {
        if (!state.showDeep2) return null;
        return e('div', { id: 'deep-level-2', class: 'component' }, [
            'Deep level 2',
            DeepLevel3
        ]);
    };

    const DeepLevel3 = () => {
        if (!state.showDeep3) return null;
        return e('div', { id: 'deep-level-3', class: 'component' },
            'Deep level 3');
    };

    const NestedConditions = () => {
        if (!state.nestedCondition1) return null
        if (!state.nestedCondition2) return null

        return e(
            'div',
            { id: 'nested-conditions-component', class: 'component' },
            'Nested conditions component'
        )
    }

    const App = () => e('div', [
        e('div', { class: 'test-section' }, [
            e('h2', 'Basic Conditional Component'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-component-btn',
                    onclick: () => state.showComponent = true
                }, 'Show Component'),
                e('button', {
                    id: 'hide-component-btn',
                    onclick: () => state.showComponent = false
                }, 'Hide Component')
            ]),
            e('div', { id: 'conditional-container' }, [
                ConditionalComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Order Preservation'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-middle-btn',
                    onclick: () => state.showMiddle = true
                }, 'Show Middle'),
                e('button', {
                    id: 'hide-middle-btn',
                    onclick: () => state.showMiddle = false
                }, 'Hide Middle')
            ]),
            e('div', { id: 'order-test-container' }, [
                e('div', { id: 'first-component', class: 'component' }, 'First'),
                MiddleComponent,
                e('div', { id: 'third-component', class: 'component' }, 'Third')
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Multiple Conditionals'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-cond-1-btn',
                    onclick: () => state.showCond1 = true
                }, 'Show Cond 1'),
                e('button', {
                    id: 'hide-cond-1-btn',
                    onclick: () => state.showCond1 = false
                }, 'Hide Cond 1'),
                e('button', {
                    id: 'show-cond-2-btn',
                    onclick: () => state.showCond2 = true
                }, 'Show Cond 2'),
                e('button', {
                    id: 'hide-cond-2-btn',
                    onclick: () => state.showCond2 = false
                }, 'Hide Cond 2')
            ]),
            e('div', { id: 'multi-conditional-container' }, [
                e('div', { id: 'static-1', class: 'component' }, 'Static 1'),
                ConditionalComponent1,
                ConditionalComponent2,
                e('div', { id: 'static-3', class: 'component' }, 'Static 3')
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Nested Conditionals'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-nested-parent-btn',
                    onclick: () => state.showNestedParent = true
                }, 'Show Parent'),
                e('button', {
                    id: 'hide-nested-parent-btn',
                    onclick: () => state.showNestedParent = false
                }, 'Hide Parent'),
                e('button', {
                    id: 'show-nested-child-btn',
                    onclick: () => state.showNestedChild = true
                }, 'Show Child'),
                e('button', {
                    id: 'hide-nested-child-btn',
                    onclick: () => state.showNestedChild = false
                }, 'Hide Child')
            ]),
            e('div', { id: 'nested-container' }, [
                NestedParent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Sibling Attribute Preservation'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-between-siblings-btn',
                    onclick: () => state.showBetweenSiblings = true
                }, 'Show Between'),
                e('button', {
                    id: 'hide-between-siblings-btn',
                    onclick: () => state.showBetweenSiblings = false
                }, 'Hide Between')
            ]),
            e('div', { id: 'siblings-container' }, [
                e('div', {
                    id: 'sibling-1',
                    class: 'component',
                    style: 'background-color: lightblue;'
                }, 'Sibling 1'),
                BetweenSiblingsComponent,
                e('div', {
                    id: 'sibling-2',
                    class: 'component',
                    style: 'background-color: lightgreen;'
                }, 'Sibling 2')
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Clickable Siblings'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-between-clickable-btn',
                    onclick: () => state.showBetweenClickable = true
                }, 'Show Between'),
                e('button', {
                    id: 'hide-between-clickable-btn',
                    onclick: () => state.showBetweenClickable = false
                }, 'Hide Between'),
                e('button', {
                    id: 'reset-click-results-btn',
                    onclick: () => {
                        state.clickResult1 = '';
                        state.clickResult2 = '';
                    }
                }, 'Reset Results')
            ]),
            e('div', { id: 'clickable-container' }, [
                e('button', {
                    id: 'clickable-sibling-1',
                    onclick: () => state.clickResult1 = 'Sibling 1 clicked'
                }, 'Click Sibling 1'),
                BetweenClickableComponent,
                e('button', {
                    id: 'clickable-sibling-2',
                    onclick: () => state.clickResult2 = 'Sibling 2 clicked'
                }, 'Click Sibling 2')
            ]),
            e('div', [
                () => state.clickResult1 ? e('div', { id: 'click-result-1' }, state.clickResult1) : null,
                () => state.clickResult2 ? e('div', { id: 'click-result-2' }, state.clickResult2) : null
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Form Input Siblings'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-between-inputs-btn',
                    onclick: () => state.showBetweenInputs = true
                }, 'Show Between'),
                e('button', {
                    id: 'hide-between-inputs-btn',
                    onclick: () => state.showBetweenInputs = false
                }, 'Hide Between')
            ]),
            e('div', { id: 'inputs-container' }, [
                e('input', { id: 'input-before', placeholder: 'Input before' }),
                BetweenInputsComponent,
                e('input', { id: 'input-after', placeholder: 'Input after' })
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Component Switching'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-component-a-btn',
                    onclick: () => state.componentType = 'a'
                }, 'Show Component A'),
                e('button', {
                    id: 'show-component-b-btn',
                    onclick: () => state.componentType = 'b'
                }, 'Show Component B'),
                e('button', {
                    id: 'hide-switchable-btn',
                    onclick: () => state.componentType = 'none'
                }, 'Hide Component')
            ]),
            e('div', { id: 'switchable-container' }, [
                SwitchableComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Text/Element Switching'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-text-btn',
                    onclick: () => state.textOrElement = 'text'
                }, 'Show Text'),
                e('button', {
                    id: 'show-element-btn',
                    onclick: () => state.textOrElement = 'element'
                }, 'Show Element'),
                e('button', {
                    id: 'hide-text-element-btn',
                    onclick: () => state.textOrElement = 'none'
                }, 'Hide')
            ]),
            e('div', { id: 'text-or-element-container' }, [
                TextOrElementComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Complex Conditions'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'enable-condition-1-btn',
                    onclick: () => state.condition1 = true
                }, 'Enable Condition 1'),
                e('button', {
                    id: 'disable-condition-1-btn',
                    onclick: () => state.condition1 = false
                }, 'Disable Condition 1'),
                e('button', {
                    id: 'enable-condition-2-btn',
                    onclick: () => state.condition2 = true
                }, 'Enable Condition 2'),
                e('button', {
                    id: 'disable-condition-2-btn',
                    onclick: () => state.condition2 = false
                }, 'Disable Condition 2')
            ]),
            e('div', { id: 'complex-conditions-container' }, [
                e('div', { id: 'complex-start', class: 'component' }, 'Start'),
                ComplexConditional1,
                ComplexConditional2,
                e('div', { id: 'complex-end', class: 'component' }, 'End')
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Dynamic Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-dynamic-attrs-btn',
                    onclick: () => state.showDynamicAttrs = true
                }, 'Show Component'),
                e('button', {
                    id: 'hide-dynamic-attrs-btn',
                    onclick: () => state.showDynamicAttrs = false
                }, 'Hide Component'),
                e('button', {
                    id: 'update-attrs-btn',
                    onclick: () => state.attrsUpdated = true
                }, 'Update Attributes'),
                e('button', {
                    id: 'reset-attrs-btn',
                    onclick: () => state.attrsUpdated = false
                }, 'Reset Attributes')
            ]),
            e('div', { id: 'dynamic-attrs-container' }, [
                DynamicAttrsComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Rapid Operations'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'rapid-show-btn',
                    onclick: () => state.showRapid = true
                }, 'Rapid Show'),
                e('button', {
                    id: 'rapid-hide-btn',
                    onclick: () => state.showRapid = false
                }, 'Rapid Hide')
            ]),
            e('div', { id: 'rapid-container' }, [
                RapidComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Null/Undefined Components'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-null-component-btn',
                    onclick: () => state.showNull = true
                }, 'Show Null'),
                e('button', {
                    id: 'show-valid-from-null-btn',
                    onclick: () => {
                        state.showNull = false;
                        state.showValidFromNull = true;
                    }
                }, 'Show Valid'),
                e('button', {
                    id: 'hide-null-valid-btn',
                    onclick: () => {
                        state.showNull = false;
                        state.showValidFromNull = false;
                    }
                }, 'Hide All')
            ]),
            e('div', { id: 'null-container' }, [
                NullComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Stable Component'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-stable-component-btn',
                    onclick: () => state.showStable = true
                }, 'Show Stable'),
                e('button', {
                    id: 'hide-stable-component-btn',
                    onclick: () => state.showStable = false
                }, 'Hide Stable')
            ]),
            e('div', { id: 'stable-container' }, [
                StableComponent
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Deep Nesting'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'show-deep-1-btn',
                    onclick: () => state.showDeep1 = true
                }, 'Show Level 1'),
                e('button', {
                    id: 'hide-deep-1-btn',
                    onclick: () => state.showDeep1 = false
                }, 'Hide Level 1'),
                e('button', {
                    id: 'show-deep-2-btn',
                    onclick: () => state.showDeep2 = true
                }, 'Show Level 2'),
                e('button', {
                    id: 'hide-deep-2-btn',
                    onclick: () => state.showDeep2 = false
                }, 'Hide Level 2'),
                e('button', {
                    id: 'show-deep-3-btn',
                    onclick: () => state.showDeep3 = true
                }, 'Show Level 3'),
                e('button', {
                    id: 'hide-deep-3-btn',
                    onclick: () => state.showDeep3 = false
                }, 'Hide Level 3')
            ]),
            e('div', { id: 'deep-nesting-container' }, [
                DeepLevel1
            ])
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Nested conditions'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'nested-condition-1-on-btn',
                    onclick: () => state.nestedCondition1 = true
                }, 'Nested contidion 1: ON'),
                e('button', {
                    id: 'nested-condition-1-off-btn',
                    onclick: () => state.nestedCondition1 = false
                }, 'Nested contidion 1: OFF'),
                e('button', {
                    id: 'nested-condition-2-on-btn',
                    onclick: () => state.nestedCondition2 = true
                }, 'Nested contidion 2: ON'),
                e('button', {
                    id: 'nested-condition-2-off-btn',
                    onclick: () => state.nestedCondition2 = false
                }, 'Nested contidion 2: OFF'),
            ]),
            e('div', { id: 'deep-nesting-container' }, [
                () => state.nestedCondition1 ? e('div', { id: 'nested-condition-1-component' }, 'Nested condition 1') : null,
                () => state.nestedCondition2 ? e('div', { id: 'nested-condition-2-component' }, 'Nested condition 2') : null,
                NestedConditions
            ])
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
