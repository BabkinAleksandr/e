document.addEventListener('DOMContentLoaded', () => {
    const Container = (children) => e('div', { class: 'my-3' }, children || [])

    const paddingWithPinkBg = 'padding: 10px; background-color: pink;'
    const paddingWithLimeBg = 'padding: 10px; background-color: lime;'
    const paddingWithLightblueBg = 'padding: 10px; background-color: lightblue;'
    const paddingWithGrayBg = 'padding: 10px; background-color: gray;'

    const Rendering = e('div', [
        e('h2', 'Rendering'),
        e('div', 'Static div'),
        e('p', [
            'Static text'
        ]),
        e('div', { style: paddingWithPinkBg }, [
            e('div', { style: paddingWithLimeBg }, [
                e('div', { style: paddingWithLightblueBg }, 'Nested')
            ])
        ]),
        e('label', [
            e('input', { type: 'checkbox', checked: true }),
            'Checked'
        ]),
        e('div', { style: { marginTop: '10px', backgroundColor: 'red' } }, 'styles'),
        e('div', [
            'One',
            'Two',
            'Three'
        ]),
        e('div', { style: paddingWithLightblueBg }, [
            e('div', { style: paddingWithLimeBg }, [
                e('div', { style: paddingWithLightblueBg }, 'nested'),
                e('div', { style: paddingWithPinkBg }, [
                    () => e('div', { style: paddingWithGrayBg }, 'nested')
                ])
            ]),
            e('div', { style: paddingWithPinkBg }, [
                e('div', { style: paddingWithGrayBg }, 'nested'),
                e('div', { style: paddingWithLightblueBg }, () => [
                    () => e('div', { style: paddingWithLimeBg }, 'nested')
                ])
            ]),
            e('div', { style: paddingWithGrayBg }, [
                e('div', { style: paddingWithLimeBg }, 'nested'),
                e('div', { style: paddingWithPinkBg }, [
                    e('div', { style: paddingWithLightblueBg }, 'nested')
                ])
            ]),
        ]),
        e('div', () => 'text children func'),
        e('div', () => ['arr children func']),
        e('hr')
    ])

    // const state = createState({
    //     value: 0,
    //     values: [0],
    //     items: []
    // })

    const PlainState = e('div', {}, [
        // Container([
        //     e('div', '1'),
        //     () => state.value % 2 === 0 && e('div', 'Component update works'),
        //     e('div', '1'),
        // ]),
        // Container([
        //     e(() => state.value % 2 === 0 ? 'code' : 'div', [
        //         'nested\n',
        //         'nested\n',
        //         'nested\n',
        //         'Type update works'
        //     ]),
        // ]),
        // Container([
        //     e(
        //         'div',
        //         () => (state.value % 2 === 0 ? { class: 'red' } : { style: 'color:green' }),
        //         'Attributes update works'
        //     ),
        // ]),
        // Container([
        //     e('label', [
        //         e('input', { type: 'checkbox', checked: () => (state.value % 2 === 0) }, []),
        //         'Check update works'
        //     ]),
        // ]),
        Container([
            e(
                'button',
                {
                    class: 'mt-2', onclick: () => {
                        state.values = [...state.values, state.value++]
                    }
                },
                'Click'
            ),
        ]),
        // Container([
        //     () => `Value is: ${state.value}`,
        // ]),
        // Container([
        //     e('div', () => [e('span', 'hello')]),
        //     e('div', () => state.values.map((v) =>
        //         e('button', { key: v, onclick: () => { state.values = state.values.filter((sv) => sv !== v) } }, String(v + 1))
        //     )),
        //     e('div', () => state.value % 2 === 0 ? [e('span', 'hello')] : 'a'),
        // ]),
        // () => e('div', `value: ${state.value}`),
        // () => state.value % 2 === 0 ? 'Text' : e('span', 'Component'),
        // () => state.value % 2 === 0 ? e('div', 'Hello') : e('div', 'World'),
        () => state.value % 2 === 0 && e(
            () => state.value % 3 === 0 ? 'section' : 'div',
            () => (state.value % 4 === 0 ? { class: 'red' } : { style: 'color:green' }),
            ['one', 'two']
        ),
        // () => state.value % 2 === 0 && e(() => state.value % 3 === 0 ? 'section' : 'div',
        //     () => (state.value % 2 === 0 ? { class: 'red' } : { style: 'color:green' }),
        //     () => state.value % 4 === 0
        //         ? ['one']
        //         : ['two'])
    ])

    renderApp(Rendering, document.getElementById('container'))
    // renderApp(PlainState, document.getElementById('container2'))

    const ToDoState = createState({
        tasks: [],
        newTask: '',
    })
    let counter = 0;
    const arrRemove = (arr, findCb) => {
        const idx = arr.findIndex(findCb)
        if (idx > -1) arr.splice(idx, 1)
    }
    const arrAdd = (arr, elem) => arr.push(elem)

    const deleteTask = (id) => arrRemove(ToDoState.tasks, (t) => t.id === id)
    const moveTaskUp = (id) => {
        const index = ToDoState.tasks.findIndex((t) => t.id === id)
        if (index <= 0) return
        const tmp = ToDoState.tasks[index - 1]
        ToDoState.tasks[index - 1] = ToDoState.tasks[index]
        ToDoState.tasks[index] = tmp
    }
    const moveTaskDown = (id) => {
        const index = ToDoState.tasks.findIndex((t) => t.id === id)
        if (index === -1 || index >= ToDoState.tasks.length - 1) return
        const tmp = ToDoState.tasks[index + 1]
        ToDoState.tasks[index + 1] = ToDoState.tasks[index]
        ToDoState.tasks[index] = tmp
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!ToDoState.newTask) return
        arrAdd(ToDoState.tasks, { id: counter++, task: ToDoState.newTask, done: false })
        ToDoState.newTask = ''
    }

    const ToDoApp = e('div', [
        e('h2', 'To do'),
        e('form', { onsubmit: handleSubmit }, [
            e('input', { type: 'text', onchange: (e) => ToDoState.newTask = e.target.value, value: () => ToDoState.newTask }),
            e('button', { type: 'submit', }, 'Add new'),
        ]),
        e('ul', { class: 'mt-10' }, () => ToDoState.tasks.map((t) =>
            e('li', { key: t.id, style: { display: 'flex' } }, [
                e('div', { style: () => ({ textDecoration: t.done ? 'line-through' : 'none' }) }, t.task),
                e('button', { style: 'margin-left: 10px;', onclick: () => t.done = !t.done }, 'toggle'),
                e('button', { onclick: () => deleteTask(t.id) }, 'delete'),
                e('button', { onclick: () => moveTaskUp(t.id) }, '^'),
                e('button', { onclick: () => moveTaskDown(t.id) }, 'v'),
            ])
        )),
        e('button', { onclick: () => ToDoState.tasks.pop() }, 'Remove last'),
        e('button', { onclick: () => ToDoState.tasks.reverse() }, 'Reverse'),
        e('button', { onclick: () => ToDoState.tasks.length = 0 }, 'Clean')
    ])
    renderApp(ToDoApp, document.getElementById('todo'))

    // console.log(renderToString(App))
})

