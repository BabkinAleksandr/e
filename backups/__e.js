function e() {
    const type = arguments[0]
    const attrs = Array.isArray(arguments[1]) || typeof arguments[1] !== 'object' ? {} : arguments[1]
    let children = []

    if (Array.isArray(arguments[1])) {
        children = arguments[1]
    } else if (Array.isArray(arguments[2])) {
        children = arguments[2]
    } else if (typeof arguments[1] === 'function') {
        children = arguments[1]
    } else if (typeof arguments[2] === 'function') {
        children = arguments[2]
    } else if (typeof arguments[1] === 'string') {
        children = [arguments[1]]
    } else if (typeof arguments[2] === 'string') {
        children = [arguments[2]]
    }

    return { type, attrs, children }
}

class ArrayLike extends Array {
    static fromArray(arr, notify) {
        return new ArrayLike(arr, notify)
    }

    constructor(arr, notify) {
        super()
        this.arr = arr
        this.notify = notify;
    }

    push() {
        const result = this.arr.push.apply(this, [...arguments].map(createState))
        this.notify()
        return result;
    }

    pop() {
        const result = this.arr.pop.apply(this, arguments)
        this.notify()
        return result;
    }

    splice() {
        const result = this.arr.splice.apply(this, arguments)
        this.notify()
        return result;
    }

    sort() {
        const result = this.arr.sort.apply(this, arguments)
        this.notify()
        return result;
    }
}

function createState(obj) {
    /** @type {ProxyHandler<typeof state>} */
    const handler = {
        set(target, p, newValue, receiver) {
            if (Reflect.get(target, p, receiver) == newValue) return

            Reflect.set(target, p, newValue, receiver)
            triggerRerender()
        },
        /* get(target, p, receiver) {
            console.log("Get", { that: this, target, p, receiver })
            return Reflect.get(target, p, receiver)
        } */
    }

    // TODO: think about arrays handling
    /* const arrayHandler = {
        apply(target, thisArg, argumentsList) {
            const result = Reflect.apply(target, thisArg, argumentsList)
            triggerRerender()
            return result
        }
    }; */

    // Array.prototype.push = new Proxy(Array.prototype.push, arrayHandler);

    const state = {}
    for (const v in obj) {
        if (Array.isArray(obj[v])) {
            // state[v] = obj[v]
            state[v] = ArrayLike.fromArray(obj[v].map((item) => {
                if (typeof obj[v] === 'object') {
                    return createState(item)
                }
                return item
            }), triggerRerender)
        } else if (typeof obj[v] === 'object') {
            state[v] = createState(obj[v])
        } else {
            state[v] = obj[v]
        }
    }

    const stateProxy = new Proxy(state, handler)
    return stateProxy
}

function createElement(element) {
    if (element.type === 'text') {
        const node = document.createTextNode(element.text)
        Object.assign(element, { node })
        return node
    }

    const node = document.createElement(element.type)
    Object.assign(element, { node })
    for (const attr in (element.attrs || {})) {
        if (attr.startsWith('on')) {
            node.addEventListener(attr.slice(2), element.attrs[attr])
        } else if (attr === 'checked') {
            node.checked = element.attrs[attr]
        } else if (attr === 'value') {
            console.log('value', node, element)
            node.value = element.attrs[attr]
        } else if (attr === 'style') {
            Object.assign(node.style, element.attrs[attr])
        } else {
            node.setAttribute(attr, element.attrs[attr])
        }
    }

    for (const child of (element.children || [])) {
        node.appendChild(createElement(child))
    }

    return node;
}

