document.addEventListener("e:init", () => {
    // Collector for lifecycle alerts across the demo
    window.__LIFECYCLE_ALERTS = [];

    const SubscriptionSection = () => {
        const s = createState({
            counter: 0,
            result: 2,
            obj: { val: 1, obj: { val: 1, sub: 1 } },
        });

        // Subscriptions
        s.onUpdate("counter", (newCounter) => {
            s.result = newCounter + 2;
        });
        s.obj.obj.onUpdate("sub", () => {
            window.__LIFECYCLE_ALERTS.push("Nested obj value updated");
        });

        return e("div", { class: "test-section" }, [
            e("h2", "Subscriptions"),
            e("div", { class: "controls" }, [
                e("button", { id: "increment-counter-btn", onclick: () => s.counter++ }, "Increment Counter"),
                e("button", { id: "update-obj-val-btn", onclick: () => s.obj.val++ }, "Update obj.val"),
                e("button", { id: "update-nested-val-btn", onclick: () => s.obj.obj.val++ }, "Update obj.obj.val"),
                e("button", { id: "update-nested-sub-btn", onclick: () => s.obj.obj.sub++ }, "Update obj.obj.sub"),
            ]),
            e("div", { id: "counter-display" }, () => `Counter: ${s.counter}`),
            e("div", { id: "counter-sub-result" }, () => `Counter + 2: ${s.result}`),
            e("div", { id: "obj-val-display" }, () => `Obj one value: ${s.obj.val}`),
            e("div", { id: "obj-obj-val-display" }, () => `Obj Obj val value: ${s.obj.obj.val}`),
            e("div", { id: "obj-obj-sub-display" }, () => `Obj Obj sub value: ${s.obj.obj.sub}`),
        ]);
    };

    const ArraySubscriptionSection = () => {
        const s = createState({ arrOfValues: [1], sum: 1, counter: 0 });

        s.onUpdate("arrOfValues", (arr) => {
            s.sum = arr.reduce((acc, c) => acc + c, 0);
        });

        return e("div", { class: "test-section" }, [
            e("h2", "Array Subscription"),
            e("div", { class: "controls" }, [
                e("button", {
                    id: "push-to-array-btn",
                    onclick: () => s.arrOfValues.push(s.counter),
                }, "Push Value"),
            ]),
            e("div", { id: "array-values-display", style: "margin-top: 10px" }, () =>
                s.arrOfValues.map((v, i) =>
                    e("span", { key: v + i, style: "margin-right: 4px" }, String(v))
                )
            ),
            e("div", { id: "array-sum-display" }, () => `Sum of numbers in array: ${s.sum}`),
        ]);
    };

    const ComputedSection = () => {
        const s = createState({ counter: 0, obj: { val: 1 } });
        const computedVal = c(() => s.counter + s.obj.val);

        return e("div", { class: "test-section" }, [
            e("h2", "Computed Values"),
            e("div", { class: "controls" }, [
                e("button", {
                    id: "increment-counter-for-computed-btn",
                    onclick: () => s.counter++,
                }, "Increment Counter"),
                e("button", {
                    id: "update-obj-val-for-computed-btn",
                    onclick: () => s.obj.val++,
                }, "Update obj.val"),
            ]),
            e("div", { id: "computed-result-display" },
                () => `Computed result: ${computedVal.value}`
            ),
        ]);
    };

    const LifecycleSection = () => {
        const s = createState({ isMounted: false });

        return e("div", { class: "test-section" }, [
            e("h2", "Lifecycle Hooks via with()"),
            e("div", { class: "controls" }, [
                e("button", {
                    id: "toggle-mounted-btn",
                    onclick: () => (s.isMounted = !s.isMounted),
                }, "Toggle isMounted"),
            ]),
            () =>
                s.isMounted &&
                e("div", { id: "mounted-parent" }, [
                    "Parent Mounted!",
                    e("div", { id: "mounted-child" }, "Child Mounted!").with(() => {
                        window.__LIFECYCLE_ALERTS.push("Child Mounted");
                        return () => {
                            window.__LIFECYCLE_ALERTS.push("Child Unmounted");
                        };
                    }),
                ]).with(() => {
                    window.__LIFECYCLE_ALERTS.push("Parent Mounted");
                    return () => {
                        window.__LIFECYCLE_ALERTS.push("Parent Unmounted");
                    };
                }),
        ]);
    };

    const StaticHookSection = () => {
        return e("div", { class: "test-section" }, [
            e("h2", "Static Component with Hook"),
            e("div", {
                id: "static-hook-component",
                class: "component"
            }, "I am static").with(() => {
                window.__LIFECYCLE_ALERTS.push("Static Mounted");
                return () => {
                    window.__LIFECYCLE_ALERTS.push("Static Unmounted");
                };
            }),
        ]);
    };

    const App = e("div", [
        SubscriptionSection(),
        ArraySubscriptionSection(),
        ComputedSection(),
        LifecycleSection(),
        StaticHookSection(),
    ]);

    renderApp(App, document.getElementById("container"));
});
