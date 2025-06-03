document.addEventListener('e:init', () => {
    const imgSrcSvg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzAwZiIvPjwvc3ZnPg=='
    const audioSrcWav = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
    const videoSrcMp4 = 'data:video/mp4;base64,AAAAIGZ0eXBpc29tAAACAGlzb21pc28yYXZjMW1wNDEAAAAIZnJlZQAAAr1tZGF0AAACrgYF//+q3EXpvebZSLeWLNgg2SPu73gyNjQgLSBjb3JlIDE1MiByMjg1NCBlOWE1OTAzIC0gSC4yNjQvTVBFRy00IEFWQyBjb2RlYyAtIENvcHlsZWZ0IDIwMDMtMjAxNyAtIGh0dHA6Ly93d3cudmlkZW9sYW4ub3JnL3gyNjQuaHRtbCAtIG9wdGlvbnM6IGNhYmFjPTEgcmVmPTMgZGVibG9jaz0xOjA6MCBhbmFseXNlPTB4MzoweDExMyBtZT1oZXggc3VibWU9NyBwc3k9MSBwc3lfcmQ9MS4wMDowLjAwIG1peGVkX3JlZj0xIG1lX3JhbmdlPTE2IGNocm9tYV9tZT0xIHRyZWxsaXM9MSA4eDhkY3Q9MSBjcW09MCBkZWFkem9uZT0yMSwxMSBmYXN0X3Bza2lwPTEgY2hyb21hX3FwX29mZnNldD0tMiB0aHJlYWRzPTYgbG9va2FoZWFkX3RocmVhZHM9MSBzbGljZWRfdGhyZWFkcz0wIG5yPTAgZGVjaW1hdGU9MSBpbnRlcmxhY2VkPTAgYmx1cmF5X2NvbXBhdD0wIGNvbnN0cmFpbmVkX2ludHJhPTAgYmZyYW1lcz0zIGJfcHlyYW1pZD0yIGJfYWRhcHQ9MSBiX2JpYXM9MCBkaXJlY3Q9MSB3ZWlnaHRiPTEgb3Blbl9nb3A9MCB3ZWlnaHRwPTIga2V5aW50PTI1MCBrZXlpbnRfbWluPTEwIHNjZW5lY3V0PTQwIGludHJhX3JlZnJlc2g9MCByY19sb29rYWhlYWQ9NDAgcmM9Y3JmIG1idHJlZT0xIGNyZj0yMy4wIHFjb21wPTAuNjAgcXBtaW49MCBxcG1heD02OSBxcHN0ZXA9NCBpcF9yYXRpbz0xLjQwIGFxPTE6MS4wMACAAAAAD2WIhAA3//728P4FNjuY0EA='
    const trackSrcVtt = 'data:text/vtt;base64,V0VCVlRUCgowMDowMDowMS4wMDAgLS0+IDAwOjAwOjA1LjAwMApIZWxsbyBXb3JsZAo='

    const Rendering = e('div', [
        e('h1', 'Element-Specific Tests'),

        // Document structure elements
        e('section', { id: 'document-structure' }, [
            e('h2', 'Document Structure'),
            e('header', { id: 'test-header' }, [
                e('nav', { id: 'test-nav' }, [
                    e('ul', [
                        e('li', e('a', { href: '#home', id: 'nav-link' }, 'Home')),
                        e('li', e('a', { href: '#about', id: 'nav-link-2' }, 'About'))
                    ])
                ])
            ]),
            e('main', { id: 'test-main' }, [
                e('article', { id: 'test-article' }, [
                    e('h3', 'Article Title'),
                    e('p', { id: 'test-paragraph' }, 'This is a paragraph with some text.'),
                    e('aside', { id: 'test-aside' }, 'This is an aside element.')
                ])
            ]),
            e('footer', { id: 'test-footer' }, 'Footer content')
        ]),

        // Text content elements
        e('section', { id: 'text-content' }, [
            e('h2', 'Text Content Elements'),
            e('p', [
                'This paragraph contains ',
                e('strong', { id: 'test-strong' }, 'strong text'),
                ', ',
                e('em', { id: 'test-em' }, 'emphasized text'),
                ', ',
                e('mark', { id: 'test-mark' }, 'highlighted text'),
                ', ',
                e('small', { id: 'test-small' }, 'small text'),
                ', ',
                e('del', { id: 'test-del' }, 'deleted text'),
                ', ',
                e('ins', { id: 'test-ins' }, 'inserted text'),
                ', ',
                e('sub', { id: 'test-sub' }, 'subscript'),
                ', ',
                e('sup', { id: 'test-sup' }, 'superscript'),
                '.'
            ]),
            e('blockquote', {
                id: 'test-blockquote',
                cite: 'https://example.com'
            }, [
                e('p', 'This is a blockquote with a citation.'),
                e('footer', e('cite', { id: 'test-cite' }, 'Source Author'))
            ]),
            e('pre', { id: 'test-pre' }, [
                e('code', { id: 'test-code' }, 'function hello() {\n  console.log("Hello World");\n}')
            ]),
            e('p', [
                'Press ',
                e('kbd', { id: 'test-kbd' }, 'Ctrl+C'),
                ' to copy, and ',
                e('kbd', { id: 'test-kbd-2' }, 'Ctrl+V'),
                ' to paste.'
            ]),
            e('p', [
                'The ',
                e('var', { id: 'test-var' }, 'x'),
                ' variable represents the horizontal position.'
            ]),
            e('p', [
                'Sample output: ',
                e('samp', { id: 'test-samp' }, 'Hello World')
            ])
        ]),

        // Lists
        e('section', { id: 'lists' }, [
            e('h2', 'Lists'),
            e('ul', { id: 'test-ul' }, [
                e('li', { id: 'test-li-1' }, 'First item'),
                e('li', { id: 'test-li-2' }, 'Second item'),
                e('li', { id: 'test-li-3' }, 'Third item')
            ]),
            e('ol', { id: 'test-ol', type: 'A', start: 1 }, [
                e('li', { id: 'test-ol-li-1', value: 1 }, 'First ordered item'),
                e('li', { id: 'test-ol-li-2', value: 2 }, 'Second ordered item')
            ]),
            e('dl', { id: 'test-dl' }, [
                e('dt', { id: 'test-dt-1' }, 'Term 1'),
                e('dd', { id: 'test-dd-1' }, 'Definition 1'),
                e('dt', { id: 'test-dt-2' }, 'Term 2'),
                e('dd', { id: 'test-dd-2' }, 'Definition 2')
            ])
        ]),

        // Tables
        e('section', { id: 'tables' }, [
            e('h2', 'Tables'),
            e('table', { id: 'test-table', border: '1' }, [
                e('caption', { id: 'test-caption' }, 'Test Table Caption'),
                e('colgroup', { id: 'test-colgroup' }, [
                    e('col', { id: 'test-col-1', span: 1, style: 'background-color: #f0f0f0;' }),
                    e('col', { id: 'test-col-2', span: 2 })
                ]),
                e('thead', { id: 'test-thead' }, [
                    e('tr', { id: 'test-header-row' }, [
                        e('th', { id: 'test-th-1', scope: 'col' }, 'Header 1'),
                        e('th', { id: 'test-th-2', scope: 'col' }, 'Header 2'),
                        e('th', { id: 'test-th-3', scope: 'col' }, 'Header 3')
                    ])
                ]),
                e('tbody', { id: 'test-tbody' }, [
                    e('tr', { id: 'test-row-1' }, [
                        e('td', { id: 'test-td-1' }, 'Cell 1'),
                        e('td', { id: 'test-td-2', colspan: 2 }, 'Cell 2 (spans 2 columns)')
                    ]),
                    e('tr', { id: 'test-row-2' }, [
                        e('td', { id: 'test-td-3' }, 'Cell 3'),
                        e('td', { id: 'test-td-4' }, 'Cell 4'),
                        e('td', { id: 'test-td-5', rowspan: 2 }, 'Cell 5 (spans 2 rows)')
                    ]),
                    e('tr', { id: 'test-row-3' }, [
                        e('td', { id: 'test-td-6' }, 'Cell 6'),
                        e('td', { id: 'test-td-7' }, 'Cell 7')
                    ])
                ]),
                e('tfoot', { id: 'test-tfoot' }, [
                    e('tr', { id: 'test-footer-row' }, [
                        e('td', { id: 'test-footer-td', colspan: 3 }, 'Footer content')
                    ])
                ])
            ])
        ]),

        // Forms
        e('section', { id: 'forms' }, [
            e('h2', 'Forms'),
            e('form', {
                id: 'test-form',
                method: 'post',
                action: '/submit',
                enctype: 'multipart/form-data',
                noValidate: false
            }, [
                e('fieldset', { id: 'test-fieldset', disabled: false }, [
                    e('legend', { id: 'test-legend' }, 'Personal Information'),

                    e('label', { id: 'test-label-text', for: 'text-input' }, 'Name:'),
                    e('input', {
                        id: 'text-input',
                        type: 'text',
                        name: 'name',
                        value: 'John Doe',
                        placeholder: 'Enter your name',
                        required: true,
                        maxlength: 50
                    }),
                    e('br'),

                    e('label', { id: 'test-label-email', for: 'email-input' }, 'Email:'),
                    e('input', {
                        id: 'email-input',
                        type: 'email',
                        name: 'email',
                        placeholder: 'Enter your email',
                        required: true
                    }),
                    e('br'),

                    e('label', { id: 'test-label-password', for: 'password-input' }, 'Password:'),
                    e('input', {
                        id: 'password-input',
                        type: 'password',
                        name: 'password',
                        minlength: 8,
                        required: true
                    }),
                    e('br'),

                    e('label', { id: 'test-label-number', for: 'number-input' }, 'Age:'),
                    e('input', {
                        id: 'number-input',
                        type: 'number',
                        name: 'age',
                        min: 18,
                        max: 120,
                        step: 1,
                        value: 25
                    }),
                    e('br'),

                    e('label', { id: 'test-label-range', for: 'range-input' }, 'Rating:'),
                    e('input', {
                        id: 'range-input',
                        type: 'range',
                        name: 'rating',
                        min: 1,
                        max: 10,
                        value: 5,
                        step: 1
                    }),
                    e('br'),

                    e('label', { id: 'test-label-date', for: 'date-input' }, 'Birth Date:'),
                    e('input', {
                        id: 'date-input',
                        type: 'date',
                        name: 'birthdate',
                        value: '1990-01-01'
                    }),
                    e('br'),

                    e('label', { id: 'test-label-file', for: 'file-input' }, 'Upload File:'),
                    e('input', {
                        id: 'file-input',
                        type: 'file',
                        name: 'upload',
                        accept: '.jpg,.png,.pdf',
                        multiple: true
                    }),
                    e('br'),

                    e('input', {
                        id: 'checkbox-input',
                        type: 'checkbox',
                        name: 'subscribe',
                        checked: true,
                        value: 'yes'
                    }),
                    e('label', { id: 'test-label-checkbox', for: 'checkbox-input' }, 'Subscribe to newsletter'),
                    e('br'),

                    e('input', {
                        id: 'radio-input-1',
                        type: 'radio',
                        name: 'gender',
                        value: 'male',
                        checked: true
                    }),
                    e('label', { id: 'test-label-radio-1', for: 'radio-input-1' }, 'Male'),

                    e('input', {
                        id: 'radio-input-2',
                        type: 'radio',
                        name: 'gender',
                        value: 'female'
                    }),
                    e('label', { id: 'test-label-radio-2', for: 'radio-input-2' }, 'Female'),
                    e('br'),

                    e('label', { id: 'test-label-select', for: 'select-input' }, 'Country:'),
                    e('select', {
                        id: 'select-input',
                        name: 'country',
                        required: true,
                        size: 1
                    }, [
                        e('option', { id: 'option-1', value: '', disabled: true, selected: true }, 'Select a country'),
                        e('optgroup', { id: 'test-optgroup-1', label: 'North America' }, [
                            e('option', { id: 'option-us', value: 'us' }, 'United States'),
                            e('option', { id: 'option-ca', value: 'ca' }, 'Canada')
                        ]),
                        e('optgroup', { id: 'test-optgroup-2', label: 'Europe' }, [
                            e('option', { id: 'option-uk', value: 'uk' }, 'United Kingdom'),
                            e('option', { id: 'option-de', value: 'de' }, 'Germany')
                        ])
                    ]),
                    e('br'),

                    e('label', { id: 'test-label-textarea', for: 'textarea-input' }, 'Comments:'),
                    e('textarea', {
                        id: 'textarea-input',
                        name: 'comments',
                        rows: 4,
                        cols: 50,
                        placeholder: 'Enter your comments here...',
                        maxlength: 500
                    }, 'Default textarea content'),
                    e('br'),

                    e('button', {
                        id: 'submit-button',
                        type: 'submit',
                        disabled: false
                    }, 'Submit'),

                    e('button', {
                        id: 'reset-button',
                        type: 'reset'
                    }, 'Reset'),

                    e('button', {
                        id: 'custom-button',
                        type: 'button',
                        onclick: 'alert("Clicked!")'
                    }, 'Custom Action')
                ])
            ])
        ]),

        // Media elements
        e('section', { id: 'media' }, [
            e('h2', 'Media Elements'),
            e('img', {
                id: 'test-img',
                src: imgSrcSvg,
                alt: 'Test image description',
                width: 100,
                height: 100,
                loading: 'lazy'
            }),

            e('audio', {
                id: 'test-audio',
                controls: true,
                preload: 'metadata',
                loop: false,
                muted: false
            }, [
                e('source', {
                    id: 'audio-source-1',
                    src: 'audio.mp3',
                    type: 'audio/mpeg'
                }),
                e('source', {
                    id: 'audio-source-2',
                    src: 'audio.ogg',
                    type: 'audio/ogg'
                }),
                'Your browser does not support the audio element.'
            ]),

            e('video', {
                id: 'test-video',
                controls: true,
                width: 320,
                height: 240,
                preload: 'none',
                poster: 'poster.jpg'
            }, [
                e('source', {
                    id: 'video-source-1',
                    src: 'video.mp4',
                    type: 'video/mp4'
                }),
                e('track', {
                    id: 'video-track',
                    kind: 'subtitles',
                    src: 'subtitles.vtt',
                    srclang: 'en',
                    label: 'English'
                }),
                'Your browser does not support the video element.'
            ])
        ]),

        // Interactive elements
        e('section', { id: 'interactive' }, [
            e('h2', 'Interactive Elements'),
            e('details', { id: 'test-details', open: false }, [
                e('summary', { id: 'test-summary' }, 'Click to expand'),
                e('p', 'This content is hidden by default and shown when details is opened.')
            ]),

            e('dialog', { id: 'test-dialog', open: false }, [
                e('p', 'This is a dialog element.'),
                e('button', { id: 'close-dialog' }, 'Close')
            ])
        ]),

        // Embedded content
        e('section', { id: 'embedded' }, [
            e('h2', 'Embedded Content'),
            e('iframe', {
                id: 'test-iframe',
                src: 'about:blank',
                width: 300,
                height: 200,
                title: 'Test iframe',
                sandbox: 'allow-scripts allow-same-origin'
            }),

            e('embed', {
                id: 'test-embed',
                src: 'test.pdf',
                type: 'application/pdf',
                width: 300,
                height: 200
            }),

            e('object', {
                id: 'test-object',
                data: 'test.pdf',
                type: 'application/pdf',
                width: 300,
                height: 200
            }, 'Fallback content for object'),

            e('canvas', {
                id: 'test-canvas',
                width: 300,
                height: 150
            }, 'Canvas not supported')
        ]),

        // SVG
        e('section', { id: 'svg-section' }, [
            e('h2', 'SVG Elements'),
            e('svg', {
                id: 'test-svg',
                width: 200,
                height: 200,
                xmlns: 'http://www.w3.org/2000/svg',
                viewBox: '0 0 200 200'
            }, [
                e('defs', { id: 'svg-defs' }, [
                    e('linearGradient', {
                        id: 'test-gradient',
                        x1: '0%',
                        y1: '0%',
                        x2: '100%',
                        y2: '100%'
                    }, [
                        e('stop', {
                            id: 'gradient-stop-1',
                            offset: '0%',
                            'stop-color': '#ff0000'
                        }),
                        e('stop', {
                            id: 'gradient-stop-2',
                            offset: '100%',
                            'stop-color': '#0000ff'
                        })
                    ])
                ]),
                e('rect', {
                    id: 'svg-rect',
                    x: 10,
                    y: 10,
                    width: 80,
                    height: 80,
                    fill: 'url(#test-gradient)',
                    stroke: '#000',
                    'stroke-width': 2
                }),
                e('circle', {
                    id: 'svg-circle',
                    cx: 150,
                    cy: 50,
                    r: 30,
                    fill: '#00ff00'
                }),
                e('ellipse', {
                    id: 'svg-ellipse',
                    cx: 50,
                    cy: 150,
                    rx: 40,
                    ry: 20,
                    fill: '#ffff00'
                }),
                e('line', {
                    id: 'svg-line',
                    x1: 100,
                    y1: 100,
                    x2: 180,
                    y2: 180,
                    stroke: '#ff00ff',
                    'stroke-width': 3
                }),
                e('polyline', {
                    id: 'svg-polyline',
                    points: '120,120 140,140 160,120 180,140',
                    fill: 'none',
                    stroke: '#00ffff',
                    'stroke-width': 2
                }),
                e('polygon', {
                    id: 'svg-polygon',
                    points: '150,150 170,180 130,180',
                    fill: '#ff8800'
                }),
                e('path', {
                    id: 'svg-path',
                    d: 'M 10 190 Q 50 170 90 190',
                    fill: 'none',
                    stroke: '#8800ff',
                    'stroke-width': 2
                }),
                e('text', {
                    id: 'svg-text',
                    x: 100,
                    y: 30,
                    fill: '#000'
                }, 'SVG Text'),
                e('g', {
                    id: 'svg-group',
                    transform: 'translate(10, 10)'
                }, [
                    e('rect', {
                        id: 'grouped-rect',
                        x: 0,
                        y: 0,
                        width: 20,
                        height: 20,
                        fill: '#ff0000'
                    })
                ])
            ])
        ]),

        e('section', { id: 'form-boolean-attributes' }, [
            e('h2', 'Form Boolean Attributes'),

            // Autofocus - true/false
            e('input', {
                id: 'input-autofocus-true',
                type: 'text',
                autofocus: true,
                placeholder: 'Has autofocus'
            }),
            e('input', {
                id: 'input-autofocus-false',
                type: 'text',
                autofocus: false,
                placeholder: 'No autofocus'
            }),

            // Checked - true/false
            e('input', {
                id: 'checkbox-checked-true',
                type: 'checkbox',
                checked: true,
                value: 'checked-true'
            }),
            e('label', { for: 'checkbox-checked-true' }, 'Checked checkbox'),

            e('input', {
                id: 'checkbox-checked-false',
                type: 'checkbox',
                checked: false,
                value: 'checked-false'
            }),
            e('label', { for: 'checkbox-checked-false' }, 'Unchecked checkbox'),

            // Radio buttons - checked true/false
            e('input', {
                id: 'radio-checked-true',
                type: 'radio',
                name: 'radio-group',
                checked: true,
                value: 'option1'
            }),
            e('label', { for: 'radio-checked-true' }, 'Checked radio'),

            e('input', {
                id: 'radio-checked-false',
                type: 'radio',
                name: 'radio-group',
                checked: false,
                value: 'option2'
            }),
            e('label', { for: 'radio-checked-false' }, 'Unchecked radio'),

            // Disabled - true/false
            e('input', {
                id: 'input-disabled-true',
                type: 'text',
                disabled: true,
                value: 'Disabled input'
            }),
            e('input', {
                id: 'input-disabled-false',
                type: 'text',
                disabled: false,
                value: 'Enabled input'
            }),

            e('button', {
                id: 'button-disabled-true',
                disabled: true
            }, 'Disabled Button'),
            e('button', {
                id: 'button-disabled-false',
                disabled: false
            }, 'Enabled Button'),

            e('select', {
                id: 'select-disabled-true',
                disabled: true
            }, [
                e('option', { value: '1' }, 'Option 1')
            ]),
            e('select', {
                id: 'select-disabled-false',
                disabled: false
            }, [
                e('option', { value: '1' }, 'Option 1')
            ]),

            e('textarea', {
                id: 'textarea-disabled-true',
                disabled: true
            }, 'Disabled textarea'),
            e('textarea', {
                id: 'textarea-disabled-false',
                disabled: false
            }, 'Enabled textarea'),

            e('fieldset', {
                id: 'fieldset-disabled-true',
                disabled: true
            }, [
                e('legend', 'Disabled Fieldset'),
                e('input', { type: 'text', value: 'Input in disabled fieldset' })
            ]),
            e('fieldset', {
                id: 'fieldset-disabled-false',
                disabled: false
            }, [
                e('legend', 'Enabled Fieldset'),
                e('input', { type: 'text', value: 'Input in enabled fieldset' })
            ]),

            // Hidden - true/false
            e('div', {
                id: 'div-hidden-true',
                hidden: true
            }, 'This div is hidden'),
            e('div', {
                id: 'div-hidden-false',
                hidden: false
            }, 'This div is visible'),

            // Multiple - true/false
            e('select', {
                id: 'select-multiple-true',
                multiple: true,
                size: 3
            }, [
                e('option', { value: '1' }, 'Option 1'),
                e('option', { value: '2' }, 'Option 2'),
                e('option', { value: '3' }, 'Option 3')
            ]),
            e('select', {
                id: 'select-multiple-false',
                multiple: false
            }, [
                e('option', { value: '1' }, 'Option 1'),
                e('option', { value: '2' }, 'Option 2')
            ]),

            e('input', {
                id: 'file-multiple-true',
                type: 'file',
                multiple: true
            }),
            e('input', {
                id: 'file-multiple-false',
                type: 'file',
                multiple: false
            }),

            // Readonly - true/false
            e('input', {
                id: 'input-readonly-true',
                type: 'text',
                readOnly: true,
                value: 'Read-only input'
            }),
            e('input', {
                id: 'input-readonly-false',
                type: 'text',
                readOnly: false,
                value: 'Editable input'
            }),

            e('textarea', {
                id: 'textarea-readonly-true',
                readOnly: true
            }, 'Read-only textarea'),
            e('textarea', {
                id: 'textarea-readonly-false',
                readOnly: false
            }, 'Editable textarea'),

            // Required - true/false
            e('input', {
                id: 'input-required-true',
                type: 'text',
                required: true,
                placeholder: 'Required field'
            }),
            e('input', {
                id: 'input-required-false',
                type: 'text',
                required: false,
                placeholder: 'Optional field'
            }),

            e('select', {
                id: 'select-required-true',
                required: true
            }, [
                e('option', { value: '' }, 'Select an option'),
                e('option', { value: '1' }, 'Option 1')
            ]),
            e('select', {
                id: 'select-required-false',
                required: false
            }, [
                e('option', { value: '' }, 'Select an option'),
                e('option', { value: '1' }, 'Option 1')
            ]),

            e('textarea', {
                id: 'textarea-required-true',
                required: true,
                placeholder: 'Required textarea'
            }, ''),
            e('textarea', {
                id: 'textarea-required-false',
                required: false,
                placeholder: 'Optional textarea'
            }, ''),

            // Selected - true/false
            e('select', { id: 'select-with-options' }, [
                e('option', {
                    id: 'option-selected-true',
                    value: 'selected',
                    selected: true
                }, 'Selected Option'),
                e('option', {
                    id: 'option-selected-false',
                    value: 'not-selected',
                    selected: false
                }, 'Not Selected Option')
            ])
        ]),

        // Form Validation Boolean Attributes
        e('section', { id: 'form-validation-attributes' }, [
            e('h2', 'Form Validation Attributes'),

            e('form', {
                id: 'form-novalidate-true',
                noValidate: true
            }, [
                e('input', { type: 'email', required: true, placeholder: 'Email (no validation)' }),
                e('button', { type: 'submit' }, 'Submit (No Validation)')
            ]),

            e('form', {
                id: 'form-novalidate-false',
                noValidate: false
            }, [
                e('input', { type: 'email', required: true, placeholder: 'Email (with validation)' }),
                e('button', { type: 'submit' }, 'Submit (With Validation)')
            ]),

            e('form', [
                e('input', { type: 'email', required: true, placeholder: 'Email field' }),
                e('button', {
                    id: 'button-formnovalidate-true',
                    type: 'submit',
                    formNoValidate: true
                }, 'Submit (Skip Validation)'),
                e('button', {
                    id: 'button-formnovalidate-false',
                    type: 'submit',
                    formNoValidate: false
                }, 'Submit (With Validation)')
            ])
        ]),

        // Media Boolean Attributes
        e('section', { id: 'media-attributes' }, [
            e('h2', 'Media Attributes'),

            // Autoplay - true/false
            e('audio', {
                id: 'audio-autoplay-true',
                autoplay: true,
                muted: true // Required for autoplay in most browsers
            }, [
                e('source', { src: audioSrcWav }),
                'Autoplay enabled audio'
            ]),
            e('audio', {
                id: 'audio-autoplay-false',
                autoplay: false,
                controls: true
            }, [
                e('source', { src: audioSrcWav }),
                'No autoplay audio'
            ]),

            e('video', {
                id: 'video-autoplay-true',
                autoplay: true,
                muted: true,
                width: 200,
                height: 150
            }, [
                e('source', {
                    src: videoSrcMp4,
                    type: 'video/mp4'
                }),
                'Autoplay enabled video'
            ]),
            e('video', {
                id: 'video-autoplay-false',
                autoplay: false,
                controls: true,
                width: 200,
                height: 150
            }, [
                e('source', {
                    src: videoSrcMp4,
                    type: 'video/mp4'
                }),
                'No autoplay video'
            ]),

            // Controls - true/false
            e('audio', {
                id: 'audio-controls-true',
                controls: true
            }, [
                e('source', { src: audioSrcWav }),
                'Audio with controls'
            ]),
            e('audio', {
                id: 'audio-controls-false',
                controls: false
            }, [
                e('source', { src: audioSrcWav }),
                'Audio without controls'
            ]),

            // Loop - true/false
            e('audio', {
                id: 'audio-loop-true',
                loop: true,
                controls: true
            }, [
                e('source', { src: audioSrcWav }),
                'Looping audio'
            ]),
            e('audio', {
                id: 'audio-loop-false',
                loop: false,
                controls: true
            }, [
                e('source', { src: audioSrcWav }),
                'Non-looping audio'
            ]),

            // Muted - true/false
            e('audio', {
                id: 'audio-muted-true',
                muted: true,
                controls: true
            }, [
                e('source', { src: audioSrcWav }),
                'Muted audio'
            ]),
            e('audio', {
                id: 'audio-muted-false',
                muted: false,
                controls: true
            }, [
                e('source', { src: audioSrcWav }),
                'Unmuted audio'
            ]),

            // Default track - true/false
            e('video', {
                id: 'video-with-tracks',
                controls: true,
                width: 300,
                height: 200
            }, [
                e('source', {
                    src: videoSrcMp4,
                    type: 'video/mp4'
                }),
                e('track', {
                    id: 'track-default-true',
                    kind: 'subtitles',
                    src: trackSrcVtt,
                    srclang: 'en',
                    label: 'English (Default)',
                    default: true
                }),
                e('track', {
                    id: 'track-default-false',
                    kind: 'subtitles',
                    src: trackSrcVtt,
                    srclang: 'es',
                    label: 'Spanish',
                    default: false
                })
            ])
        ]),

        // Script Boolean Attributes
        e('section', { id: 'script-attributes' }, [
            e('h2', 'Script Attributes'),

            // Note: We can't actually test script execution in this context,
            // but we can test the attribute presence
            e('div', { id: 'script-container' }, [
                'Script elements with async/defer attributes would go here',
                e('div', {
                    id: 'script-async-true',
                    'data-script-async': true
                }, 'Represents script with async=true'),
                e('div', {
                    id: 'script-async-false',
                    'data-script-async': false
                }, 'Represents script with async=false'),
                e('div', {
                    id: 'script-defer-true',
                    'data-script-defer': true
                }, 'Represents script with defer=true'),
                e('div', {
                    id: 'script-defer-false',
                    'data-script-defer': false
                }, 'Represents script with defer=false')
            ])
        ]),

        // List Boolean Attributes
        e('section', { id: 'list-attributes' }, [
            e('h2', 'List Attributes'),

            // Reversed - true/false
            e('ol', {
                id: 'ol-reversed-true',
                reversed: true,
                start: 5
            }, [
                e('li', 'First item (5)'),
                e('li', 'Second item (4)'),
                e('li', 'Third item (3)')
            ]),
            e('ol', {
                id: 'ol-reversed-false',
                reversed: false,
                start: 1
            }, [
                e('li', 'First item (1)'),
                e('li', 'Second item (2)'),
                e('li', 'Third item (3)')
            ])
        ]),

        // Interactive Boolean Attributes
        e('section', { id: 'interactive-attributes' }, [
            e('h2', 'Interactive Attributes'),

            // Open - true/false
            e('details', {
                id: 'details-open-true',
                open: true
            }, [
                e('summary', 'Details opened by default'),
                e('p', 'This content is visible because open=true')
            ]),
            e('details', {
                id: 'details-open-false',
                open: false
            }, [
                e('summary', 'Details closed by default'),
                e('p', 'This content is hidden because open=false')
            ]),

            // Dialog open - true/false
            e('dialog', {
                id: 'dialog-open-true',
                open: true
            }, [
                e('p', 'This dialog is open'),
                e('button', { type: 'button' }, 'Close')
            ]),
            e('dialog', {
                id: 'dialog-open-false',
                open: false
            }, [
                e('p', 'This dialog is closed'),
                e('button', { type: 'button' }, 'Close')
            ])
        ]),

        // Image Boolean Attributes
        e('section', { id: 'image-attributes' }, [
            e('h2', 'Image Attributes'),

            // Note: ismap requires the img to be inside an <a> element
            e('a', { href: '#' }, [
                e('img', {
                    id: 'img-ismap-true',
                    src: imgSrcSvg,
                    alt: 'Server-side image map',
                    isMap: true,
                    width: 100,
                    height: 100
                })
            ]),
            e('img', {
                id: 'img-ismap-false',
                src: imgSrcSvg,
                alt: 'Regular image',
                isMap: false,
                width: 100,
                height: 100
            })
        ])
    ]);

    renderApp(Rendering, document.getElementById('container'));
});
