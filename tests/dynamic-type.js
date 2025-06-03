document.addEventListener('e:init', () => {
    // State for all test scenarios
    const state = createState({
        basicType: 'div',
        interactiveType: 'button',
        textType: 'p',
        styledType: 'div',
        dataType: 'div',
        inlineStyledType: 'div',
        clickableType: 'div',
        clickCount: 0,
        inputType: 'text',
        inputValue: '',
        parentType: 'div',
        nestedParentType: 'div',
        formInputType: 'text',
        textFieldType: 'textarea',
        textFieldValue: '',
        choiceFieldType: 'select',
        choiceFieldValue: 'option1',
        rapidType: 'div',
        combinedType: 'div',
        combinedClass: 'div-class',
        listMiddleType: 'div',
        edgeCaseType: 'div',
        conflictType: 'input',
        deepLevel1Type: 'div',
        deepLevel2Type: 'span',
        deepLevel3Type: 'p'
    });

    // Helper components
    const BasicElement = () => {
        const content = () => state.basicType === 'div' ? 'I am a div' : 'I am a span';
        return e(() => state.basicType, { id: 'basic-element' }, content);
    };

    const InteractiveElement = () => {
        return e(
            () => state.interactiveType,
            {
                id: 'interactive-element',
                type: () => state.interactiveType === 'button' ? null : 'text',
                placeholder: () => state.interactiveType === 'button' ? null : 'Type here'
            },
            () => state.interactiveType === 'button' ? 'Click me' : null
        )
    };

    const TextElement = () => {
        const content = () => state.textType === 'p' ? 'Paragraph text' : 'Heading text';
        return e(() => state.textType, { id: 'text-element' }, content);
    };

    const StyledElement = () => {
        return e(() => state.styledType, {
            id: 'styled-element',
            class: 'test-class'
        }, () => `Styled ${state.styledType}`);
    };

    const DataElement = () => {
        return e(() => state.dataType, {
            id: 'data-element',
            'data-test-value': '123',
            'data-custom-attr': 'preserved'
        }, () => `Data ${state.dataType}`);
    };

    const InlineStyledElement = () => {
        return e(() => state.inlineStyledType, {
            id: 'inline-styled-element',
            style: 'background-color: red; padding: 10px;'
        }, () => `Inline styled ${state.inlineStyledType}`);
    };

    const ClickableElement = () => {
        return e(() => state.clickableType, {
            id: 'clickable-element',
            onclick: () => state.clickCount++
        }, () => `Clickable ${state.clickableType}`);
    };

    const InputElement = () => {
        return e('input', {
            id: 'input-element',
            type: () => state.inputType,
            oninput: (e) => state.inputValue = e.target.value
        });
    };

    const ParentElement = () => {
        return e(() => state.parentType, { id: 'parent-element' }, [
            e('div', { id: 'child-1' }, 'Child 1'),
            e('div', { id: 'child-2' }, 'Child 2'),
            e('div', { id: 'child-3' }, 'Child 3')
        ]);
    };

    const NestedParent = () => {
        return e(() => state.nestedParentType, { id: 'nested-parent' }, [
            e('span', { id: 'nested-child' }, [
                e('em', { id: 'nested-grandchild' }, 'Grandchild')
            ])
        ]);
    };

    const FormInput = () => {
        return e('input', {
            id: 'form-input',
            type: () => state.formInputType
        });
    };

    const TextField = () => {
        return e(() => state.textFieldType, {
            id: 'text-field',
            value: () => state.textFieldValue,
            onchange: (e) => state.textFieldValue = e.target.value
        });
    };

    const ChoiceField = () => {
        return e(
            () => state.choiceFieldType,
            {
                id: 'choice-field',
                onchange: (e) => state.choiceFieldValue = e.target.value,
                type: state.choiceFieldType === 'select' ? null : 'text',
                value: () => state.choiceFieldValue,
            },
            () => state.choiceFieldType === 'select' ? [
                e('option', { value: 'option1', selected: () => state.choiceFieldValue === 'option1' }, 'Option 1'),
                e('option', { value: 'option2', selected: () => state.choiceFieldValue === 'option2' }, 'Option 2'),
                e('option', { value: 'option3', selected: () => state.choiceFieldValue === 'option3' }, 'Option 3')
            ] : null
        )
    };

    const RapidElement = () => {
        return e(() => state.rapidType, { id: 'rapid-element' }, () => `I am a ${state.rapidType}`);
    };

    const CombinedElement = () => {
        return e(() => state.combinedType, {
            id: 'combined-element',
            class: () => state.combinedClass
        }, () => `Combined ${state.combinedType}`);
    };

    const ListContainer = () => {
        return e('div', { id: 'list-container' }, [
            e('div', { id: 'list-item-1' }, 'Item 1'),
            e(() => state.listMiddleType, { id: 'list-item-2' }, 'Item 2'),
            e('div', { id: 'list-item-3' }, 'Item 3')
        ]);
    };

    const EdgeCaseElement = () => {
        return e(() => state.edgeCaseType, { id: 'edge-case-element' }, 'Edge case element');
    };

    const ConflictElement = () => {
        return e(
            () => state.conflictType,
            {
                id: 'conflict-element',
                type: () => state.conflictType === 'input' ? 'text' : null,
            },
            () => state.conflictType === 'input' ? null : 'Conflict resolved'
        )
    };

    const DeepNestedStructure = () => {
        return e(() => state.deepLevel1Type, { id: 'deep-level-1' }, [
            e(() => state.deepLevel2Type, { id: 'deep-level-2' }, [
                e(() => state.deepLevel3Type, { id: 'deep-level-3' }, 'Deep content')
            ])
        ]);
    };

    const App = e('div', [
        e('div', { class: 'test-section' }, [
            e('h2', 'Basic Type Changes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-div-btn',
                    onclick: () => state.basicType = 'div'
                }, 'Set Div'),
                e('button', {
                    id: 'set-span-btn',
                    onclick: () => state.basicType = 'span'
                }, 'Set Span')
            ]),
            BasicElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Interactive Elements'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-button-btn',
                    onclick: () => state.interactiveType = 'button'
                }, 'Set Button'),
                e('button', {
                    id: 'set-input-btn',
                    onclick: () => state.interactiveType = 'input'
                }, 'Set Input')
            ]),
            InteractiveElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Text Elements'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-paragraph-btn',
                    onclick: () => state.textType = 'p'
                }, 'Set Paragraph'),
                e('button', {
                    id: 'set-heading-btn',
                    onclick: () => state.textType = 'h1'
                }, 'Set Heading')
            ]),
            TextElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Styled Elements'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-styled-div-btn',
                    onclick: () => state.styledType = 'div'
                }, 'Set Styled Div'),
                e('button', {
                    id: 'set-styled-span-btn',
                    onclick: () => state.styledType = 'span'
                }, 'Set Styled Span')
            ]),
            StyledElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Data Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-data-div-btn',
                    onclick: () => state.dataType = 'div'
                }, 'Set Data Div'),
                e('button', {
                    id: 'set-data-section-btn',
                    onclick: () => state.dataType = 'section'
                }, 'Set Data Section')
            ]),
            DataElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Inline Styles'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-styled-div-inline-btn',
                    onclick: () => state.inlineStyledType = 'div'
                }, 'Set Styled Div'),
                e('button', {
                    id: 'set-styled-article-btn',
                    onclick: () => state.inlineStyledType = 'article'
                }, 'Set Styled Article')
            ]),
            InlineStyledElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Event Handlers'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-clickable-div-btn',
                    onclick: () => state.clickableType = 'div'
                }, 'Set Clickable Div'),
                e('button', {
                    id: 'set-clickable-button-btn',
                    onclick: () => state.clickableType = 'button'
                }, 'Set Clickable Button')
            ]),
            ClickableElement(),
            e('div', { id: 'click-counter' }, () => `Clicks: ${state.clickCount}`)
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Input Type Changes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-text-input-btn',
                    onclick: () => state.inputType = 'text'
                }, 'Set Text Input'),
                e('button', {
                    id: 'set-password-input-btn',
                    onclick: () => state.inputType = 'password'
                }, 'Set Password Input')
            ]),
            InputElement(),
            e('div', { id: 'input-value' }, () => `Value: ${state.inputValue}`)
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Parent with Children'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-parent-div-btn',
                    onclick: () => state.parentType = 'div'
                }, 'Set Parent Div'),
                e('button', {
                    id: 'set-parent-section-btn',
                    onclick: () => state.parentType = 'section'
                }, 'Set Parent Section')
            ]),
            ParentElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Nested Structure'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-nested-div-btn',
                    onclick: () => state.nestedParentType = 'div'
                }, 'Set Nested Div'),
                e('button', {
                    id: 'set-nested-article-btn',
                    onclick: () => state.nestedParentType = 'article'
                }, 'Set Nested Article')
            ]),
            NestedParent()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Form Elements'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-form-text-btn',
                    onclick: () => state.formInputType = 'text'
                }, 'Set Text'),
                e('button', {
                    id: 'set-form-email-btn',
                    onclick: () => state.formInputType = 'email'
                }, 'Set Email')
            ]),
            FormInput()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Textarea/Input'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-textarea-btn',
                    onclick: () => state.textFieldType = 'textarea'
                }, 'Set Textarea'),
                e('button', {
                    id: 'set-text-field-input-btn',
                    onclick: () => state.textFieldType = 'input'
                }, 'Set Input')
            ]),
            TextField()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Select/Input'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-select-btn',
                    onclick: () => state.choiceFieldType = 'select'
                }, 'Set Select'),
                e('button', {
                    id: 'set-choice-input-btn',
                    onclick: () => state.choiceFieldType = 'input'
                }, 'Set Input')
            ]),
            ChoiceField()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Rapid Changes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-rapid-div-btn',
                    onclick: () => state.rapidType = 'div'
                }, 'Div'),
                e('button', {
                    id: 'set-rapid-span-btn',
                    onclick: () => state.rapidType = 'span'
                }, 'Span'),
                e('button', {
                    id: 'set-rapid-p-btn',
                    onclick: () => state.rapidType = 'p'
                }, 'P'),
                e('button', {
                    id: 'set-rapid-section-btn',
                    onclick: () => state.rapidType = 'section'
                }, 'Section'),
                e('button', {
                    id: 'set-rapid-article-btn',
                    onclick: () => state.rapidType = 'article'
                }, 'Article')
            ]),
            RapidElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Combined Changes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-combined-div-btn',
                    onclick: () => {
                        state.combinedType = 'div';
                        state.combinedClass = 'div-class';
                    }
                }, 'Set Div'),
                e('button', {
                    id: 'set-combined-span-btn',
                    onclick: () => {
                        state.combinedType = 'span';
                        state.combinedClass = 'span-class';
                    }
                }, 'Set Span')
            ]),
            CombinedElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'List Context'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-list-initial-btn',
                    onclick: () => state.listMiddleType = 'div'
                }, 'Set Initial'),
                e('button', {
                    id: 'set-list-middle-span-btn',
                    onclick: () => state.listMiddleType = 'span'
                }, 'Set Middle Span')
            ]),
            ListContainer()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Edge Cases'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-valid-element-btn',
                    onclick: () => state.edgeCaseType = 'div'
                }, 'Set Valid'),
                e('button', {
                    id: 'set-invalid-element-btn',
                    onclick: () => state.edgeCaseType = 'invalid'
                }, 'Set Invalid')
            ]),
            EdgeCaseElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Conflicting Attributes'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-conflict-input-btn',
                    onclick: () => state.conflictType = 'input'
                }, 'Set Input'),
                e('button', {
                    id: 'set-conflict-div-btn',
                    onclick: () => state.conflictType = 'div'
                }, 'Set Div')
            ]),
            ConflictElement()
        ]),

        e('div', { class: 'test-section' }, [
            e('h2', 'Deep Nesting'),
            e('div', { class: 'controls' }, [
                e('button', {
                    id: 'set-deep-nested-btn',
                    onclick: () => {
                        state.deepLevel1Type = 'div';
                        state.deepLevel2Type = 'span';
                        state.deepLevel3Type = 'p';
                    }
                }, 'Set Initial'),
                e('button', {
                    id: 'set-deep-nested-changed-btn',
                    onclick: () => {
                        state.deepLevel1Type = 'section';
                        state.deepLevel2Type = 'article';
                        state.deepLevel3Type = 'h2';
                    }
                }, 'Change All')
            ]),
            DeepNestedStructure()
        ])
    ]);

    renderApp(App, document.getElementById('container'));
});
