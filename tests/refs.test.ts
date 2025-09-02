import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { Page } from "puppeteer";

import '../e.d.ts'

let page: Page | undefined;

declare global {
    interface Window {
        __TEST_REFS: Record<string, vanilla.Ref<HTMLElement>>
    }
}

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error("Puppeteer browser not available from global setup.");
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto("http://localhost:3002/refs");
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector("#container");
});

afterAll(async () => {
    if (page) await page.close();
});

describe("Ref attribute functionality", () => {
    test("basic ref stores node reference", async () => {
        await page.click("#show-basic-btn");
        await page.waitForSelector("#basic-ref-element");

        const tag = await page.evaluate(() => {
            return window.__TEST_REFS.basic.ref?.tagName.toLowerCase();
        });
        expect(tag).toBe("div");
    });

    test("ref is cleared when component disappears", async () => {
        await page.click("#show-basic-btn"); // show
        await page.waitForSelector("#basic-ref-element");
        expect(
            await page.evaluate(() => !!window.__TEST_REFS.basic.ref)
        ).toBe(true);

        await page.click("#hide-basic-btn"); // hide
        await page.waitForSelector("#basic-ref-element", { hidden: true });

        const refValue = await page.evaluate(() => window.__TEST_REFS.basic.ref);
        expect(refValue).toBeUndefined()
    });

    test("ref updates when component type changes", async () => {
        await page.click("#set-type-div-btn");
        await page.waitForSelector("#type-ref-element");
        let tag = await page.evaluate(
            () => window.__TEST_REFS.type.ref?.tagName.toLowerCase()
        );
        expect(tag).toBe("div");

        await page.click("#set-type-span-btn");
        await page.waitForSelector("span#type-ref-element");
        tag = await page.evaluate(
            () => window.__TEST_REFS.type.ref?.tagName.toLowerCase()
        );
        expect(tag).toBe("span");
    });

    test("ref updates when switching between text and element", async () => {
        const textNodeType = 3 // Node.TEXT_NODE
        const elementNodeType = 1 // Node.ELEMENT_NODE
        await page.click("#set-text-btn");
        await page.waitForFunction(
            () => window.__TEST_REFS.textOrElement.ref?.nodeType === Node.TEXT_NODE
        );
        let nodeType = await page.evaluate(
            () => window.__TEST_REFS.textOrElement.ref?.nodeType
        );
        expect(nodeType).toBe(textNodeType);


        await page.click("#set-element-btn");
        await page.waitForSelector("#text-or-element-ref");
        nodeType = await page.evaluate(
            () => window.__TEST_REFS.textOrElement.ref?.nodeType
        );
        expect(nodeType).toBe(elementNodeType);
    });

    test("ref remains stable when attributes are updated", async () => {
        await page.click("#show-attrs-btn");
        await page.waitForSelector("#attrs-ref-element");

        const initialHandle = await page.evaluate(
            () => window.__TEST_REFS.attrs.ref
        );

        await page.click("#update-attrs-btn");
        await page.waitForFunction(
            () =>
                document.querySelector("#attrs-ref-element")?.getAttribute("title") ===
                "Updated"
        );

        const afterHandle = await page.evaluate(
            () => window.__TEST_REFS.attrs.ref
        );
        expect(afterHandle).toEqual(initialHandle)
    });

    test("ref object can be swapped and updates correctly", async () => {
        await page.click("#set-ref-a-btn");
        await page.waitForSelector("#swap-ref-element");

        const refA = await page.evaluate(() => window.__TEST_REFS.swapA.ref);
        const refB = await page.evaluate(() => window.__TEST_REFS.swapB.ref);
        expect(refA).not.toBeUndefined();
        expect(refB).toBeUndefined();

        await page.click("#set-ref-b-btn");
        await page.waitForSelector("#swap-ref-element");

        const refAAfter = await page.evaluate(() => window.__TEST_REFS.swapA.ref);
        const refBAfter = await page.evaluate(() => window.__TEST_REFS.swapB.ref);
        expect(refAAfter).toBeUndefined()
        expect(refBAfter).not.toBeUndefined()

        // check that is reference the same element
        expect(refA).toEqual(refBAfter)
    });
});
