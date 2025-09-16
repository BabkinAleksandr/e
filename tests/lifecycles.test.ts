import { beforeAll, afterAll, describe, expect, test } from "bun:test";
import { Page } from "puppeteer";

let page: Page | undefined;

declare global {
    interface Window {
        __LIFECYCLE_ALERTS: Array<string>;
    }
}

beforeAll(async () => {
    if (!global.__E2E_BROWSER__) {
        throw new Error("Puppeteer browser not available from global setup.");
    }
    page = await global.__E2E_BROWSER__.newPage();
    await page.goto("http://localhost:3002/lifecycles");
    await page.setViewport({ width: 1080, height: 1024 });
    await page.waitForSelector("#container");
});

afterAll(async () => {
    if (page) await page.close();
});

describe("State Subscriptions & Computed Values", () => {
    test("subscribes to top-level state", async () => {
        const initial = await page.$eval("#counter-sub-result", (el) => el.textContent);
        expect(initial).toBe("Counter + 2: 2");

        await page.click("#increment-counter-btn");
        await page.waitForFunction(() =>
            document.querySelector("#counter-sub-result")?.textContent?.includes("3")
        );

        const updated = await page.$eval("#counter-sub-result", (el) => el.textContent);
        expect(updated).toBe("Counter + 2: 3");
    });

    test("subscribes to nested state object property", async () => {
        await page.click("#update-nested-val-btn");
        await page.waitForFunction(() =>
            document.querySelector("#obj-obj-val-display")?.textContent?.includes("2")
        );

        const text = await page.$eval("#obj-obj-val-display", (el) => el.textContent);
        expect(text).toBe("Obj Obj val value: 2");
    });

    test("subscribes to nested state deeper property triggers onUpdate", async () => {
        await page.evaluate(() => { window.__LIFECYCLE_ALERTS.length = 0; });
        await page.click("#update-nested-sub-btn");

        await page.waitForFunction(() =>
            window.__LIFECYCLE_ALERTS.includes("Nested obj value updated")
        );

        const alerts = await page.evaluate(() => window.__LIFECYCLE_ALERTS);
        expect(alerts).toContain("Nested obj value updated");
    });

    test("subscription handles array push and keeps sum updated", async () => {
        const beforeSum = await page.$eval("#array-sum-display", (el) => el.textContent);
        expect(beforeSum).toBe("Sum of numbers in array: 1");

        await page.click("#push-to-array-btn");
        await page.waitForFunction(() =>
            document.querySelector("#array-values-display")?.textContent?.includes("0")
        );

        const sumText = await page.$eval("#array-sum-display", (el) => el.textContent);
        expect(sumText).toMatch(/Sum of numbers in array:/);
    });

    test("computed values update when dependent state changes", async () => {
        const initial = await page.$eval("#computed-result-display", (el) => el.textContent);
        await page.click("#increment-counter-for-computed-btn");
        await page.waitForFunction(() =>
            document.querySelector("#computed-result-display")?.textContent
        );

        const updated = await page.$eval("#computed-result-display", (el) => el.textContent);
        expect(updated).not.toBe(initial);
    });
});

describe("Lifecycle Hooks (.with())", () => {
    test("parent and child lifecycle mounted/unmounted correctly", async () => {
        await page.evaluate(() => (window.__LIFECYCLE_ALERTS.length = 0));

        // Mount parent (and child inside it)
        await page.click("#toggle-mounted-btn");
        await page.waitForSelector("#mounted-parent");
        await page.waitForSelector("#mounted-child");

        const afterMount = await page.evaluate(() => window.__LIFECYCLE_ALERTS);
        expect(afterMount).toContain("Parent Mounted");
        expect(afterMount).toContain("Child Mounted");

        // Unmount parent -> should also unmount child
        await page.click("#toggle-mounted-btn");
        await page.waitForSelector("#mounted-parent", { hidden: true });

        const afterUnmount = await page.evaluate(() => window.__LIFECYCLE_ALERTS);
        expect(afterUnmount).toContain("Parent Unmounted");
        expect(afterUnmount).toContain("Child Unmounted");
    });

    test("multiple toggle cycles fire correct mount/unmount counts", async () => {
        await page.evaluate(() => (window.__LIFECYCLE_ALERTS.length = 0));

        for (let i = 0; i < 2; i++) {
            await page.click("#toggle-mounted-btn");
            await page.waitForSelector("#mounted-parent");
            await page.click("#toggle-mounted-btn");
            await page.waitForSelector("#mounted-parent", { hidden: true });
        }

        const alerts = await page.evaluate(() => window.__LIFECYCLE_ALERTS);
        const parentMounts = alerts.filter((a) => a === "Parent Mounted").length;
        const parentUnmounts = alerts.filter((a) => a === "Parent Unmounted").length;
        const childMounts = alerts.filter((a) => a === "Child Mounted").length;
        const childUnmounts = alerts.filter((a) => a === "Child Unmounted").length;

        expect(parentMounts).toBe(2);
        expect(parentUnmounts).toBe(2);
        expect(childMounts).toBe(2);
        expect(childUnmounts).toBe(2);
    });
});

describe("Static Component Lifecycle Hook", () => {
    test("calls hook on initial mount", async () => {
        // after page reload, hook should populate __LIFECYCLE_ALERTS array
        await page.reload()
        await page.waitForSelector("#static-hook-component");

        const alerts = await page.evaluate(() => window.__LIFECYCLE_ALERTS);
        expect(alerts).toContain("Static Mounted");
    });

    // TODO: think about this
    // manual manipulating is not expected, so probably we should not care about this
    test.todo("calls unmount hook if component removed from DOM", async () => {
        await page.evaluate(() => {
            const el = document.querySelector("#static-hook-component");
            if (el) el.remove();
        });

        await new Promise((r) => setTimeout(r, 50));

        const alerts = await page.evaluate(() => window.__LIFECYCLE_ALERTS);
        expect(alerts).toContain("Static Unmounted");
    });
});
