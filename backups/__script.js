document.addEventListener('DOMContentLoaded', () => {
    const State = createState({
        value: 1,
        nested: {
            value: 1
        },
        arr: [],
        computed() { return this.value * 2 }
    })


    const RequestState = createState({
        data: undefined,
        loading: false,
        error: undefined
    })

    const FormState = createState({
        name: '',
        isAgree: false
    })

    async function makeRequest() {
        RequestState.error = false
        RequestState.loading = true
        new Promise((resolve) => {
            setTimeout(() => {
                resolve("Result")
            }, 2000)
        })
            .then((res) => {
                RequestState.data = res;
                RequestState.loading = false;
            })
            .catch(() => {
                RequestState.error = true
                RequestState.loading = false
            })
    }

    function getRequestState(state) {
        if (state.error) return 'error'
        if (state.loading) return 'loading'
        if (state.data && !state.loading && !state.error) return 'success'
        return 'idle'
    }

    const Button = (className, text) => e(
        'button',
        { class: className, onclick: () => State.value += 1 },
        [text]
    )


    const Form = function() {
        const handleSubmit = (e) => {
            e.preventDefault()
            console.log('submit', { ...FormState })
            FormState.name = '0'
            alert('Submitted')
        }

        const handleInput = (e) => FormState.name = e.target.value
        const handleCheckbox = () => FormState.isAgree = !FormState.isAgree

        return (
            e('form', { class: 'mt-3', onsubmit: handleSubmit }, [
                e('label', [
                    'Name: ',
                    e('input', { type: 'text', value: () => FormState.name, oninput: handleInput }, [])
                ]),
                e('label', [
                    'Accept: ',
                    e('input', { type: 'checkbox', checked: () => FormState.isAgree, onchange: handleCheckbox }, [])
                ]),
                e('button', { type: 'submit' }, ['Submit'])
            ])
        )
    }

    const ToDoState = createState({
        tasks: [],
        newTask: '',
    })
    const arrUpdate = (arr, findCb, cb) => {
        const item = arr.find(findCb)
        if (item) cb(item)
    }
    const arrRemove = (arr, findCb) => {
        const idx = arr.findIndex(findCb)
        if (idx > -1) arr.splice(idx, 1)
    }
    const arrAdd = (arr, elem) => arr.push(elem)

    const addTask = (task) => arrAdd(ToDoState.tasks, { task, done: false })
    const toggleDone = (task) => arrUpdate(ToDoState.tasks, (t) => t.task === task, (t) => t.done = !t.done)
    const deleteTask = (task) => arrRemove(ToDoState.tasks, (t) => t.task === task)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!ToDoState.newTask) return
        addTask(ToDoState.newTask)
        ToDoState.newTask = ''
    }

    const ToDoApp = e('div', [
        e('h2', ['To do']),
        e('form', { onsubmit: handleSubmit }, [
            e('input', { type: 'text', onchange: (e) => ToDoState.newTask = e.target.value, value: () => ToDoState.newTask }),
            e('button', { type: 'submit', }, ['Add new']),
        ]),
        e('ul', { class: () => 'mt-10' }, () => ToDoState.tasks.map((t) =>
            e('div', { style: { display: 'flex' } }, [
                e('div', { style: () => ({ textDecoration: t.done ? 'line-through' : 'none' }) }, t.task),
                e('button', { onclick: () => toggleDone(t.task) }, 'toggle'),
                e('button', { onclick: () => deleteTask(t.task) }, 'delete'),
            ])
        ))
    ])
    createApp(ToDoApp, document.getElementById('container'))

    const App = e('div', [
        e('p', { class: () => `mt-${State.value}`, 'aria-hidden': false }, [
            () => `This is paragraph. Value is: ${State.value}`
        ]),
        e('div', [
            e('p', ['One ', 'two ', 'three']),
            e('p', [
                'One ',
                'two ',
                () => `three (${State.value})`,
                () => State.value % 2 === 0 && e('span', ['hello'])
            ])
        ]),
        // Button(undefined, () => `Click ${State.value % 3 === 0 ? "Hey" : "not"}`),
        Button('ml-3', 'Static'),
        e('div', { class: 'mt-3' }, [
            e('div', [() => `Current status: ${getRequestState(RequestState)}`]),
            () => !RequestState.loading && RequestState.data && e('div', [() => `Data: ${RequestState.data}`]),
            () => !RequestState.data && e('button', { onclick: makeRequest }, ['Make request'])
        ]),
        Form(),
        e('div', [() => `Computed: ${State.computed()}`]),
        e('div', [() => `Nested: ${State.nested.value}`]),
        e('button', { onclick: () => State.nested.value += 1 }, ['Increment']),
        e('div', { style: { marginTop: '10px' } }, [
            e('div', [() => `Arr length is: ${State.arr.length}`]),
            e('button', { onclick: () => State.arr.push(1) }, ['Push'])
        ]),
        // e('div', { class: 'container' }, Array(1000).fill(0).map((_, i) => (
        //     e('span', { class: () => (i + State.value) % 2 === 0 ? 'even' : 'odd' }, [() => `${i + State.value}`])
        // )))
    ])

    // createApp(App, document.getElementById('container'))
})

