document.addEventListener("e:init", () => {
    const state = createState({
        counter: 0,
        result: 2,
        arrOfValues: [1],
        sum: 0,
        obj: {
            val: 1,
            obj: {
                val: 1,
                sub: 1
            }
        },
        isMounted: false
    });

    const computed = {
        result: c(() => state.counter + state.obj.val + state.obj.obj.val)
    }

    state.onUpdate('counter', (newCounter) => state.result = newCounter + 2)
    state.onUpdate('arrOfValues', (arr) => {
        console.warn('TEST')
        state.sum = arr.reduce((acc, c) => acc + c, 0)
    })
    state.obj.obj.onUpdate('sub', () => {
        alert('Nested obj value updated')
    })

    const App = e("div", [
        e("div", { class: "test-section" }, [
            e("h2", "Lifecycles"),
            e("div", { class: "controls" }, [
                e('button', { onclick: () => state.counter++ }, 'Increment'),
                e('button', { onclick: () => state.arrOfValues.push(state.counter) }, 'Push'),
                e('button', { onclick: () => state.obj.val++ }, 'Update obj val'),
                e('button', { onclick: () => state.obj.obj.val++ }, 'Update obj obj val'),
                e('button', { onclick: () => state.obj.obj.sub++ }, 'Update obj obj sub'),
                e('button', { onclick: () => state.isMounted = !state.isMounted }, 'Toggle isMounted'),
            ]),
            e('div', () => `Counter: ${state.counter}`),
            e('div', () => `Counter + 2: ${state.result}`),
            e('div', { style: 'margin-top: 10px' },
                () => state.arrOfValues.map((v, i) => e('span', { key: v + i, style: 'margin-right: 4px' }, String(v)))
            ),
            e('div', () => `Sum of numbers in array: ${state.sum}`),
            e('div', () => `Obj one value: ${state.obj.val}`),
            e('div', () => `Obj Obj val value: ${state.obj.obj.val}`),
            e('div', () => `Obj Obj sub value: ${state.obj.obj.sub}`),
            e('div', () => `Computed result: ${computed.result.value}`),
            () => state.isMounted && e('div', 'Mounted!').with(() => {
                alert('Mounted')
                const onResize = () => void 0
                window.addEventListener('resize', onResize)
                const timer = setInterval(() => console.log('hey'), 1000)

                return () => {
                    alert('Unmounted')
                    window.removeEventListener('resize', onResize)
                    clearInterval(timer)
                }
            })
        ]),
    ]);

    renderApp(App, document.getElementById("container"));
});
