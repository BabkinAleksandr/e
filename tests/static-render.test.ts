import { beforeAll, afterAll, describe, expect, test } from 'bun:test';
import { Page } from 'puppeteer';

let page: Page | undefined

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error('Puppeteer browser not available from global setup.');
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto('http://localhost:3002/static-render');
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector('#container');
});

afterAll(async () => {
    if (page) await page.close();
});

describe('Element-Specific Rendering Tests', async () => {
    describe('Document Structure Elements', () => {
        test('header element with navigation', async () => {
            const header = await page.$('#test-header');
            expect(header).toBeTruthy();

            const tagName = await header.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('header');

            // Check that nav is inside header
            const nav = await header.$('#test-nav');
            expect(nav).toBeTruthy();

            const navTagName = await nav.evaluate(el => el.tagName.toLowerCase());
            expect(navTagName).toBe('nav');
        });

        test('main element contains article', async () => {
            const main = await page.$('#test-main');
            expect(main).toBeTruthy();

            const article = await main.$('#test-article');
            expect(article).toBeTruthy();

            const articleTagName = await article.evaluate(el => el.tagName.toLowerCase());
            expect(articleTagName).toBe('article');
        });

        test('aside element within article', async () => {
            const aside = await page.$('#test-aside');
            expect(aside).toBeTruthy();

            const tagName = await aside.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('aside');

            const content = await aside.evaluate(el => el.textContent);
            expect(content).toBe('This is an aside element.');
        });

        test('footer element', async () => {
            const footer = await page.$('#test-footer');
            expect(footer).toBeTruthy();

            const tagName = await footer.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('footer');

            const content = await footer.evaluate(el => el.textContent);
            expect(content).toBe('Footer content');
        });
    });

    describe('Text Content Elements', () => {
        test('strong element for important text', async () => {
            const strong = await page.$('#test-strong');
            expect(strong).toBeTruthy();

            const tagName = await strong.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('strong');

            const content = await strong.evaluate(el => el.textContent);
            expect(content).toBe('strong text');
        });

        test('em element for emphasized text', async () => {
            const em = await page.$('#test-em');
            expect(em).toBeTruthy();

            const tagName = await em.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('em');

            const content = await em.evaluate(el => el.textContent);
            expect(content).toBe('emphasized text');
        });

        test('mark element for highlighted text', async () => {
            const mark = await page.$('#test-mark');
            expect(mark).toBeTruthy();

            const tagName = await mark.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('mark');

            const content = await mark.evaluate(el => el.textContent);
            expect(content).toBe('highlighted text');
        });

        test('blockquote with cite attribute', async () => {
            const blockquote = await page.$('#test-blockquote');
            expect(blockquote).toBeTruthy();

            const cite = await blockquote.evaluate(el => el.getAttribute('cite'));
            expect(cite).toBe('https://example.com');

            // Check for cite element inside blockquote
            const citeElement = await blockquote.$('#test-cite');
            expect(citeElement).toBeTruthy();
        });

        test('pre element with code', async () => {
            const pre = await page.$('#test-pre');
            expect(pre).toBeTruthy();

            const code = await pre.$('#test-code');
            expect(code).toBeTruthy();

            const codeContent = await code.evaluate(el => el.textContent);
            expect(codeContent).toContain('function hello()');
        });

        test('kbd element for keyboard input', async () => {
            const kbd = await page.$('#test-kbd');
            expect(kbd).toBeTruthy();

            const content = await kbd.evaluate(el => el.textContent);
            expect(content).toBe('Ctrl+C');
        });

        test('var element for variables', async () => {
            const varElement = await page.$('#test-var');
            expect(varElement).toBeTruthy();

            const tagName = await varElement.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('var');

            const content = await varElement.evaluate(el => el.textContent);
            expect(content).toBe('x');
        });

        test('samp element for sample output', async () => {
            const samp = await page.$('#test-samp');
            expect(samp).toBeTruthy();

            const content = await samp.evaluate(el => el.textContent);
            expect(content).toBe('Hello World');
        });
    });

    describe('List Elements', () => {
        test('unordered list with list items', async () => {
            const ul = await page.$('#test-ul');
            expect(ul).toBeTruthy();

            const tagName = await ul.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('ul');

            // Check list items
            const li1 = await ul.$('#test-li-1');
            const li2 = await ul.$('#test-li-2');
            const li3 = await ul.$('#test-li-3');

            expect(li1).toBeTruthy();
            expect(li2).toBeTruthy();
            expect(li3).toBeTruthy();

            const li1Content = await li1.evaluate(el => el.textContent);
            expect(li1Content).toBe('First item');
        });

        test('ordered list with type and start attributes', async () => {
            const ol = await page.$('#test-ol');
            expect(ol).toBeTruthy();

            const type = await ol.evaluate(el => el.getAttribute('type'));
            expect(type).toBe('A');

            const start = await ol.evaluate(el => el.getAttribute('start'));
            expect(start).toBe('1');

            // Check list item with value attribute
            const li = await ol.$('#test-ol-li-1');
            const value = await li.evaluate(el => el.getAttribute('value'));
            expect(value).toBe('1');
        });

        test('definition list with terms and definitions', async () => {
            const dl = await page.$('#test-dl');
            expect(dl).toBeTruthy();

            const dt1 = await dl.$('#test-dt-1');
            const dd1 = await dl.$('#test-dd-1');

            expect(dt1).toBeTruthy();
            expect(dd1).toBeTruthy();

            const dtTagName = await dt1.evaluate(el => el.tagName.toLowerCase());
            const ddTagName = await dd1.evaluate(el => el.tagName.toLowerCase());

            expect(dtTagName).toBe('dt');
            expect(ddTagName).toBe('dd');

            const dtContent = await dt1.evaluate(el => el.textContent);
            const ddContent = await dd1.evaluate(el => el.textContent);

            expect(dtContent).toBe('Term 1');
            expect(ddContent).toBe('Definition 1');
        });
    });

    describe('Table Elements', () => {
        test('complete table structure', async () => {
            const table = await page.$('#test-table');
            expect(table).toBeTruthy();

            const border = await table.evaluate(el => el.getAttribute('border'));
            expect(border).toBe('1');
        });

        test('table caption', async () => {
            const caption = await page.$('#test-caption');
            expect(caption).toBeTruthy();

            const tagName = await caption.evaluate(el => el.tagName.toLowerCase());
            expect(tagName).toBe('caption');

            const content = await caption.evaluate(el => el.textContent);
            expect(content).toBe('Test Table Caption');
        });

        test('colgroup and col elements', async () => {
            const colgroup = await page.$('#test-colgroup');
            expect(colgroup).toBeTruthy();

            const col1 = await colgroup.$('#test-col-1');
            const col2 = await colgroup.$('#test-col-2');

            expect(col1).toBeTruthy();
            expect(col2).toBeTruthy();

            const col1Span = await col1.evaluate(el => el.getAttribute('span'));
            const col2Span = await col2.evaluate(el => el.getAttribute('span'));

            expect(col1Span).toBe('1');
            expect(col2Span).toBe('2');
        });

        test('table header with scope attribute', async () => {
            const th = await page.$('#test-th-1');
            expect(th).toBeTruthy();

            const scope = await th.evaluate(el => el.getAttribute('scope'));
            expect(scope).toBe('col');

            const content = await th.evaluate(el => el.textContent);
            expect(content).toBe('Header 1');
        });

        test('table cell with colspan', async () => {
            const td = await page.$('#test-td-2');
            expect(td).toBeTruthy();

            const colspan = await td.evaluate(el => el.getAttribute('colspan'));
            expect(colspan).toBe('2');

            const content = await td.evaluate(el => el.textContent);
            expect(content).toBe('Cell 2 (spans 2 columns)');
        });

        test('table cell with rowspan', async () => {
            const td = await page.$('#test-td-5');
            expect(td).toBeTruthy();

            const rowspan = await td.evaluate(el => el.getAttribute('rowspan'));
            expect(rowspan).toBe('2');
        });

        test('table sections (thead, tbody, tfoot)', async () => {
            const thead = await page.$('#test-thead');
            const tbody = await page.$('#test-tbody');
            const tfoot = await page.$('#test-tfoot');

            expect(thead).toBeTruthy();
            expect(tbody).toBeTruthy();
            expect(tfoot).toBeTruthy();

            const theadTag = await thead.evaluate(el => el.tagName.toLowerCase());
            const tbodyTag = await tbody.evaluate(el => el.tagName.toLowerCase());
            const tfootTag = await tfoot.evaluate(el => el.tagName.toLowerCase());

            expect(theadTag).toBe('thead');
            expect(tbodyTag).toBe('tbody');
            expect(tfootTag).toBe('tfoot');
        });
    });

    describe('Form Elements', () => {
        test('form element with attributes', async () => {
            const form = await page.$('form#test-form')
            expect(form).toBeTruthy();

            const method = await form.evaluate(el => el.method);
            const action = await form.evaluate(el => el.action);
            const enctype = await form.evaluate(el => el.enctype);

            expect(method).toBe('post');
            expect(action).toContain('/submit');
            expect(enctype).toBe('multipart/form-data');
        });

        test('fieldset with legend', async () => {
            const fieldset = await page.$('fieldset#test-fieldset')
            const legend = await page.$('#test-legend');

            expect(fieldset).toBeTruthy();
            expect(legend).toBeTruthy();

            const disabled = await fieldset.evaluate(el => el.disabled);
            expect(disabled).toBe(false);

            const legendContent = await legend.evaluate(el => el.textContent);
            expect(legendContent).toBe('Personal Information');
        });

        test('text input with attributes', async () => {
            const input = await page.$('input#text-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            const name = await input.evaluate(el => el.name);
            const value = await input.evaluate(el => el.value);
            const placeholder = await input.evaluate(el => el.placeholder);
            const required = await input.evaluate(el => el.required);
            const maxlength = await input.evaluate(el => el.maxLength);

            expect(type).toBe('text');
            expect(name).toBe('name');
            expect(value).toBe('John Doe');
            expect(placeholder).toBe('Enter your name');
            expect(required).toBe(true);
            expect(maxlength).toBe(50);
        });

        test('email input', async () => {
            const input = await page.$('input#email-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            expect(type).toBe('email');
        });

        test('password input', async () => {
            const input = await page.$('input#password-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            const minlength = await input.evaluate(el => el.minLength);

            expect(type).toBe('password');
            expect(minlength).toBe(8);
        });

        test('number input with min, max, step', async () => {
            const input = await page.$('input#number-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            const min = await input.evaluate(el => el.min);
            const max = await input.evaluate(el => el.max);
            const step = await input.evaluate(el => el.step);
            const value = await input.evaluate(el => el.value);

            expect(type).toBe('number');
            expect(min).toBe('18');
            expect(max).toBe('120');
            expect(step).toBe('1');
            expect(value).toBe('25');
        });

        test('range input', async () => {
            const input = await page.$('input#range-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            expect(type).toBe('range');
        });

        test('date input', async () => {
            const input = await page.$('input#date-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            const value = await input.evaluate(el => el.value);

            expect(type).toBe('date');
            expect(value).toBe('1990-01-01');
        });

        test('file input with accept and multiple', async () => {
            const input = await page.$('input#file-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            const accept = await input.evaluate(el => el.accept);
            const multiple = await input.evaluate(el => el.multiple);

            expect(type).toBe('file');
            expect(accept).toBe('.jpg,.png,.pdf');
            expect(multiple).toBe(true);
        });

        test('checkbox input', async () => {
            const input = await page.$('input#checkbox-input')
            expect(input).toBeTruthy();

            const type = await input.evaluate(el => el.type);
            const checked = await input.evaluate(el => el.checked);
            const value = await input.evaluate(el => el.value);

            expect(type).toBe('checkbox');
            expect(checked).toBe(true);
            expect(value).toBe('yes');
        });

        test('radio inputs with same name', async () => {
            const radio1 = await page.$('input#radio-input-1')
            const radio2 = await page.$('input#radio-input-2')

            expect(radio1).toBeTruthy();
            expect(radio2).toBeTruthy();

            const name1 = await radio1.evaluate(el => el.name);
            const name2 = await radio2.evaluate(el => el.name);
            const checked1 = await radio1.evaluate(el => el.checked);
            const checked2 = await radio2.evaluate(el => el.checked);

            expect(name1).toBe('gender');
            expect(name2).toBe('gender');
            expect(checked1).toBe(true);
            expect(checked2).toBe(false);
        });

        test('select with optgroups and options', async () => {
            const select = await page.$('select#select-input')
            expect(select).toBeTruthy();

            const required = await select.evaluate(el => el.required);
            const size = await select.evaluate(el => el.size);

            expect(required).toBe(true);
            expect(size).toBe(1);

            // Test optgroup
            const optgroup = await select.$('optgroup#test-optgroup-1')
            expect(optgroup).toBeTruthy();

            const label = await optgroup.evaluate(el => el.label);
            expect(label).toBe('North America');

            // Test option
            const option = await select.$('option#option-us')
            expect(option).toBeTruthy();

            const value = await option.evaluate(el => el.value);
            expect(value).toBe('us');
        });

        test('textarea with attributes', async () => {
            const textarea = await page.$('textarea#textarea-input')
            expect(textarea).toBeTruthy();

            const rows = await textarea.evaluate(el => el.rows);
            const cols = await textarea.evaluate(el => el.cols);
            const placeholder = await textarea.evaluate(el => el.placeholder);
            const maxlength = await textarea.evaluate(el => el.maxLength);
            const value = await textarea.evaluate(el => el.value);

            expect(rows).toBe(4);
            expect(cols).toBe(50);
            expect(placeholder).toBe('Enter your comments here...');
            expect(maxlength).toBe(500);
            expect(value).toBe('Default textarea content');
        });

        test('button elements with different types', async () => {
            const submitBtn = await page.$('button#submit-button')
            const resetBtn = await page.$('button#reset-button')
            const customBtn = await page.$('button#custom-button')

            expect(submitBtn).toBeTruthy();
            expect(resetBtn).toBeTruthy();
            expect(customBtn).toBeTruthy();

            const submitType = await submitBtn.evaluate(el => el.type);
            const resetType = await resetBtn.evaluate(el => el.type);
            const customType = await customBtn.evaluate(el => el.type);

            expect(submitType).toBe('submit');
            expect(resetType).toBe('reset');
            expect(customType).toBe('button');

            const disabled = await submitBtn.evaluate(el => el.disabled);
            expect(disabled).toBe(false);
        });

        test('label elements with for attribute', async () => {
            const label = await page.$('#test-label-text');
            expect(label).toBeTruthy();

            const forAttr = await label.evaluate(el => el.getAttribute('for'));
            expect(forAttr).toBe('text-input');

            const content = await label.evaluate(el => el.textContent);
            expect(content).toBe('Name:');
        });
    });

    describe('Media Elements', () => {
        test('img element with all attributes', async () => {
            const img = await page.$('img#test-img')
            expect(img).toBeTruthy();

            const src = await img.evaluate(el => el.src);
            const alt = await img.evaluate(el => el.alt);
            const width = await img.evaluate(el => el.width);
            const height = await img.evaluate(el => el.height);
            const loading = await img.evaluate(el => el.loading);

            expect(src).toContain('data:image/svg+xml');
            expect(alt).toBe('Test image description');
            expect(width).toBe(100);
            expect(height).toBe(100);
            expect(loading).toBe('lazy');
        });

        test('audio element with sources', async () => {
            const audio = await page.$('audio#test-audio')
            expect(audio).toBeTruthy();

            const controls = await audio.evaluate(el => el.controls);
            const preload = await audio.evaluate(el => el.preload);
            const loop = await audio.evaluate(el => el.loop);
            const muted = await audio.evaluate(el => el.muted);

            expect(controls).toBe(true);
            expect(preload).toBe('metadata');
            expect(loop).toBe(false);
            expect(muted).toBe(false);

            // Check source elements
            const source1 = await audio.$('source#audio-source-1')
            const source2 = await audio.$('source#audio-source-2')

            expect(source1).toBeTruthy();
            expect(source2).toBeTruthy();

            const src1 = await source1.evaluate(el => el.src);
            const type1 = await source1.evaluate(el => el.type);

            expect(src1).toContain('audio.mp3');
            expect(type1).toBe('audio/mpeg');
        });

        test('video element with track', async () => {
            const video = await page.$('video#test-video')
            expect(video).toBeTruthy();

            const controls = await video.evaluate(el => el.controls);
            const width = await video.evaluate(el => el.width);
            const height = await video.evaluate(el => el.height);
            const preload = await video.evaluate(el => el.preload);
            const poster = await video.evaluate(el => el.poster);

            expect(controls).toBe(true);
            expect(width).toBe(320);
            expect(height).toBe(240);
            expect(preload).toBe('none');
            expect(poster).toContain('poster.jpg');

            // Check track element
            const track = await video.$('track#video-track')
            expect(track).toBeTruthy();

            const kind = await track.evaluate(el => el.kind);
            const srclang = await track.evaluate(el => el.srclang);
            const label = await track.evaluate(el => el.label);

            expect(kind).toBe('subtitles');
            expect(srclang).toBe('en');
            expect(label).toBe('English');
        });
    });

    describe('Interactive Elements', () => {
        test('details and summary elements', async () => {
            const details = await page.$('details#test-details')
            const summary = await page.$('summary#test-summary');

            expect(details).toBeTruthy();
            expect(summary).toBeTruthy();

            const open = await details.evaluate(el => el.open);
            expect(open).toBe(false);

            const summaryContent = await summary.evaluate(el => el.textContent);
            expect(summaryContent).toBe('Click to expand');
        });

        test('dialog element', async () => {
            const dialog = await page.$('dialog#test-dialog')
            expect(dialog).toBeTruthy();

            const open = await dialog.evaluate(el => el.open);
            expect(open).toBe(false);
        });
    });

    describe('Embedded Content', () => {
        test('iframe with sandbox', async () => {
            const iframe = await page.$('iframe#test-iframe')
            expect(iframe).toBeTruthy();

            const src = await iframe.evaluate(el => el.src);
            const width = await iframe.evaluate(el => el.width);
            const height = await iframe.evaluate(el => el.height);
            const title = await iframe.evaluate(el => el.title);
            const sandbox = await iframe.evaluate(el => el.sandbox);

            expect(src).toBe('about:blank');
            expect(width).toBe('300');
            expect(height).toBe('200');
            expect(title).toBe('Test iframe');
            expect(sandbox[0]).toBe('allow-scripts');
            expect(sandbox[1]).toBe('allow-same-origin');
        });

        test('embed element', async () => {
            const embed = await page.$('embed#test-embed')
            expect(embed).toBeTruthy();

            const src = await embed.evaluate(el => el.src);
            const type = await embed.evaluate(el => el.type);

            expect(src).toContain('test.pdf');
            expect(type).toBe('application/pdf');
        });

        test('object element', async () => {
            const object = await page.$('object#test-object')
            expect(object).toBeTruthy();

            const data = await object.evaluate(el => el.data);
            const type = await object.evaluate(el => el.type);

            expect(data).toContain('test.pdf');
            expect(type).toBe('application/pdf');
        });

        test('canvas element', async () => {
            const canvas = await page.$('canvas#test-canvas')
            expect(canvas).toBeTruthy();

            const width = await canvas.evaluate(el => el.width);
            const height = await canvas.evaluate(el => el.height);

            expect(width).toBe(300);
            expect(height).toBe(150);
        });
    });

    describe('SVG Elements', () => {
        test('svg container with viewBox', async () => {
            const svg = await page.$('#test-svg');
            expect(svg).toBeTruthy();

            const width = await svg.evaluate(el => el.getAttribute('width'));
            const height = await svg.evaluate(el => el.getAttribute('height'));
            const viewBox = await svg.evaluate(el => el.getAttribute('viewBox'));

            expect(width).toBe('200');
            expect(height).toBe('200');
            expect(viewBox).toBe('0 0 200 200');
        });

        test('svg rect with fill and stroke', async () => {
            const rect = await page.$('#svg-rect');
            expect(rect).toBeTruthy();

            const x = await rect.evaluate(el => el.getAttribute('x'));
            const y = await rect.evaluate(el => el.getAttribute('y'));
            const width = await rect.evaluate(el => el.getAttribute('width'));
            const height = await rect.evaluate(el => el.getAttribute('height'));
            const fill = await rect.evaluate(el => el.getAttribute('fill'));
            const stroke = await rect.evaluate(el => el.getAttribute('stroke'));

            expect(x).toBe('10');
            expect(y).toBe('10');
            expect(width).toBe('80');
            expect(height).toBe('80');
            expect(fill).toBe('url(#test-gradient)');
            expect(stroke).toBe('#000');
        });

        test('svg circle', async () => {
            const circle = await page.$('#svg-circle');
            expect(circle).toBeTruthy();

            const cx = await circle.evaluate(el => el.getAttribute('cx'));
            const cy = await circle.evaluate(el => el.getAttribute('cy'));
            const r = await circle.evaluate(el => el.getAttribute('r'));

            expect(cx).toBe('150');
            expect(cy).toBe('50');
            expect(r).toBe('30');
        });

        test('svg line with coordinates', async () => {
            const line = await page.$('#svg-line');
            expect(line).toBeTruthy();

            const x1 = await line.evaluate(el => el.getAttribute('x1'));
            const y1 = await line.evaluate(el => el.getAttribute('y1'));
            const x2 = await line.evaluate(el => el.getAttribute('x2'));
            const y2 = await line.evaluate(el => el.getAttribute('y2'));

            expect(x1).toBe('100');
            expect(y1).toBe('100');
            expect(x2).toBe('180');
            expect(y2).toBe('180');
        });

        test('svg gradient with stops', async () => {
            const gradient = await page.$('#test-gradient');
            expect(gradient).toBeTruthy();

            const stop1 = await gradient.$('#gradient-stop-1');
            const stop2 = await gradient.$('#gradient-stop-2');

            expect(stop1).toBeTruthy();
            expect(stop2).toBeTruthy();

            const offset1 = await stop1.evaluate(el => el.getAttribute('offset'));
            const color1 = await stop1.evaluate(el => el.getAttribute('stop-color'));

            expect(offset1).toBe('0%');
            expect(color1).toBe('#ff0000');
        });

        test('svg group with transform', async () => {
            const group = await page.$('#svg-group');
            expect(group).toBeTruthy();

            const transform = await group.evaluate(el => el.getAttribute('transform'));
            expect(transform).toBe('translate(10, 10)');

            // Check grouped element
            const groupedRect = await group.$('#grouped-rect');
            expect(groupedRect).toBeTruthy();
        });

        test('svg text element', async () => {
            const text = await page.$('#svg-text');
            expect(text).toBeTruthy();

            const x = await text.evaluate(el => el.getAttribute('x'));
            const y = await text.evaluate(el => el.getAttribute('y'));
            const content = await text.evaluate(el => el.textContent);

            expect(x).toBe('100');
            expect(y).toBe('30');
            expect(content).toBe('SVG Text');
        });
    });

    describe('Boolean Attributes Tests', () => {
        describe('Form Boolean Attributes', () => {
            describe('autofocus attribute', () => {
                test('autofocus=true sets focus on element', async () => {
                    const input = await page.$('input#input-autofocus-true')
                    expect(input).toBeTruthy();

                    const autofocus = await input.evaluate(el => el.autofocus);
                    expect(autofocus).toBe(true);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('autofocus'));
                    expect(hasAttribute).toBe(true);
                });

                test('autofocus=false does not set focus', async () => {
                    const input = await page.$('input#input-autofocus-false')
                    expect(input).toBeTruthy();

                    const autofocus = await input.evaluate(el => el.autofocus);
                    expect(autofocus).toBe(false);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('autofocus'));
                    expect(hasAttribute).toBe(false);
                });
            });

            describe('checked attribute', () => {
                test('checkbox checked=true is selected', async () => {
                    const checkbox = await page.$('input#checkbox-checked-true')
                    expect(checkbox).toBeTruthy();

                    const checked = await checkbox.evaluate(el => el.checked);
                    expect(checked).toBe(true);
                });

                test('checkbox checked=false is not selected', async () => {
                    const checkbox = await page.$('input#checkbox-checked-false')
                    expect(checkbox).toBeTruthy();

                    const checked = await checkbox.evaluate(el => el.checked);
                    expect(checked).toBe(false);
                });

                test('radio checked=true is selected', async () => {
                    const radio = await page.$('input#radio-checked-true')
                    expect(radio).toBeTruthy();

                    const checked = await radio.evaluate(el => el.checked);
                    expect(checked).toBe(true);
                });

                test('radio checked=false is not selected', async () => {
                    const radio = await page.$('input#radio-checked-false')
                    expect(radio).toBeTruthy();

                    const checked = await radio.evaluate(el => el.checked);
                    expect(checked).toBe(false);
                });
            });

            describe('disabled attribute', () => {
                test('input disabled=true is disabled', async () => {
                    const input = await page.$('input#input-disabled-true')
                    expect(input).toBeTruthy();

                    const disabled = await input.evaluate(el => el.disabled);
                    expect(disabled).toBe(true);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('disabled'));
                    expect(hasAttribute).toBe(true);
                });

                test('input disabled=false is enabled', async () => {
                    const input = await page.$('input#input-disabled-false')
                    expect(input).toBeTruthy();

                    const disabled = await input.evaluate(el => el.disabled);
                    expect(disabled).toBe(false);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('disabled'));
                    expect(hasAttribute).toBe(false);
                });

                test('button disabled=true is disabled', async () => {
                    const button = await page.$('button#button-disabled-true')
                    expect(button).toBeTruthy();

                    const disabled = await button.evaluate(el => el.disabled);
                    expect(disabled).toBe(true);
                });

                test('button disabled=false is enabled', async () => {
                    const button = await page.$('button#button-disabled-false')
                    expect(button).toBeTruthy();

                    const disabled = await button.evaluate(el => el.disabled);
                    expect(disabled).toBe(false);
                });

                test('select disabled=true is disabled', async () => {
                    const select = await page.$('select#select-disabled-true')
                    expect(select).toBeTruthy();

                    const disabled = await select.evaluate(el => el.disabled);
                    expect(disabled).toBe(true);
                });

                test('select disabled=false is enabled', async () => {
                    const select = await page.$('select#select-disabled-false')
                    expect(select).toBeTruthy();

                    const disabled = await select.evaluate(el => el.disabled);
                    expect(disabled).toBe(false);
                });

                test('textarea disabled=true is disabled', async () => {
                    const textarea = await page.$('textarea#textarea-disabled-true')
                    expect(textarea).toBeTruthy();

                    const disabled = await textarea.evaluate(el => el.disabled);
                    expect(disabled).toBe(true);
                });

                test('textarea disabled=false is enabled', async () => {
                    const textarea = await page.$('textarea#textarea-disabled-false')
                    expect(textarea).toBeTruthy();

                    const disabled = await textarea.evaluate(el => el.disabled);
                    expect(disabled).toBe(false);
                });

                test('fieldset disabled=true disables all controls', async () => {
                    const fieldset = await page.$('fieldset#fieldset-disabled-true')
                    expect(fieldset).toBeTruthy();

                    const disabled = await fieldset.evaluate(el => el.disabled);
                    expect(disabled).toBe(true);
                });

                test('fieldset disabled=false enables all controls', async () => {
                    const fieldset = await page.$('fieldset#fieldset-disabled-false')
                    expect(fieldset).toBeTruthy();

                    const disabled = await fieldset.evaluate(el => el.disabled);
                    expect(disabled).toBe(false);
                });
            });

            describe('hidden attribute', () => {
                test('hidden=true hides element', async () => {
                    const div = await page.$('div#div-hidden-true')
                    expect(div).toBeTruthy();

                    const hidden = await div.evaluate(el => el.hidden);
                    expect(hidden).toBe(true);

                    const hasAttribute = await div.evaluate(el => el.hasAttribute('hidden'));
                    expect(hasAttribute).toBe(true);

                    // Check if element is visually hidden
                    const isVisible = await div.isVisible();
                    expect(isVisible).toBe(false);
                });

                test('hidden=false shows element', async () => {
                    const div = await page.$('div#div-hidden-false')
                    expect(div).toBeTruthy();

                    const hidden = await div.evaluate(el => el.hidden);
                    expect(hidden).toBe(false);

                    const hasAttribute = await div.evaluate(el => el.hasAttribute('hidden'));
                    expect(hasAttribute).toBe(false);

                    // Check if element is visually visible
                    const isVisible = await div.isVisible();
                    expect(isVisible).toBe(true);
                });
            });

            describe('multiple attribute', () => {
                test('select multiple=true allows multiple selections', async () => {
                    const select = await page.$('select#select-multiple-true')
                    expect(select).toBeTruthy();

                    const multiple = await select.evaluate(el => el.multiple);
                    expect(multiple).toBe(true);

                    const hasAttribute = await select.evaluate(el => el.hasAttribute('multiple'));
                    expect(hasAttribute).toBe(true);
                });

                test('select multiple=false allows single selection', async () => {
                    const select = await page.$('select#select-multiple-false')
                    expect(select).toBeTruthy();

                    const multiple = await select.evaluate(el => el.multiple);
                    expect(multiple).toBe(false);

                    const hasAttribute = await select.evaluate(el => el.hasAttribute('multiple'));
                    expect(hasAttribute).toBe(false);
                });

                test('file input multiple=true allows multiple files', async () => {
                    const input = await page.$('input#file-multiple-true')
                    expect(input).toBeTruthy();

                    const multiple = await input.evaluate(el => el.multiple);
                    expect(multiple).toBe(true);
                });

                test('file input multiple=false allows single file', async () => {
                    const input = await page.$('input#file-multiple-false')
                    expect(input).toBeTruthy();

                    const multiple = await input.evaluate(el => el.multiple);
                    expect(multiple).toBe(false);
                });
            });

            describe('readonly attribute', () => {
                test('input readonly=true is read-only', async () => {
                    const input = await page.$('input#input-readonly-true')
                    expect(input).toBeTruthy();

                    const readonly = await input.evaluate(el => el.readOnly);
                    expect(readonly).toBe(true);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('readonly'));
                    expect(hasAttribute).toBe(true);
                });

                test('input readonly=false is editable', async () => {
                    const input = await page.$('input#input-readonly-false')
                    expect(input).toBeTruthy();

                    const readonly = await input.evaluate(el => el.readOnly);
                    expect(readonly).toBe(false);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('readonly'));
                    expect(hasAttribute).toBe(false);
                });

                test('textarea readonly=true is read-only', async () => {
                    const textarea = await page.$('textarea#textarea-readonly-true')
                    expect(textarea).toBeTruthy();

                    const readOnly = await textarea.evaluate(el => el.readOnly);
                    expect(readOnly).toBe(true);
                });

                test('textarea readonly=false is editable', async () => {
                    const textarea = await page.$('textarea#textarea-readonly-false')
                    expect(textarea).toBeTruthy();

                    const readonly = await textarea.evaluate(el => el.readOnly);
                    expect(readonly).toBe(false);
                });
            });

            describe('required attribute', () => {
                test('input required=true is required', async () => {
                    const input = await page.$('input#input-required-true')
                    expect(input).toBeTruthy();

                    const required = await input.evaluate(el => el.required);
                    expect(required).toBe(true);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('required'));
                    expect(hasAttribute).toBe(true);
                });

                test('input required=false is optional', async () => {
                    const input = await page.$('input#input-required-false')
                    expect(input).toBeTruthy();

                    const required = await input.evaluate(el => el.required);
                    expect(required).toBe(false);

                    const hasAttribute = await input.evaluate(el => el.hasAttribute('required'));
                    expect(hasAttribute).toBe(false);
                });

                test('select required=true is required', async () => {
                    const select = await page.$('select#select-required-true')
                    expect(select).toBeTruthy();

                    const required = await select.evaluate(el => el.required);
                    expect(required).toBe(true);
                });

                test('select required=false is optional', async () => {
                    const select = await page.$('select#select-required-false')
                    expect(select).toBeTruthy();

                    const required = await select.evaluate(el => el.required);
                    expect(required).toBe(false);
                });

                test('textarea required=true is required', async () => {
                    const textarea = await page.$('textarea#textarea-required-true')
                    expect(textarea).toBeTruthy();

                    const required = await textarea.evaluate(el => el.required);
                    expect(required).toBe(true);
                });

                test('textarea required=false is optional', async () => {
                    const textarea = await page.$('textarea#textarea-required-false')
                    expect(textarea).toBeTruthy();

                    const required = await textarea.evaluate(el => el.required);
                    expect(required).toBe(false);
                });
            });

            describe('selected attribute', () => {
                test('option selected=true is selected', async () => {
                    const option = await page.$('option#option-selected-true')
                    expect(option).toBeTruthy();

                    const selected = await option.evaluate(el => el.selected);
                    expect(selected).toBe(true);
                });

                test('option selected=false is not selected', async () => {
                    const option = await page.$('option#option-selected-false')
                    expect(option).toBeTruthy();

                    const selected = await option.evaluate(el => el.selected);
                    expect(selected).toBe(false);
                });
            });
        });

        describe('Form Validation Boolean Attributes', () => {
            describe('novalidate attribute', () => {
                test('form novalidate=true disables validation', async () => {
                    const form = await page.$('form#form-novalidate-true')
                    expect(form).toBeTruthy();

                    const novalidate = await form.evaluate(el => el.noValidate);
                    expect(novalidate).toBe(true);
                });

                test('form novalidate=false enables validation', async () => {
                    const form = await page.$('form#form-novalidate-false')
                    expect(form).toBeTruthy();

                    const novalidate = await form.evaluate(el => el.noValidate);
                    expect(novalidate).toBe(false);
                });
            });

            describe('formnovalidate attribute', () => {
                test('button formnovalidate=true skips validation', async () => {
                    const button = await page.$('button#button-formnovalidate-true')
                    expect(button).toBeTruthy();

                    const formnovalidate = await button.evaluate(el => el.formNoValidate);
                    expect(formnovalidate).toBe(true);

                    const hasAttribute = await button.evaluate(el => el.hasAttribute('formnovalidate'));
                    expect(hasAttribute).toBe(true);
                });

                test('button formnovalidate=false enables validation', async () => {
                    const button = await page.$('button#button-formnovalidate-false')
                    expect(button).toBeTruthy();

                    const formnovalidate = await button.evaluate(el => el.formNoValidate);
                    expect(formnovalidate).toBe(false);

                    const hasAttribute = await button.evaluate(el => el.hasAttribute('formnovalidate'));
                    expect(hasAttribute).toBe(false);
                });
            });
        });

        describe('Media Boolean Attributes', () => {
            describe('autoplay attribute', () => {
                test('audio autoplay=true enables autoplay', async () => {
                    const audio = await page.$('audio#audio-autoplay-true')
                    expect(audio).toBeTruthy();

                    const autoplay = await audio.evaluate(el => el.autoplay);
                    expect(autoplay).toBe(true);

                    const hasAttribute = await audio.evaluate(el => el.hasAttribute('autoplay'));
                    expect(hasAttribute).toBe(true);
                });

                test('audio autoplay=false disables autoplay', async () => {
                    const audio = await page.$('audio#audio-autoplay-false')
                    expect(audio).toBeTruthy();

                    const autoplay = await audio.evaluate(el => el.autoplay);
                    expect(autoplay).toBe(false);

                    const hasAttribute = await audio.evaluate(el => el.hasAttribute('autoplay'));
                    expect(hasAttribute).toBe(false);
                });

                test('video autoplay=true enables autoplay', async () => {
                    const video = await page.$('video#video-autoplay-true')
                    expect(video).toBeTruthy();

                    const autoplay = await video.evaluate(el => el.autoplay);
                    expect(autoplay).toBe(true);
                });

                test('video autoplay=false disables autoplay', async () => {
                    const video = await page.$('video#video-autoplay-false')
                    expect(video).toBeTruthy();

                    const autoplay = await video.evaluate(el => el.autoplay);
                    expect(autoplay).toBe(false);
                });
            });

            describe('controls attribute', () => {
                test('audio controls=true shows controls', async () => {
                    const audio = await page.$('audio#audio-controls-true')
                    expect(audio).toBeTruthy();

                    const controls = await audio.evaluate(el => el.controls);
                    expect(controls).toBe(true);

                    const hasAttribute = await audio.evaluate(el => el.hasAttribute('controls'));
                    expect(hasAttribute).toBe(true);
                });

                test('audio controls=false hides controls', async () => {
                    const audio = await page.$('audio#audio-controls-false')
                    expect(audio).toBeTruthy();

                    const controls = await audio.evaluate(el => el.controls);
                    expect(controls).toBe(false);

                    const hasAttribute = await audio.evaluate(el => el.hasAttribute('controls'));
                    expect(hasAttribute).toBe(false);
                });
            });

            describe('loop attribute', () => {
                test('audio loop=true enables looping', async () => {
                    const audio = await page.$('audio#audio-loop-true')
                    expect(audio).toBeTruthy();

                    const loop = await audio.evaluate(el => el.loop);
                    expect(loop).toBe(true);

                    const hasAttribute = await audio.evaluate(el => el.hasAttribute('loop'));
                    expect(hasAttribute).toBe(true);
                });

                test('audio loop=false disables looping', async () => {
                    const audio = await page.$('audio#audio-loop-false')
                    expect(audio).toBeTruthy();

                    const loop = await audio.evaluate(el => el.loop);
                    expect(loop).toBe(false);

                    const hasAttribute = await audio.evaluate(el => el.hasAttribute('loop'));
                    expect(hasAttribute).toBe(false);
                });
            });

            describe('muted attribute', () => {
                test('audio muted=true mutes audio', async () => {
                    const audio = await page.$('audio#audio-muted-true')
                    expect(audio).toBeTruthy();

                    const muted = await audio.evaluate(el => el.muted);
                    expect(muted).toBe(true);
                });

                test('audio muted=false unmutes audio', async () => {
                    const audio = await page.$('audio#audio-muted-false')
                    expect(audio).toBeTruthy();

                    const muted = await audio.evaluate(el => el.muted);
                    expect(muted).toBe(false);
                });
            });

            describe('default attribute for tracks', () => {
                test('track default=true sets as default track', async () => {
                    const track = await page.$('track#track-default-true')
                    expect(track).toBeTruthy();

                    const defaultTrack = await track.evaluate(el => el.default);
                    expect(defaultTrack).toBe(true);

                    const hasAttribute = await track.evaluate(el => el.hasAttribute('default'));
                    expect(hasAttribute).toBe(true);
                });

                test('track default=false is not default track', async () => {
                    const track = await page.$('track#track-default-false')
                    expect(track).toBeTruthy();

                    const defaultTrack = await track.evaluate(el => el.default);
                    expect(defaultTrack).toBe(false);

                    const hasAttribute = await track.evaluate(el => el.hasAttribute('default'));
                    expect(hasAttribute).toBe(false);
                });
            });
        });

        describe('List Boolean Attributes', () => {
            describe('reversed attribute', () => {
                test('ol reversed=true reverses numbering', async () => {
                    const ol = await page.$('ol#ol-reversed-true')
                    expect(ol).toBeTruthy();

                    const reversed = await ol.evaluate(el => el.reversed);
                    expect(reversed).toBe(true);

                    const hasAttribute = await ol.evaluate(el => el.hasAttribute('reversed'));
                    expect(hasAttribute).toBe(true);
                });

                test('ol reversed=false uses normal numbering', async () => {
                    const ol = await page.$('ol#ol-reversed-false')
                    expect(ol).toBeTruthy();

                    const reversed = await ol.evaluate(el => el.reversed);
                    expect(reversed).toBe(false);

                    const hasAttribute = await ol.evaluate(el => el.hasAttribute('reversed'));
                    expect(hasAttribute).toBe(false);
                });
            });
        });

        describe('Interactive Boolean Attributes', () => {
            describe('open attribute for details', () => {
                test('details open=true is expanded', async () => {
                    const details = await page.$('details#details-open-true')
                    expect(details).toBeTruthy();

                    const open = await details.evaluate(el => el.open);
                    expect(open).toBe(true);

                    const hasAttribute = await details.evaluate(el => el.hasAttribute('open'));
                    expect(hasAttribute).toBe(true);
                });

                test('details open=false is collapsed', async () => {
                    const details = await page.$('details#details-open-false')
                    expect(details).toBeTruthy();

                    const open = await details.evaluate(el => el.open);
                    expect(open).toBe(false);

                    const hasAttribute = await details.evaluate(el => el.hasAttribute('open'));
                    expect(hasAttribute).toBe(false);
                });
            });

            describe('open attribute for dialog', () => {
                test('dialog open=true is visible', async () => {
                    const dialog = await page.$('dialog#dialog-open-true')
                    expect(dialog).toBeTruthy();

                    const open = await dialog.evaluate(el => el.open);
                    expect(open).toBe(true);

                    const hasAttribute = await dialog.evaluate(el => el.hasAttribute('open'));
                    expect(hasAttribute).toBe(true);
                });

                test('dialog open=false is hidden', async () => {
                    const dialog = await page.$('dialog#dialog-open-false')
                    expect(dialog).toBeTruthy();

                    const open = await dialog.evaluate(el => el.open);
                    expect(open).toBe(false);

                    const hasAttribute = await dialog.evaluate(el => el.hasAttribute('open'));
                    expect(hasAttribute).toBe(false);
                });
            });
        });

        describe('Image Boolean Attributes', () => {
            describe('ismap attribute', () => {
                test('img ismap=true creates server-side image map', async () => {
                    const img = await page.$('img#img-ismap-true')
                    expect(img).toBeTruthy();

                    const ismap = await img.evaluate(el => el.isMap);
                    expect(ismap).toBe(true);

                    const hasAttribute = await img.evaluate(el => el.hasAttribute('ismap'));
                    expect(hasAttribute).toBe(true);
                });

                test('img ismap=false is regular image', async () => {
                    const img = await page.$('img#img-ismap-false')
                    expect(img).toBeTruthy();

                    const ismap = await img.evaluate(el => el.isMap);
                    expect(ismap).toBe(false);

                    const hasAttribute = await img.evaluate(el => el.hasAttribute('ismap'));
                    expect(hasAttribute).toBe(false);
                });
            });
        });

        describe('Boolean Attribute Behavior', () => {
            test('boolean attributes work with hasAttribute check', async () => {
                // Test that true boolean attributes have the attribute present
                const checkedCheckbox = await page.$('input#checkbox-checked-true')
                const hasChecked = await checkedCheckbox.evaluate(el => el.checked);
                expect(hasChecked).toBe(true);

                // Test that false boolean attributes don't have the attribute
                const uncheckedCheckbox = await page.$('#checkbox-checked-false');
                const hasNotChecked = await uncheckedCheckbox.evaluate(el => el.hasAttribute('checked'));
                expect(hasNotChecked).toBe(false);
            });

            test('boolean attributes reflect in DOM properties', async () => {
                const disabledInput = await page.$('input#input-disabled-true')
                const enabledInput = await page.$('input#input-disabled-false')

                const disabledProp = await disabledInput.evaluate(el => el.disabled);
                const enabledProp = await enabledInput.evaluate(el => el.disabled);

                expect(disabledProp).toBe(true);
                expect(enabledProp).toBe(false);
            });

            test('boolean attributes affect element behavior', async () => {
                // Hidden element should not be visible
                const hiddenDiv = await page.$('div#div-hidden-true')
                const visibleDiv = await page.$('div#div-hidden-false')

                const hiddenVisible = await hiddenDiv.isVisible();
                const visibleVisible = await visibleDiv.isVisible();

                expect(hiddenVisible).toBe(false);
                expect(visibleVisible).toBe(true);
            });
        });
    });
});