function renderTree(element) {
    if (!element) {
        return undefined
    }

    const PRIMITIVE_TYPE = [
        'string',
        'number',
        'bigint',
        'boolean',
        'undefined',
        'symbol',
        'null'
    ]
    if (PRIMITIVE_TYPE.includes(typeof element)) {
        return element;
    }

    if (typeof element === 'function') {
        return renderTree(element.call(element))
    }

    if (Array.isArray(element)) {
        return element.map((e) => renderTree(e))
    }

    const result = {
        type: typeof element.type === 'function' ? element.type.call(element) : element.type,
        attrs: {},
        children: []
    }

    for (const p in (element.attrs || {})) {
        if (typeof element.attrs[p] === 'function' && !p.startsWith('on')) {
            result.attrs[p] = element.attrs[p].call(element.attrs[p])
        } else {
            result.attrs[p] = element.attrs[p]
        }
    }

    let children = element.children || []
    if (typeof element.children === 'function') {
        children = element.children.call(element) || []
    }

    for (const c of (children)) {
        if (typeof c === 'string') {
            result.children.push({ type: 'text', text: c })
            continue
        }

        if (typeof c === 'function') {
            const r = c.call(c)
            if (!r) continue

            if (typeof r === 'string') {
                result.children.push({ type: 'text', text: r })
            } else {
                const a = renderTree(r)
                if (a) result.children.push(a)
            }
            continue
        }

        const r = renderTree(c)
        if (r) result.children.push(r)
    }

    return result
}

// function createApp(tree) {
//     const symbol = Symbol('app')
//     return { symbol, tree }
// }

function bind(states, app, container) {
    const rendered = renderTree(app)

    container.appendChild(createElement(rendered))
}

function createApp(tree, states, container) {
    const symbol = new Symbol()

    if (!window.__APPS) {
        window.__APPS = new Map()
    }

    window.__APPS.set(symbol)
}

function createApp(tree, container) {
    const rendered = renderTree(tree)
    Object.assign(window, {
        __TREE: tree,
        __RENDERED_TREE: rendered,
        __APP_CONTAINER: container
    })

    container.appendChild(createElement(rendered))
}

function triggerRerender() {
    const newTree = renderTree(window.__TREE)
    compareAndRerender(window.__RENDERED_TREE, newTree)
    window.__RENDERED_TREE = newTree
}

function compareAndRerender(oldElem, newElem) {
    if (oldElem.type !== newElem.type) {
        newElem.node = oldElem.node
        newElem.node = rerender(newElem, oldElem.node)
        return
    }

    if (oldElem.type === 'text') {
        newElem.node = oldElem.node
        if (oldElem.text !== newElem.text) {
            oldElem.node.data = newElem.text;
        }
        return;
    }

    if (!areAttributesEqual(oldElem, newElem)) {
        for (const attr in (newElem.attrs || {})) {
            if (attr.startsWith('on')) {
                oldElem.node.removeEventListener(attr.slice(2), oldElem.attrs[attr])
                oldElem.node.addEventListener(attr.slice(2), newElem.attrs[attr])
            } else if (attr === 'checked') {
                oldElem.node.checked = newElem.attrs[attr]
            } else if (attr === 'value') {
                oldElem.node.value = newElem.attrs[attr]
            } else if (attr === 'style') {
                Object.assign(oldElem.node.style, newElem.attrs[attr])
            } else {
                oldElem.node.setAttribute(attr, newElem.attrs[attr])
            }
        }
    }
    newElem.node = oldElem.node

    if (oldElem.children.length !== newElem.children.length) {
        oldElem.node.innerHTML = null
        newElem.children.forEach((newChild) => {
            newChild.node = createElement(newChild)
            newElem.node.appendChild(newChild.node)
        })
        return
    }
    oldElem.children.forEach((oldChild, i) => {
        compareAndRerender(oldChild, newElem.children[i], newElem)
    })
}

function rerender(tree, element) {
    if (!element) return

    const newChild = createElement(tree)
    elem.parentNode.replaceChild(newChild, element)
    return newChild
}

function areAttributesEqual(oldAttrs, newAttrs) {
    const PRIMITIVE_TYPE = [
        'string',
        'number',
        'bigint',
        'boolean',
        'undefined',
        'symbol',
        'null'
    ]
    for (const attr in oldAttrs) {
        if (PRIMITIVE_TYPE.includes(typeof oldAttrs[attr])) {
            if (oldAttrs[attr] !== newAttrs[attr]) {
                return false
            }
        } else {
            if (typeof oldAttrs[attr] === 'function') {
                if (attr.startsWith('on') && oldAttrs[attr].toString() !== newAttrs[attr].toString()) {
                    return false
                }
            } else if (!areAttributesEqual(newAttrs[attr], oldAttrs[attr])) {
                return false
            }
        }
    }
    return true
}
