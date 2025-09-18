import { beforeAll, afterAll, describe, expect, test, beforeEach } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/dynamic-attributes');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Dynamic Attributes Update Tests', () => {
    describe.only('Whole Attributes Object Updates', () => {
        test('updates entire attributes object from initial to updated', async () => {
            // Start with initial attributes
            await page.click('#set-initial-attrs-btn');
            await page.waitForSelector('#whole-attrs-element');

            expect(await page.$eval('#whole-attrs-element', el => el.id)).toBe('whole-attrs-element');
            expect(await page.$eval('#whole-attrs-element', el => el.className)).toBe('initial-style');
            expect(await page.$eval('div#whole-attrs-element', el => el.title)).toBe('Initial title');
            expect(await page.$eval('div#whole-attrs-element', el => el.dataset.test)).toBe('initial');
            expect(await page.$eval('div#whole-attrs-element', el => el.tabIndex)).toBe(1);

            // Update to new attributes
            await page.click('#set-updated-attrs-btn');
            await page.waitForSelector('#whole-attrs-element-updated');

            expect(await page.$eval('#whole-attrs-element-updated', el => el.id)).toBe('whole-attrs-element-updated');
            expect(await page.$eval('#whole-attrs-element-updated', el => el.className)).toBe('updated-style');
            expect(await page.$eval('div#whole-attrs-element-updated', el => el.title)).toBe('Updated title');
            expect(await page.$eval('div#whole-attrs-element-updated', el => el.dataset.test)).toBe('updated');
            expect(await page.$eval('div#whole-attrs-element-updated', el => el.dataset.new)).toBe('new-attribute');
            expect(await page.$eval('div#whole-attrs-element-updated', el => el.tabIndex)).toBe(2);
            expect(await page.$eval('div#whole-attrs-element-updated', el => el.getAttribute('role'))).toBe('button');
        });

        test('removes attributes when switching to minimal set', async () => {
            // Start with updated (full set)
            await page.click('#set-updated-attrs-btn');
            await page.waitForSelector('#whole-attrs-element-updated');

            // Switch to minimal
            await page.click('#set-minimal-attrs-btn');
            await page.waitForSelector('#whole-attrs-element-minimal');

            expect(await page.$eval('#whole-attrs-element-minimal', el => el.id)).toBe('whole-attrs-element-minimal');
            expect(await page.$eval('#whole-attrs-element-minimal', el => el.className)).toBe('test-element');
            expect(await page.$eval('div#whole-attrs-element-minimal', el => el.title)).toBe('');
            expect(await page.$eval('#whole-attrs-element-minimal', el => el.hasAttribute('data-test'))).toBe(false);
            expect(await page.$eval('#whole-attrs-element-minimal', el => el.hasAttribute('data-new'))).toBe(false);
            expect(await page.$eval('#whole-attrs-element-minimal', el => el.hasAttribute('role'))).toBe(false);
        });

        test('handles empty attributes object', async () => {
            // Start with some attributes
            await page.click('#set-initial-attrs-btn');
            await page.waitForSelector('#whole-attrs-element');

            // Switch to empty
            await page.click('#set-empty-attrs-btn');
            await page.waitForSelector('#whole-attrs-element', { hidden: true });

            const element = await page.$('#whole-attrs-marker + div')
            expect(await element.evaluate(el => el.textContent)).toBe('Whole attributes element')

            const hasClass = await element.evaluate(el => el.className === '');
            const hasTitle = await element.evaluate(el => el.title === '');
            const hasDataTest = await element.evaluate(el => el.hasAttribute('data-test'));
            const hasTabIndex = await element.evaluate(el => el.hasAttribute('tabindex'));

            expect(hasClass).toBe(true);
            expect(hasTitle).toBe(true);
            expect(hasDataTest).toBe(false);
            expect(hasTabIndex).toBe(false);
        });

        test('can cycle through different attribute sets', async () => {
            const sets = ['initial', 'updated', 'minimal', 'empty'];

            for (const set of sets) {
                await page.click(`#set-${set}-attrs-btn`);

                if (set !== 'empty') {
                    await page.waitForSelector(`#whole-attrs-element${set === 'initial' ? '' : '-' + set}`);
                } else {
                    await page.waitForSelector('[id*="whole-attrs-element"]', { hidden: true })
                }

                // Verify the change took effect by checking for expected elements
                const elements = await page.$$('[id*="whole-attrs-element"]');
                if (set === 'empty') {
                    expect(elements.length).toBe(0);
                } else {
                    expect(elements.length).toBeGreaterThan(0);
                }
            }
        });
    });

    describe('Single Attribute Updates', () => {
        beforeEach(async () => {
            await page.click('#set-initial-id-btn')
            await page.waitForSelector('#element-1')
            expect(await page.$('#element-1')).toBeTruthy();
        })

        test('updates class attribute independently', async () => {
            await page.click('#update-class-btn')
            await page.waitForSelector('#element-1.updated-style')

            await page.click('#update-class-btn')
            await page.waitForSelector('#element-1.initial-style')
        });

        test('updates id attribute independently', async () => {
            const element1 = await page.$('#element-1');
            expect(element1).toBeTruthy();

            await page.click('#update-id-btn');
            await page.waitForSelector('#element-2');

            await page.click('#update-id-btn');
            await page.waitForSelector('#element-1');
        });

        test('updates title attribute independently', async () => {
            await page.click('#update-title-btn');
            await page.waitForSelector(`#element-1[title='Updated title']`)

            await page.click('#update-title-btn');
            await page.waitForSelector(`#element-1[title='Initial title']`)
        });

        test('updates data attributes independently', async () => {
            await page.click('#update-data-btn');
            await page.waitForSelector(`#element-1[data-value='updated-data']`)

            await page.click('#update-data-btn');
            await page.waitForSelector(`#element-1[data-value='initial-data']`)
        });

        test('updates hidden attribute independently', async () => {
            await page.click('#update-hidden-btn');
            await page.waitForSelector(`#element-1[hidden]`)

            await page.click('#update-hidden-btn');
            await page.waitForSelector(`#element-1:not([hidden])`)
        });

        test('updates tabindex attribute independently', async () => {
            await page.click('#update-tabindex-btn');
            await page.waitForSelector(`#element-1[tabindex="2"]`)

            await page.click('#update-tabindex-btn');
            await page.waitForSelector(`#element-1[tabindex="1"]`)
        });

        test('updates aria attributes independently', async () => {
            await page.click('#update-aria-btn');
            await page.waitForSelector(`#element-1[aria-label="Updated aria label"]`)

            await page.click('#update-aria-btn');
            await page.waitForSelector(`#element-1[aria-label="Initial aria label"]`)
        });

        test('updates role attribute independently', async () => {
            await page.click('#update-role-btn');
            await page.waitForSelector('#element-1[role="tab"]')

            await page.click('#update-role-btn');
            await page.waitForSelector('#element-1[role="button"]')
        });
    });

    describe('Form Attribute Updates', () => {
        test('updates input type attribute', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            await page.click('#toggle-form-type-btn');
            await page.waitForSelector('input#form-element[type="password"]')

            await page.click('#toggle-form-type-btn');
            await page.waitForSelector('input#form-element[type="text"]')
        });

        test('updates boolean form attributes', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            // Test required
            await page.click('#toggle-form-required-btn');
            await page.waitForSelector('input#form-element[required]')

            await page.click('#toggle-form-required-btn');
            await page.waitForSelector('input#form-element:not([required])')

            // Test disabled
            await page.click('#toggle-form-disabled-btn');
            await page.waitForSelector('input#form-element[disabled]')

            await page.click('#toggle-form-disabled-btn');
            await page.waitForSelector('input#form-element:not([disabled])')

            // Test readonly
            await page.click('#toggle-form-readonly-btn');
            await page.waitForSelector('input#form-element[readonly]')

            await page.click('#toggle-form-readonly-btn');
            await page.waitForSelector('input#form-element:not([readonly])')
        });

        test('updates numeric form attributes', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            const initialMin = await input.evaluate(el => parseInt(el.min));
            const initialMax = await input.evaluate(el => parseInt(el.max));
            const initialStep = await input.evaluate(el => parseInt(el.step));
            expect(initialMin).toBe(0)
            expect(initialMax).toBe(100)
            expect(initialStep).toBe(1)

            await page.click('#update-form-range-btn');
            await page.waitForSelector('input#form-element[min="10"]')

            const newMin = await input.evaluate(el => parseInt(el.min));
            const newMax = await input.evaluate(el => parseInt(el.max));
            const newStep = await input.evaluate(el => parseInt(el.step));

            expect(newMin).toBe(10);
            expect(newMax).toBe(200);
            expect(newStep).toBe(5);
        });

        test('updates placeholder and value attributes', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();
            const inputType = await input.evaluate(el => el.type)
            if (inputType !== 'text') {
                await page.click('#toggle-form-type-btn')
            }

            await page.waitForSelector('input#form-element[type="text"]')

            // Test placeholder
            await page.click('#update-form-placeholder-btn');
            await page.waitForSelector('input#form-element[placeholder="Updated placeholder"]');

            await page.click('#update-form-placeholder-btn');
            await page.waitForSelector('input#form-element[placeholder="Initial placeholder"]');

            // Test value
            const initialValue = await input.evaluate(el => el.value);
            await page.click('#update-form-value-btn');

            await page.waitForFunction((initial) => {
                const input = document.querySelector('input#form-element') as HTMLInputElement
                return input.value !== initial
            }, undefined, initialValue)

            const newValue = await input.evaluate(el => el.value);
            expect(newValue).not.toBe(initialValue);
        });
    });

    describe('Media Attribute Updates', () => {
        test('updates boolean media attributes', async () => {
            const video = await page.$('video#media-element');
            expect(video).toBeTruthy();

            await page.click('#toggle-autoplay-btn');
            await page.waitForSelector('video#media-element[autoplay]');

            await page.click('#toggle-autoplay-btn');
            await page.waitForSelector('video#media-element:not([autoplay])');

            // Test controls
            await page.click('#toggle-controls-btn');
            await page.waitForSelector('video#media-element:not([controls])');

            await page.click('#toggle-controls-btn');
            await page.waitForSelector('video#media-element[controls]');

            // Test loop
            await page.click('#toggle-loop-btn');
            await page.waitForSelector('video#media-element[loop]');

            await page.click('#toggle-loop-btn');
            await page.waitForSelector('video#media-element:not([loop])');

            // Test muted
            const initialMuted = await video.evaluate(el => el.muted);
            await page.click('#toggle-muted-btn');
            await page.waitForFunction((initial) => {
                const video = document.querySelector('video#media-element') as HTMLVideoElement
                return video.muted !== initial
            }, undefined, initialMuted)
            const newMuted = await video.evaluate(el => el.muted);
            expect(newMuted).toBe(!initialMuted);
        });
    });

    describe('Custom Attribute Updates', () => {
        test('updates custom attributes', async () => {
            const element = await page.$('div#custom-attrs-element');
            expect(element).toBeTruthy();

            // Test custom-attr-1
            await page.click('#update-custom1-btn');
            await page.waitForSelector('div#custom-attrs-element[custom-attr-1="updated1"]');

            await page.click('#update-custom1-btn');
            await page.waitForSelector('div#custom-attrs-element[custom-attr-1="value1"]');

            // Test custom-attr-2
            await page.click('#update-custom2-btn');
            await page.waitForSelector('div#custom-attrs-element[custom-attr-2="updated2"]');

            await page.click('#update-custom2-btn');
            await page.waitForSelector('div#custom-attrs-element[custom-attr-2="value2"]');

            // Test data-custom
            await page.click('#update-data-custom-btn');
            await page.waitForSelector('div#custom-attrs-element[data-custom="updated-custom-data"]');

            await page.click('#update-data-custom-btn');
            await page.waitForSelector('div#custom-attrs-element[data-custom="custom-data"]');
        });

        test('updates computed custom attributes', async () => {
            const element = await page.$('#custom-attrs-element');
            expect(element).toBeTruthy();

            await page.click('#update-custom1-btn');
            await page.waitForSelector('#custom-attrs-element[aria-custom="custom-updated1"]');

            await page.click('#update-custom1-btn');
            await page.waitForSelector('#custom-attrs-element[aria-custom="custom-value1"]');
        });
    });

    describe('Style Object Updates', () => {
        test('updates style object completely', async () => {
            const element = await page.$('div#style-object-element');
            expect(element).toBeTruthy();

            // Set red style
            await page.click('#set-red-style-btn');
            await page.waitForFunction(() => {
                const div = document.querySelector('div#style-object-element') as HTMLDivElement
                return div.style.backgroundColor === 'red'
            })
            expect(await element.evaluate(el => el.style.backgroundColor)).toBe('red');

            // Set blue style
            await page.click('#set-blue-style-btn');
            await page.waitForFunction(() => {
                const div = document.querySelector('div#style-object-element') as HTMLDivElement
                return div.style.backgroundColor === 'blue'
            })

            expect(await element.evaluate(el => el.style.backgroundColor)).toBe('blue');
            expect(await element.evaluate(el => el.style.color)).toBe('white');

            // Set complex style
            await page.click('#set-complex-style-btn');
            await page.waitForFunction(() => {
                const div = document.querySelector('div#style-object-element') as HTMLDivElement
                return div.style.backgroundColor === 'purple'
            })

            expect(await element.evaluate(el => el.style.backgroundColor)).toBe('purple');
            expect(await element.evaluate(el => el.style.fontSize)).toBe('18px');
            expect(await element.evaluate(el => el.style.fontWeight)).toBe('bold');
        });

        test('removes style properties when switching to simpler style', async () => {
            const element = await page.$('div#style-object-element');
            expect(element).toBeTruthy();

            // Set complex style first
            await page.click('#set-complex-style-btn');
            await page.waitForFunction(() => {
                const div = document.querySelector('div#style-object-element') as HTMLDivElement
                return div.style.fontSize === '18px'
            })

            expect(await element.evaluate(el => el.style.fontSize)).toBe('18px');

            // Switch to simple red style
            await page.click('#set-red-style-btn');
            await page.waitForFunction(() => {
                const div = document.querySelector('div#style-object-element') as HTMLDivElement
                return div.style.backgroundColor === 'red'
            })

            const backgroundColor = await element.evaluate(el => el.style.backgroundColor);

            expect(backgroundColor).toBe('red');
            expect(await element.evaluate(el => el.style.fontSize)).toBe(''); // Should be removed
        });
    });

    describe('Class List Updates', () => {
        test('updates class list completely', async () => {
            const element = await page.$('#class-list-element');
            expect(element).toBeTruthy();

            // Set single class
            await page.click('#set-single-class-btn');
            await page.waitForSelector('#class-list-element.test-element')

            // Set multiple classes
            await page.click('#set-multiple-class-btn');
            await page.waitForSelector('#class-list-element.test-element.dynamic-class')

            // Set different classes
            await page.click('#set-different-class-btn');
            await page.waitForSelector('#class-list-element.another-class.dynamic-class')

            // Set empty classes
            await page.click('#set-empty-class-btn');
            await page.waitForSelector('#class-list-element:not(.another-class)')
            expect(await element.evaluate(el => el.className)).toBe('');
        });
    });

    describe('Multiple Attributes Updates', () => {
        test('updates multiple attributes simultaneously', async () => {
            const element = await page.$('div#multiple-attrs-element');
            expect(element).toBeTruthy();

            // Set mode 1
            await page.click('#set-mode1-btn');
            await page.waitForSelector('div#multiple-attrs-element.test-element')
            expect(await element.evaluate(el => el.className)).toBe('test-element');
            expect(await element.evaluate(el => el.title)).toBe('Mode 1');
            expect(await element.evaluate(el => el.dataset.mode)).toBe('mode1');
            expect(await element.evaluate(el => el.tabIndex)).toBe(1);
            expect(await element.evaluate(el => el.getAttribute('role'))).toBe('button');

            // Set mode 2
            await page.click('#set-mode2-btn');
            await page.waitForSelector('div#multiple-attrs-element.test-element.dynamic-class')
            expect(await element.evaluate(el => el.className)).toBe('test-element dynamic-class');
            expect(await element.evaluate(el => el.title)).toBe('Mode 2');
            expect(await element.evaluate(el => el.dataset.mode)).toBe('mode2');
            expect(await element.evaluate(el => el.dataset.extra)).toBe('extra-value');
            expect(await element.evaluate(el => el.tabIndex)).toBe(2);
            expect(await element.evaluate(el => el.getAttribute('role'))).toBe('tab');
            expect(await element.evaluate(el => el.getAttribute('aria-selected'))).toBe('true');

            // Set mode 3
            await page.click('#set-mode3-btn');
            await page.waitForSelector('div#multiple-attrs-element.another-class')
            expect(await element.evaluate(el => el.className)).toBe('another-class');
            expect(await element.evaluate(el => el.title)).toBe('Mode 3');
            expect(await element.evaluate(el => el.dataset.mode)).toBe('mode3');
            expect(await element.evaluate(el => el.tabIndex)).toBe(3);
            expect(await element.evaluate(el => el.hidden)).toBe(true);
        });
    });

    describe('Conditional Attributes', () => {
        test('adds and removes attributes conditionally', async () => {
            const element = await page.$('#conditional-attrs-element');
            expect(element).toBeTruthy();

            // Check initial state (assuming conditional attrs are enabled)
            let hasTitle = await element.evaluate(el => el.hasAttribute('title'));
            let hasDataConditional = await element.evaluate(el => el.hasAttribute('data-conditional'));
            let hasRole = await element.evaluate(el => el.hasAttribute('role'));
            let hasTabIndex = await element.evaluate(el => el.hasAttribute('tabindex'));

            // Toggle conditional attributes
            await page.click('#toggle-conditional-attrs-btn');
            await page.waitForSelector('#conditional-attrs-element:not([title="Conditional title"])')
            const newHasTitle = await element.evaluate(el => el.hasAttribute('title'));
            const newHasDataConditional = await element.evaluate(el => el.hasAttribute('data-conditional'));
            const newHasRole = await element.evaluate(el => el.hasAttribute('role'));
            const newHasTabIndex = await element.evaluate(el => el.hasAttribute('tabindex'));

            expect(newHasTitle).toBe(!hasTitle);
            expect(newHasDataConditional).toBe(!hasDataConditional);
            expect(newHasRole).toBe(!hasRole);
            expect(newHasTabIndex).toBe(!hasTabIndex);

            // Toggle back
            await page.click('#toggle-conditional-attrs-btn');
            await page.waitForSelector('#conditional-attrs-element[title="Conditional title"]')
            hasTitle = await element.evaluate(el => el.hasAttribute('title'));
            hasDataConditional = await element.evaluate(el => el.hasAttribute('data-conditional'));
            hasRole = await element.evaluate(el => el.hasAttribute('role'));
            hasTabIndex = await element.evaluate(el => el.hasAttribute('tabindex'));

            expect(hasTitle).toBe(!newHasTitle);
            expect(hasDataConditional).toBe(!newHasDataConditional);
            expect(hasRole).toBe(!newHasRole);
            expect(hasTabIndex).toBe(!newHasTabIndex);
        });
    });

    describe('Dynamic Attributes Count', () => {
        test('adds and removes dynamic attributes', async () => {
            const element = await page.$('#dynamic-attrs-element');
            expect(element).toBeTruthy();

            // Reset to 1
            await page.click('#reset-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-element[data-dynamic-1="value-1"]');

            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-1'))).toBe(true);
            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-2'))).toBe(false);

            // Increase to 2
            await page.click('#increase-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-element[data-dynamic-2="value-2"]');

            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-1'))).toBe(true);
            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-2'))).toBe(true);
            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-3'))).toBe(false);

            // Increase to 3
            await page.click('#increase-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-element[data-dynamic-3="value-3"]');

            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-3'))).toBe(true);

            // Decrease back to 2
            await page.click('#decrease-attrs-btn');
            await page.waitForSelector('#dynamic-attrs-element:not([data-dynamic-3="value-3"])');

            expect(await element.evaluate(el => el.hasAttribute('data-dynamic-3'))).toBe(false);
        });
    });

    describe('Rapid Updates', () => {
        test('handles rapid attribute updates correctly', async () => {
            const element = await page.$('div#rapid-update-element');
            expect(element).toBeTruthy();

            // Reset counter
            await page.click('#rapid-reset-btn');
            await page.waitForSelector('div#rapid-update-element[data-counter="0"]');

            expect(await element.evaluate(el => el.dataset.counter)).toBe('0');

            // Rapid increments
            for (let i = 1; i <= 5; i++) {
                await page.click('#rapid-increment-btn');
                await page.waitForSelector(`#rapid-update-element[data-counter="${i}"]`)
                expect(await element.evaluate(el => el.dataset.counter)).toBe(i.toString());
            }

            // Test class changes with counter
            const className = await element.evaluate(el => el.className);
            const expectedClass = parseInt(await element.evaluate(el => el.dataset.counter)) % 2 === 0
                ? 'test-element'
                : 'dynamic-class';
            expect(className).toBe(expectedClass);
        });

        test('handles batch updates correctly', async () => {
            const element = await page.$('div#rapid-update-element');
            expect(element).toBeTruthy();

            // Reset counter
            await page.click('#rapid-reset-btn');
            await page.waitForSelector('div#rapid-update-element[data-counter="0"]');

            // Trigger batch update
            await page.click('#rapid-batch-btn');
            await page.waitForSelector('div#rapid-update-element[data-counter="10"]');

            expect(await element.evaluate(el => parseInt(el.dataset.counter))).toBeGreaterThanOrEqual(10);
        });
    });

    describe('Null/Undefined Attributes', () => {
        test('handles null attribute values', async () => {
            const element = await page.$('div#nullable-attrs-element');
            expect(element).toBeTruthy();

            // Set null value
            await page.click('#set-null-attr-btn');
            await page.waitForSelector('div#nullable-attrs-element:not([data-nullable="value"])')

            const hasNullableAttr = await element.evaluate(el => el.hasAttribute('data-nullable'));
            const title = await element.evaluate(el => el.title);

            expect(hasNullableAttr).toBe(false);
            expect(title).toBe('No title');
        });

        test('handles undefined attribute values', async () => {
            const element = await page.$('#nullable-attrs-element');
            expect(element).toBeTruthy();

            // Set undefined value
            await page.click('#set-undefined-attr-btn');
            await page.waitForSelector('div#nullable-attrs-element:not([data-undefined="value"])')

            const hasUndefinedAttr = await element.evaluate(el => el.hasAttribute('data-undefined'));

            expect(hasUndefinedAttr).toBe(false);
        });

        test('restores attributes from null/undefined', async () => {
            const element = await page.$('div#nullable-attrs-element');
            expect(element).toBeTruthy();

            // Set null and undefined
            await page.click('#set-null-attr-btn');
            await page.click('#set-undefined-attr-btn');

            // Restore attributes
            await page.click('#restore-attrs-btn');
            await page.waitForSelector('div#nullable-attrs-element[title="restored"]')

            const nullableValue = await element.evaluate(el => el.dataset.nullable);
            const undefinedValue = await element.evaluate(el => el.dataset.undefined);
            const title = await element.evaluate(el => el.title);

            expect(nullableValue).toBe('restored');
            expect(undefinedValue).toBe('restored');
            expect(title).toBe('restored');
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('maintains element stability during attribute updates', async () => {
            const element = await page.$('#multiple-attrs-element');
            expect(element).toBeTruthy();

            // Perform multiple attribute updates
            await page.click('#set-mode1-btn');
            await page.click('#set-mode2-btn');
            await page.click('#set-mode3-btn');
            await page.click('#set-mode1-btn');
            await page.waitForSelector('#multiple-attrs-element[title="Mode 1"]')

            // Element should still be the same DOM node
            const finalElement = await page.$('#multiple-attrs-element');
            expect(finalElement).toBeTruthy();

            // Verify it's still functional
            const className = await finalElement.evaluate(el => el.className);
            expect(className).toBe('test-element');
        });

        test('handles conflicting attribute updates gracefully', async () => {
            // Test updating multiple attributes that might conflict
            const element = await page.$('input#form-element');
            expect(element).toBeTruthy();

            // Rapidly toggle conflicting states
            await page.click('#toggle-form-disabled-btn');
            await page.click('#toggle-form-readonly-btn');
            await page.click('#toggle-form-required-btn');
            await page.click('#toggle-form-disabled-btn');

            await page.waitForSelector('input#form-element:not([disabled])')

            // Element should still be functional
            const isDisabled = await element.evaluate(el => el.disabled);
            const isReadonly = await element.evaluate(el => el.readOnly);
            const isRequired = await element.evaluate(el => el.required);

            expect(typeof isDisabled).toBe('boolean');
            expect(isDisabled).toBe(false);
            expect(typeof isReadonly).toBe('boolean');
            expect(isReadonly).toBe(true);
            expect(typeof isRequired).toBe('boolean');
            expect(isRequired).toBe(true);
        });

        test('preserves non-updated attributes during partial updates', async () => {
            const element = await page.$('#element-1, #element-2');
            expect(element).toBeTruthy();

            // Get initial state
            const initialId = await element.evaluate(el => el.id);
            const initialClass = await element.evaluate(el => el.className);

            // Update only title
            await page.click('#update-title-btn');
            await page.waitForSelector('#element-1[title="Updated title"]')

            // ID and class should remain unchanged
            const finalId = await element.evaluate(el => el.id);
            const finalClass = await element.evaluate(el => el.className);

            expect(finalId).toBe(initialId);
            expect(finalClass).toBe(initialClass);
        });
    });
});
