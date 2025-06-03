import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/dynamic-type');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Dynamic Type Update Tests', () => {
    describe('Basic Type Changes', () => {
        test('element changes from div to span', async () => {
            // Start with div
            await page.click('#set-div-btn');
            await page.waitForSelector('#basic-element');

            expect(await page.$eval('#basic-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#basic-element', el => el.textContent)).toBe('I am a div');

            // Change to span
            await page.click('#set-span-btn');
            await page.waitForFunction(() => {
                const element = document.querySelector('#basic-element');
                return element && element.tagName.toLowerCase() === 'span';
            });

            expect(await page.$eval('#basic-element', el => el.tagName.toLowerCase())).toBe('span');
            expect(await page.$eval('#basic-element', el => el.textContent)).toBe('I am a span');
        });

        test('element changes from button to input', async () => {
            // Start with button
            await page.click('#set-button-btn');
            await page.waitForSelector('#interactive-element');

            expect(await page.$eval('#interactive-element', el => el.tagName.toLowerCase())).toBe('button');
            expect(await page.$eval('#interactive-element', el => el.textContent)).toBe('Click me');

            // Change to input
            await page.click('#set-input-btn');
            await page.waitForSelector('input#interactive-element')

            expect(await page.$eval('#interactive-element', el => el.tagName.toLowerCase())).toBe('input');
            expect(await page.$eval('input#interactive-element', el => el.placeholder)).toBe('Type here');
        });

        test('element changes from p to h1', async () => {
            // Start with paragraph
            await page.click('#set-paragraph-btn');
            await page.waitForSelector('#text-element');

            expect(await page.$eval('#text-element', el => el.tagName.toLowerCase())).toBe('p');
            expect(await page.$eval('#text-element', el => el.textContent)).toBe('Paragraph text');

            // Change to heading
            await page.click('#set-heading-btn');
            await page.waitForSelector('h1#text-element');

            expect(await page.$eval('#text-element', el => el.tagName.toLowerCase())).toBe('h1');
            expect(await page.$eval('#text-element', el => el.textContent)).toBe('Heading text');
        });
    });

    describe('Attribute Preservation During Type Changes', () => {
        test('id and class attributes are preserved when type changes', async () => {
            // Start with div
            await page.click('#set-styled-div-btn');
            await page.waitForSelector('#styled-element');

            expect(await page.$eval('#styled-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#styled-element', el => el.className)).toBe('test-class');
            expect(await page.$eval('#styled-element', el => el.id)).toBe('styled-element');

            // Change to span - attributes should be preserved
            await page.click('#set-styled-span-btn');
            await page.waitForSelector('span#styled-element')

            expect(await page.$eval('#styled-element', el => el.tagName.toLowerCase())).toBe('span');
            expect(await page.$eval('#styled-element', el => el.className)).toBe('test-class');
            expect(await page.$eval('#styled-element', el => el.id)).toBe('styled-element');
        });

        test('data attributes are preserved during type changes', async () => {
            // Start with div with data attributes
            await page.click('#set-data-div-btn');
            await page.waitForSelector('#data-element');

            expect(await page.$eval('#data-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('div#data-element', el => el.dataset.testValue)).toBe('123');
            expect(await page.$eval('div#data-element', el => el.dataset.customAttr)).toBe('preserved');

            // Change to section
            await page.click('#set-data-section-btn');
            await page.waitForSelector('section#data-element');

            expect(await page.$eval('#data-element', el => el.tagName.toLowerCase())).toBe('section');
            expect(await page.$eval('section#data-element', el => el.dataset.testValue)).toBe('123');
            expect(await page.$eval('section#data-element', el => el.dataset.customAttr)).toBe('preserved');
        });

        test('style attributes are preserved during type changes', async () => {
            // Start with div with inline styles
            await page.click('#set-styled-div-inline-btn');
            await page.waitForSelector('#inline-styled-element');

            expect(await page.$eval('#inline-styled-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('div#inline-styled-element', el => el.style.backgroundColor)).toBe('red');
            expect(await page.$eval('div#inline-styled-element', el => el.style.padding)).toBe('10px');

            // Change to article
            await page.click('#set-styled-article-btn');
            await page.waitForSelector('article#inline-styled-element')

            expect(await page.$eval('#inline-styled-element', el => el.tagName.toLowerCase())).toBe('article');
            expect(await page.$eval('article#inline-styled-element', el => el.style.backgroundColor)).toBe('red');
            expect(await page.$eval('article#inline-styled-element', el => el.style.padding)).toBe('10px');
        });
    });

    describe('Event Handler Preservation', () => {
        test('click handlers are preserved when element type changes', async () => {
            // Start with div that has click handler
            await page.click('#set-clickable-div-btn');
            await page.waitForSelector('#clickable-element');

            expect(await page.$eval('#clickable-element', el => el.tagName.toLowerCase())).toBe('div');

            // Click the div
            await page.click('#clickable-element');
            await page.waitForSelector('#click-counter');

            expect(await page.$eval('#click-counter', el => el.textContent)).toBe('Clicks: 1');

            // Change to button
            await page.click('#set-clickable-button-btn');
            await page.waitForSelector('button#clickable-element');

            expect(await page.$eval('#clickable-element', el => el.tagName.toLowerCase())).toBe('button');

            // Click the button - handler should still work
            await page.click('#clickable-element');
            await page.waitForFunction(() => {
                const counter = document.querySelector('#click-counter');
                return counter && counter.textContent === 'Clicks: 2';
            });

            expect(await page.$eval('#click-counter', el => el.textContent)).toBe('Clicks: 2');
        });

        test('input handlers are preserved when changing input types', async () => {
            // Start with text input
            await page.click('#set-text-input-btn');
            await page.waitForSelector('#input-element');

            expect(await page.$eval('input#input-element', el => el.type)).toBe('text');

            const text = 'test'
            // Type in the input
            await page.type('#input-element', text);
            await page.waitForSelector('#input-value');

            expect(await page.$eval('#input-value', el => el.textContent)).toBe('Value: test');

            // Change to password input
            await page.click('#set-password-input-btn');
            await page.waitForSelector('input#input-element[type="password"]');

            expect(await page.$eval('input#input-element', el => el.type)).toBe('password');

            // Clear and type again - handler should still work
            await page.click('#input-element')
            for (let i = 0; i < text.length; i++) {
                await page.keyboard.press('Backspace')
            }
            await page.type('#input-element', 'secret');

            await page.waitForFunction(() => {
                const valueDisplay = document.querySelector('#input-value');
                return valueDisplay && valueDisplay.textContent === 'Value: secret';
            });

            expect(await page.$eval('#input-value', el => el.textContent)).toBe('Value: secret');
        });
    });

    describe('Children Preservation During Type Changes', () => {
        test('child elements are preserved when parent type changes', async () => {
            // Start with div containing children
            await page.click('#set-parent-div-btn');
            await page.waitForSelector('#parent-element');

            expect(await page.$eval('#parent-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$$eval('#parent-element > *', els => els.length)).toBe(3);
            expect(await page.$eval('#child-1', el => el.textContent)).toBe('Child 1');
            expect(await page.$eval('#child-2', el => el.textContent)).toBe('Child 2');
            expect(await page.$eval('#child-3', el => el.textContent)).toBe('Child 3');

            // Change to section
            await page.click('#set-parent-section-btn');
            await page.waitForSelector('section#parent-element')

            expect(await page.$eval('#parent-element', el => el.tagName.toLowerCase())).toBe('section');
            expect(await page.$$eval('#parent-element > *', els => els.length)).toBe(3);
            expect(await page.$eval('#child-1', el => el.textContent)).toBe('Child 1');
            expect(await page.$eval('#child-2', el => el.textContent)).toBe('Child 2');
            expect(await page.$eval('#child-3', el => el.textContent)).toBe('Child 3');
        });

        test('nested structure is preserved during type changes', async () => {
            // Start with nested structure
            await page.click('#set-nested-div-btn');
            await page.waitForSelector('#nested-parent');

            expect(await page.$eval('#nested-parent', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#nested-child', el => el.tagName.toLowerCase())).toBe('span');
            expect(await page.$eval('#nested-grandchild', el => el.textContent)).toBe('Grandchild');

            // Change parent to article
            await page.click('#set-nested-article-btn');
            await page.waitForSelector('article#nested-parent')

            expect(await page.$eval('#nested-parent', el => el.tagName.toLowerCase())).toBe('article');
            expect(await page.$eval('#nested-child', el => el.tagName.toLowerCase())).toBe('span');
            expect(await page.$eval('#nested-grandchild', el => el.textContent)).toBe('Grandchild');
        });
    });

    describe('Form Element Type Changes', () => {
        test('input type changes preserve value', async () => {
            // Start with text input and set value
            await page.click('#set-form-text-btn');
            await page.waitForSelector('#form-input');

            expect(await page.$eval('input#form-input', el => el.type)).toBe('text');

            await page.type('#form-input', 'initial value');
            expect(await page.$eval('input#form-input', el => el.value)).toBe('initial value');

            // Change to email input
            await page.click('#set-form-email-btn');
            await page.waitForSelector('input#form-input[type="email"]')

            expect(await page.$eval('input#form-input', el => el.type)).toBe('email');
            expect(await page.$eval('input#form-input', el => el.value)).toBe('initial value');
        });

        test('textarea to input conversion', async () => {
            // Start with textarea
            await page.click('#set-textarea-btn');
            await page.waitForSelector('textarea#text-field');

            expect(await page.$eval('#text-field', el => el.tagName.toLowerCase())).toBe('textarea');

            await page.type('#text-field', 'textarea content');
            expect(await page.$eval('textarea#text-field', el => el.value)).toBe('textarea content');

            // Change to input
            await page.click('#set-text-field-input-btn');
            await page.waitForSelector('input#text-field');
            expect(await page.$eval('#text-field', el => el.tagName.toLowerCase())).toBe('input');
            expect(await page.$eval('input#text-field', el => el.value)).toBe('textarea content');
        });

        test('select to input conversion', async () => {
            // Start with select
            await page.click('#set-select-btn');
            await page.waitForSelector('#choice-field');

            expect(await page.$eval('#choice-field', el => el.tagName.toLowerCase())).toBe('select');

            await page.select('#choice-field', 'option2');
            expect(await page.$eval('select#choice-field', el => el.value)).toBe('option2');

            // Change to input
            await page.click('#set-choice-input-btn');
            await page.waitForSelector('input#choice-field')
            expect(await page.$eval('#choice-field', el => el.tagName.toLowerCase())).toBe('input');
            expect(await page.$eval('input#choice-field', el => el.value)).toBe('option2');

            // Change back to select. Value should retain
            await page.click('#set-select-btn');
            await page.waitForSelector('select#choice-field');
            expect(await page.$eval('#choice-field', el => el.tagName.toLowerCase())).toBe('select');
            expect(await page.$eval('select#choice-field', el => el.value)).toBe('option2');

            await page.click('#set-choice-input-btn');
            await page.waitForSelector('input#choice-field')
            await page.click('input#choice-field')
            await page.keyboard.press('Backspace')
            await page.type('input#choice-field', '3') // results in 'option3'
            expect(await page.$eval('input#choice-field', el => el.value)).toBe('option3');

            await page.click('#set-select-btn');
            await page.waitForSelector('select#choice-field');
            expect(await page.$eval('select#choice-field', el => el.value)).toBe('option3');
        });
    });

    describe('Complex Type Change Scenarios', () => {
        test('rapid type changes maintain stability', async () => {
            const types = ['div', 'span', 'p', 'section', 'article'];

            for (let i = 0; i < types.length; i++) {
                await page.click(`#set-rapid-${types[i]}-btn`);
                await page.waitForSelector(`${types[i]}#rapid-element`)

                expect(await page.$eval('#rapid-element', el => el.tagName.toLowerCase())).toBe(types[i]);
                expect(await page.$eval('#rapid-element', el => el.textContent)).toBe(`I am a ${types[i]}`);
            }
        });

        test('type changes with simultaneous attribute updates', async () => {
            // Start with div
            await page.click('#set-combined-div-btn');
            await page.waitForSelector('#combined-element');

            expect(await page.$eval('#combined-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#combined-element', el => el.className)).toBe('div-class');

            // Change to span with different class
            await page.click('#set-combined-span-btn');
            await page.waitForSelector('span#combined-element.span-class')

            expect(await page.$eval('#combined-element', el => el.tagName.toLowerCase())).toBe('span');
            expect(await page.$eval('#combined-element', el => el.className)).toBe('span-class');
        });

        test('type changes in list context preserve order', async () => {
            const getListOrder = async () => {
                return await page.$$eval('#list-container > *', els =>
                    els.map(el => ({ tag: el.tagName.toLowerCase(), id: el.id }))
                );
            };

            // Initial state
            await page.click('#set-list-initial-btn');
            await page.waitForSelector('#list-item-1');

            expect(await getListOrder()).toEqual([
                { tag: 'div', id: 'list-item-1' },
                { tag: 'div', id: 'list-item-2' },
                { tag: 'div', id: 'list-item-3' }
            ]);

            // Change middle item to span
            await page.click('#set-list-middle-span-btn');
            await page.waitForSelector('span#list-item-2')

            expect(await getListOrder()).toEqual([
                { tag: 'div', id: 'list-item-1' },
                { tag: 'span', id: 'list-item-2' },
                { tag: 'div', id: 'list-item-3' }
            ]);
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('changing to invalid element type rendering invalid element', async () => {
            // Start with valid element
            await page.click('#set-valid-element-btn');
            await page.waitForSelector('#edge-case-element');

            expect(await page.$eval('#edge-case-element', el => el.tagName.toLowerCase())).toBe('div');

            // Attempt to change to invalid type (should fallback or handle gracefully)
            await page.click('#set-invalid-element-btn');

            // Element should still exist and be functional
            expect(await page.$eval('#edge-case-element', el => el.tagName.toLowerCase())).toBe('invalid');
        });

        test('type changes with conflicting attributes', async () => {
            // Start with input
            await page.click('#set-conflict-input-btn');
            await page.waitForSelector('#conflict-element');

            expect(await page.$eval('#conflict-element', el => el.tagName.toLowerCase())).toBe('input');
            expect(await page.$eval('input#conflict-element', el => el.type)).toBe('text');

            // Change to div (type attribute should be ignored/removed)
            await page.click('#set-conflict-div-btn');
            await page.waitForSelector('div#conflict-element')

            expect(await page.$eval('#conflict-element', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#conflict-element', el => el.hasAttribute('type'))).toBe(false);
        });

        test('deeply nested type changes', async () => {
            // Start with nested structure
            await page.click('#set-deep-nested-btn');
            await page.waitForSelector('div#deep-level-1')
            await page.waitForSelector('span#deep-level-2')
            await page.waitForSelector('p#deep-level-3')

            expect(await page.$eval('#deep-level-1', el => el.tagName.toLowerCase())).toBe('div');
            expect(await page.$eval('#deep-level-2', el => el.tagName.toLowerCase())).toBe('span');
            expect(await page.$eval('#deep-level-3', el => el.tagName.toLowerCase())).toBe('p');

            // Change all levels simultaneously
            await page.click('#set-deep-nested-changed-btn');

            await page.waitForSelector('section#deep-level-1')
            await page.waitForSelector('article#deep-level-2')
            await page.waitForSelector('h2#deep-level-3')

            expect(await page.$eval('#deep-level-1', el => el.tagName.toLowerCase())).toBe('section');
            expect(await page.$eval('#deep-level-2', el => el.tagName.toLowerCase())).toBe('article');
            expect(await page.$eval('#deep-level-3', el => el.tagName.toLowerCase())).toBe('h2');
        });
    });
});
