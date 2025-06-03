import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
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
    describe('Whole Attributes Object Updates', () => {
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
        test('updates class attribute independently', async () => {
            const element = await page.$('#element-1, #element-2');
            expect(element).toBeTruthy();

            // Get initial class
            const initialClass = await element.evaluate(el => el.className);
            expect(['initial-style', 'updated-style']).toContain(initialClass);

            // Toggle class
            await page.click('#update-class-btn');

            const newClass = await element.evaluate(el => el.className);
            expect(newClass).not.toBe(initialClass);
            expect(['initial-style', 'updated-style']).toContain(newClass);
        });

        test('updates id attribute independently', async () => {
            // Find current element
            const element1 = await page.$('#element-1');
            expect(element1).toBeTruthy();

            // Toggle ID
            await page.click('#update-id-btn');

            // Find element with new ID
            await page.waitForSelector('#element-2');

            const element2 = await page.$('#element-2');
            expect(element2).toBeTruthy();

            expect(await element2.evaluate(el => el.id)).toBe('element-2')
        });

        test('updates title attribute independently', async () => {
            const element = await page.$('div#element-1, div#element-2');
            expect(element).toBeTruthy();

            const initialTitle = await element.evaluate(el => el.title);

            await page.click('#update-title-btn');

            const newTitle = await element.evaluate(el => el.title);
            expect(newTitle).not.toBe(initialTitle);
            expect(['Initial title', 'Updated title']).toContain(newTitle);
        });

        test('updates data attributes independently', async () => {
            const element = await page.$('div#element-1, div#element-2');
            expect(element).toBeTruthy();

            const initialData = await element.evaluate(el => el.dataset.value);

            await page.click('#update-data-btn');

            const newData = await element.evaluate(el => el.dataset.value);
            expect(newData).not.toBe(initialData);
            expect(['initial-data', 'updated-data']).toContain(newData);
        });

        test('updates hidden attribute independently', async () => {
            const element = await page.$('div#element-1, div#element-2');
            expect(element).toBeTruthy();

            const initialHidden = await element.evaluate(el => el.hidden);

            await page.click('#update-hidden-btn');

            const newHidden = await element.evaluate(el => el.hidden);
            expect(newHidden).toBe(!initialHidden);
        });

        test('updates tabindex attribute independently', async () => {
            const element = await page.$('div#element-1, div#element-2');
            expect(element).toBeTruthy();

            const initialTabIndex = await element.evaluate(el => el.tabIndex);

            await page.click('#update-tabindex-btn');

            const newTabIndex = await element.evaluate(el => el.tabIndex);
            expect(newTabIndex).not.toBe(initialTabIndex);
            expect([1, 2]).toContain(newTabIndex);
        });

        test('updates aria attributes independently', async () => {
            const element = await page.$('#element-1, #element-2');
            expect(element).toBeTruthy();

            const initialAria = await element.evaluate(el => el.getAttribute('aria-label'));

            await page.click('#update-aria-btn');

            const newAria = await element.evaluate(el => el.getAttribute('aria-label'));
            expect(newAria).not.toBe(initialAria);
            expect(['Initial aria label', 'Updated aria label']).toContain(newAria);
        });

        test('updates role attribute independently', async () => {
            const element = await page.$('#element-1, #element-2');
            expect(element).toBeTruthy();

            const initialRole = await element.evaluate(el => el.getAttribute('role'));

            await page.click('#update-role-btn');

            const newRole = await element.evaluate(el => el.getAttribute('role'));
            expect(newRole).not.toBe(initialRole);
            expect(['button', 'tab']).toContain(newRole);
        });
    });

    describe('Form Attribute Updates', () => {
        test('updates input type attribute', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            const initialType = await input.evaluate(el => el.type);

            await page.click('#toggle-form-type-btn');

            const newType = await input.evaluate(el => el.type);
            expect(newType).not.toBe(initialType);
            expect(['text', 'password']).toContain(newType);
        });

        test('updates boolean form attributes', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            // Test required
            const initialRequired = await input.evaluate(el => el.required);
            await page.click('#toggle-form-required-btn');
            const newRequired = await input.evaluate(el => el.required);
            expect(newRequired).toBe(!initialRequired);

            // Test disabled
            const initialDisabled = await input.evaluate(el => el.disabled);
            await page.click('#toggle-form-disabled-btn');
            const newDisabled = await input.evaluate(el => el.disabled);
            expect(newDisabled).toBe(!initialDisabled);

            // Test readonly
            const initialReadonly = await input.evaluate(el => el.readOnly);
            await page.click('#toggle-form-readonly-btn');
            const newReadonly = await input.evaluate(el => el.readOnly);
            expect(newReadonly).toBe(!initialReadonly);
        });

        test('updates numeric form attributes', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            const initialMin = await input.evaluate(el => parseInt(el.min));
            const initialMax = await input.evaluate(el => parseInt(el.max));
            const initialStep = await input.evaluate(el => parseInt(el.step));

            await page.click('#update-form-range-btn');

            const newMin = await input.evaluate(el => parseInt(el.min));
            const newMax = await input.evaluate(el => parseInt(el.max));
            const newStep = await input.evaluate(el => parseInt(el.step));

            expect(newMin).not.toBe(initialMin);
            expect(newMax).not.toBe(initialMax);
            expect(newStep).not.toBe(initialStep);
        });

        test('updates placeholder and value attributes', async () => {
            const input = await page.$('input#form-element');
            expect(input).toBeTruthy();

            // Test placeholder
            const initialPlaceholder = await input.evaluate(el => el.placeholder);
            await page.click('#update-form-placeholder-btn');
            const newPlaceholder = await input.evaluate(el => el.placeholder);
            expect(newPlaceholder).not.toBe(initialPlaceholder);

            // Test value
            const initialValue = await input.evaluate(el => el.value);
            await page.click('#update-form-value-btn');
            const newValue = await input.evaluate(el => el.value);
            expect(newValue).not.toBe(initialValue);
        });
    });

    describe('Media Attribute Updates', () => {
        test('updates boolean media attributes', async () => {
            const video = await page.$('video#media-element');
            expect(video).toBeTruthy();

            // Test autoplay
            const initialAutoplay = await video.evaluate(el => el.autoplay);
            await page.click('#toggle-autoplay-btn');
            const newAutoplay = await video.evaluate(el => el.autoplay);
            expect(newAutoplay).toBe(!initialAutoplay);

            // Test controls
            const initialControls = await video.evaluate(el => el.controls);
            await page.click('#toggle-controls-btn');
            const newControls = await video.evaluate(el => el.controls);
            expect(newControls).toBe(!initialControls);

            // Test loop
            const initialLoop = await video.evaluate(el => el.loop);
            await page.click('#toggle-loop-btn');
            const newLoop = await video.evaluate(el => el.loop);
            expect(newLoop).toBe(!initialLoop);

            // Test muted
            const initialMuted = await video.evaluate(el => el.muted);
            await page.click('#toggle-muted-btn');
            const newMuted = await video.evaluate(el => el.muted);
            expect(newMuted).toBe(!initialMuted);
        });
    });

    describe('Custom Attribute Updates', () => {
        test('updates custom attributes', async () => {
            const element = await page.$('div#custom-attrs-element');
            expect(element).toBeTruthy();

            // Test custom-attr-1
            const initialCustom1 = await element.evaluate(el => el.getAttribute('custom-attr-1'));
            await page.click('#update-custom1-btn');
            const newCustom1 = await element.evaluate(el => el.getAttribute('custom-attr-1'));
            expect(newCustom1).not.toBe(initialCustom1);

            // Test custom-attr-2
            const initialCustom2 = await element.evaluate(el => el.getAttribute('custom-attr-2'));
            await page.click('#update-custom2-btn');
            const newCustom2 = await element.evaluate(el => el.getAttribute('custom-attr-2'));
            expect(newCustom2).not.toBe(initialCustom2);

            // Test data-custom
            const initialDataCustom = await element.evaluate(el => el.dataset.custom);
            await page.click('#update-data-custom-btn');
            const newDataCustom = await element.evaluate(el => el.dataset.custom);
            expect(newDataCustom).not.toBe(initialDataCustom);
        });

        test('updates computed custom attributes', async () => {
            const element = await page.$('#custom-attrs-element');
            expect(element).toBeTruthy();

            const initialAriaCustom = await element.evaluate(el => el.getAttribute('aria-custom'));

            // Update custom-attr-1 which affects aria-custom
            await page.click('#update-custom1-btn');

            const newAriaCustom = await element.evaluate(el => el.getAttribute('aria-custom'));
            expect(newAriaCustom).not.toBe(initialAriaCustom);
            expect(newAriaCustom).toMatch(/^custom-/);
        });
    });

    describe('Style Object Updates', () => {
        test('updates style object completely', async () => {
            const element = await page.$('div#style-object-element');
            expect(element).toBeTruthy();

            // Set red style
            await page.click('#set-red-style-btn');

            let backgroundColor = await element.evaluate(el => el.style.backgroundColor);
            expect(backgroundColor).toBe('red');

            // Set blue style
            await page.click('#set-blue-style-btn');

            backgroundColor = await element.evaluate(el => el.style.backgroundColor);
            expect(backgroundColor).toBe('blue');

            const color = await element.evaluate(el => el.style.color);
            expect(color).toBe('white');

            // Set complex style
            await page.click('#set-complex-style-btn');

            backgroundColor = await element.evaluate(el => el.style.backgroundColor);
            const fontSize = await element.evaluate(el => el.style.fontSize);
            const fontWeight = await element.evaluate(el => el.style.fontWeight);

            expect(backgroundColor).toBe('purple');
            expect(fontSize).toBe('18px');
            expect(fontWeight).toBe('bold');
        });

        test('removes style properties when switching to simpler style', async () => {
            const element = await page.$('div#style-object-element');
            expect(element).toBeTruthy();

            // Set complex style first
            await page.click('#set-complex-style-btn');

            expect(await element.evaluate(el => el.style.fontSize)).toBe('18px');

            // Switch to simple red style
            await page.click('#set-red-style-btn');

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
            expect(await element.evaluate(el => el.className)).toBe('test-element');

            // Set multiple classes
            await page.click('#set-multiple-class-btn');
            expect(await element.evaluate(el => el.className)).toBe('test-element dynamic-class');

            // Set different classes
            await page.click('#set-different-class-btn');
            expect(await element.evaluate(el => el.className)).toBe('another-class dynamic-class');

            // Set empty classes
            await page.click('#set-empty-class-btn');
            expect(await element.evaluate(el => el.className)).toBe('');
        });
    });

    describe('Multiple Attributes Updates', () => {
        test('updates multiple attributes simultaneously', async () => {
            const element = await page.$('div#multiple-attrs-element');
            expect(element).toBeTruthy();

            // Set mode 1
            await page.click('#set-mode1-btn');

            expect(await element.evaluate(el => el.className)).toBe('test-element');
            expect(await element.evaluate(el => el.title)).toBe('Mode 1');
            expect(await element.evaluate(el => el.dataset.mode)).toBe('mode1');
            expect(await element.evaluate(el => el.tabIndex)).toBe(1);
            expect(await element.evaluate(el => el.getAttribute('role'))).toBe('button');

            // Set mode 2
            await page.click('#set-mode2-btn');

            expect(await element.evaluate(el => el.className)).toBe('test-element dynamic-class');
            expect(await element.evaluate(el => el.title)).toBe('Mode 2');
            expect(await element.evaluate(el => el.dataset.mode)).toBe('mode2');
            expect(await element.evaluate(el => el.dataset.extra)).toBe('extra-value');
            expect(await element.evaluate(el => el.tabIndex)).toBe(2);
            expect(await element.evaluate(el => el.getAttribute('role'))).toBe('tab');
            expect(await element.evaluate(el => el.getAttribute('aria-selected'))).toBe('true');

            // Set mode 3
            await page.click('#set-mode3-btn');

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

            let dataDynamic1 = await element.evaluate(el => el.hasAttribute('data-dynamic-1'));
            let dataDynamic2 = await element.evaluate(el => el.hasAttribute('data-dynamic-2'));

            expect(dataDynamic1).toBe(true);
            expect(dataDynamic2).toBe(false);

            // Increase to 2
            await page.click('#increase-attrs-btn');

            dataDynamic1 = await element.evaluate(el => el.hasAttribute('data-dynamic-1'));
            dataDynamic2 = await element.evaluate(el => el.hasAttribute('data-dynamic-2'));
            const dataDynamic3 = await element.evaluate(el => el.hasAttribute('data-dynamic-3'));

            expect(dataDynamic1).toBe(true);
            expect(dataDynamic2).toBe(true);
            expect(dataDynamic3).toBe(false);

            // Increase to 3
            await page.click('#increase-attrs-btn');

            const finalDataDynamic3 = await element.evaluate(el => el.hasAttribute('data-dynamic-3'));
            expect(finalDataDynamic3).toBe(true);

            // Decrease back to 2
            await page.click('#decrease-attrs-btn');

            const afterDecreaseDataDynamic3 = await element.evaluate(el => el.hasAttribute('data-dynamic-3'));
            expect(afterDecreaseDataDynamic3).toBe(false);
        });
    });

    describe('Rapid Updates', () => {
        test('handles rapid attribute updates correctly', async () => {
            const element = await page.$('div#rapid-update-element');
            expect(element).toBeTruthy();

            // Reset counter
            await page.click('#rapid-reset-btn');

            let counter = await element.evaluate(el => el.dataset.counter);
            expect(counter).toBe('0');

            // Rapid increments
            for (let i = 1; i <= 5; i++) {
                await page.click('#rapid-increment-btn');
                await page.waitForSelector(`#rapid-update-element[data-counter="${i}"]`)
                counter = await element.evaluate(el => el.dataset.counter);
                expect(counter).toBe(i.toString());
            }

            // Test class changes with counter
            const className = await element.evaluate(el => el.className);
            const expectedClass = parseInt(counter) % 2 === 0 ? 'test-element' : 'dynamic-class';
            expect(className).toBe(expectedClass);
        });

        test('handles batch updates correctly', async () => {
            const element = await page.$('div#rapid-update-element');
            expect(element).toBeTruthy();

            // Reset counter
            await page.click('#rapid-reset-btn');

            // Trigger batch update
            await page.click('#rapid-batch-btn');

            // Wait for all batch updates to complete
            await page.waitForFunction(() => {
                const el = document.querySelector('#rapid-update-element') as HTMLDivElement
                return el && parseInt(el.dataset.counter) >= 10;
            }, { timeout: 5000 });

            const finalCounter = await element.evaluate(el => parseInt(el.dataset.counter));
            expect(finalCounter).toBeGreaterThanOrEqual(10);
        });
    });

    describe('Null/Undefined Attributes', () => {
        test('handles null attribute values', async () => {
            const element = await page.$('div#nullable-attrs-element');
            expect(element).toBeTruthy();

            // Set null value
            await page.click('#set-null-attr-btn');

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

            // Element should still be functional
            const isDisabled = await element.evaluate(el => el.disabled);
            const isReadonly = await element.evaluate(el => el.readOnly);
            const isRequired = await element.evaluate(el => el.required);

            expect(typeof isDisabled).toBe('boolean');
            expect(typeof isReadonly).toBe('boolean');
            expect(typeof isRequired).toBe('boolean');
        });

        test('preserves non-updated attributes during partial updates', async () => {
            const element = await page.$('#element-1, #element-2');
            expect(element).toBeTruthy();

            // Get initial state
            const initialId = await element.evaluate(el => el.id);
            const initialClass = await element.evaluate(el => el.className);

            // Update only title
            await page.click('#update-title-btn');

            // ID and class should remain unchanged
            const finalId = await element.evaluate(el => el.id);
            const finalClass = await element.evaluate(el => el.className);

            expect(finalId).toBe(initialId);
            expect(finalClass).toBe(initialClass);
        });
    });
});
