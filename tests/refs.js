document.addEventListener("e:init", () => {
    window.__TEST_REFS = {
        basic: r(),
        type: r(),
        textOrElement: r(),
        attrs: r(),
        swapA: r(),
        swapB: r(),
    };

    const state = createState({
        showBasic: false,
        typeTag: "div",
        textOrElement: "none", // "text" | "element"
        showAttrs: false,
        attrsUpdated: false,
        useRef: "A", // "A" | "B"
    });

    // Components
    const BasicRefComponent = () => {
        if (!state.showBasic) return null;
        return e("div", { id: "basic-ref-element", ref: window.__TEST_REFS.basic }, "Basic ref element");
    };

    const TypeRefComponent = () => {
        return e(
            () => state.typeTag,
            { id: "type-ref-element", ref: window.__TEST_REFS.type },
            `Type is ${state.typeTag}`
        );
    };

    const TextOrElementComponent = () => {
        if (state.textOrElement === "text") {
            return e("textnode", { ref: window.__TEST_REFS.textOrElement }, "I am text");
        }
        if (state.textOrElement === "element") {
            return e("div", { id: "text-or-element-ref", ref: window.__TEST_REFS.textOrElement }, "I am element");
        }
    };

    const AttrsRefComponent = () => {
        if (!state.showAttrs) return null;
        return e(
            "div",
            {
                id: "attrs-ref-element",
                ref: window.__TEST_REFS.attrs,
                title: () => (state.attrsUpdated ? "Updated" : "Initial"),
            },
            "Attrs ref element"
        );
    };

    const SwapRefComponent = () => {
        const refObj = () => state.useRef === "A" ? window.__TEST_REFS.swapA : window.__TEST_REFS.swapB;
        return e("div", () => ({ id: "swap-ref-element", ref: refObj() }), "Swap ref element");
    };

    // App
    const App = e("div", [
        e("div", { class: "test-section" }, [
            e("h2", "Basic Ref"),
            e("div", { class: "controls" }, [
                e("button", { id: "show-basic-btn", onclick: () => (state.showBasic = true) }, "Show"),
                e("button", { id: "hide-basic-btn", onclick: () => (state.showBasic = false) }, "Hide"),
            ]),
            BasicRefComponent,
        ]),

        e("div", { class: "test-section" }, [
            e("h2", "Type Ref"),
            e("div", { class: "controls" }, [
                e("button", { id: "set-type-div-btn", onclick: () => (state.typeTag = "div") }, "Div"),
                e("button", { id: "set-type-span-btn", onclick: () => (state.typeTag = "span") }, "Span"),
            ]),
            TypeRefComponent,
        ]),

        e("div", { class: "test-section" }, [
            e("h2", "Text or Element Ref"),
            e("div", { class: "controls" }, [
                e("button", { id: "set-text-btn", onclick: () => (state.textOrElement = "text") }, "Text"),
                e("button", { id: "set-element-btn", onclick: () => (state.textOrElement = "element") }, "Element"),
                e("button", { id: "set-none-btn", onclick: () => (state.textOrElement = "none") }, "None"),
            ]),
            TextOrElementComponent,
        ]),

        e("div", { class: "test-section" }, [
            e("h2", "Attrs Ref"),
            e("div", { class: "controls" }, [
                e("button", { id: "show-attrs-btn", onclick: () => (state.showAttrs = true) }, "Show"),
                e("button", { id: "hide-attrs-btn", onclick: () => (state.showAttrs = false) }, "Hide"),
                e("button", { id: "update-attrs-btn", onclick: () => (state.attrsUpdated = true) }, "Update Attrs"),
                e("button", { id: "reset-attrs-btn", onclick: () => (state.attrsUpdated = false) }, "Reset Attrs"),
            ]),
            AttrsRefComponent,
        ]),

        e("div", { class: "test-section" }, [
            e("h2", "Swap Ref"),
            e("div", { class: "controls" }, [
                e("button", { id: "set-ref-a-btn", onclick: () => (state.useRef = "A") }, "Use Ref A"),
                e("button", { id: "set-ref-b-btn", onclick: () => (state.useRef = "B") }, "Use Ref B"),
            ]),
            SwapRefComponent(),
        ]),
    ]);

    renderApp(App, document.getElementById("container"));
});
