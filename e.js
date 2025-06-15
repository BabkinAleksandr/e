/// <reference path="./e.d.ts" />
/// <reference path="./global.d.ts" />
//
// TODO: remove all consoles
// TODO: remove assertions in prod release

// TODO: wrap everything to avoid global pollution
window.__APP_STATE = {
    lastSymbols: [],
    updates: {
        // TODO: use WeakMap tied to DOM nodes, so unmounting will handle unbinding automatically
        component: new Map(),
        type: new Map(),
        attributes: new Map(),
        attribute: new Map(),
        children: new Map()
    }
}

/** @returns {vanilla.Component} */
function e() {
    /** @type {vanilla.DefinedComponent} */
    const component = {}

    Object.defineProperty(component, '__is_e_component', {
        configurable: false,
        enumerable: false,
        value: true,
        writable: false
    })

    component.type = arguments[0]

    if (arguments.length === 1) {
        component.attrs = {}
        component.children = []
        return component
    }

    if (arguments.length === 2) {
        const secondArgumentsIsObject = typeof arguments[1] === 'object' && !Array.isArray(arguments[1])
        const isComponent = typeof arguments[1] === 'object' && !!arguments[1]['__is_e_component']
        if (isComponent) {
            component.attrs = {}
            component.children = [arguments[1]]
        } else if (secondArgumentsIsObject) {
            component.attrs = arguments[1]
            component.children = []
        } else {
            if (!Array.isArray(arguments[1]) && typeof arguments[1] !== 'function') {
                component.children = [arguments[1]]
            }
            component.children = arguments[1]
        }
        return component
    }

    component.attrs = arguments[1]
    component.children = arguments[2]

    if (!Array.isArray(component.children) && typeof component.children !== 'function') {
        component.children = [component.children]
    }

    return component
}

/** @param {'get'|'set'} type
* @param {Symbol} symbol
* @param {string} [key] */
function emit(type, symbol, key) {
    console.group('[EMIT]', type, symbol, key)
    // TODO: add debounce

    if (type === 'get') {
        // FIXME: this one currently is just a buffer. Needs a proper cleanup, or another solution
        // 'cause after initial setup it keeps getting bigger while state is updated
        window.__APP_STATE.lastSymbols.push({ key, symbol })
        console.groupEnd()
        return
    }

    if (type === 'set') {
        /** @type {vanilla.Binding['type'][]} */
        const bindingsTypes = ['component', 'type', 'attributes', 'attribute', 'children']

        bindingsTypes.forEach((bType) => {
            /** @type {Record<string, vanilla.Binding[]> | void} */
            const objBindings = window.__APP_STATE.updates[bType].get(symbol)
            if (objBindings) {
                console.log('obj bindings', objBindings)
                /** @type {vanilla.Binding[] | void} */
                const propertyBindings = objBindings[key]
                if (propertyBindings) {
                    console.log('prop bindings', objBindings)
                    propertyBindings.forEach((binding) => {
                        binding.updateFunction.call(binding.updateFunction)
                    })
                }
            }
        })
        console.groupEnd()
    }
}

/** @template T extends (Object | Array)
    * @param {T} obj
    * @param {Symbol} [parentSymbol]
    * @param {string} [parentKey]
    * @returns {T} */
function createState(obj, parentSymbol, parentKey) {
    assert(Boolean(obj), 'Cannot create state of nullish value')
    assert(typeof obj === 'object', 'Cannot create state of plain value. Please, use Object or Array')

    const s = parentSymbol || Symbol(generateRandomId())

    if (Array.isArray(obj)) {
        const wrappedArr = new ArrayWithNotify(obj.map((item) => {
            if (typeof item === 'object') {
                return createState(item)
            }
            return item
        }), () => emit('set', parentSymbol, parentKey))

        return /** @type {T} */(wrappedArr)
    }

    /** @type {ProxyHandler<Object>} */
    const handler = {
        /** @returns {boolean} */
        set(target, p, newValue, receiver) {
            if (Reflect.get(target, p, receiver) == newValue) return true

            const result = Reflect.set(
                target,
                p,
                // bind only new arrays
                Array.isArray(newValue) ? createState(newValue, s, /** @type {string} */(p)) : newValue,
                receiver
            )
            emit('set', s, /** @type {string} */(p))
            return result
        },
        get(target, p, receiver) {
            emit('get', s, /** @type {string} */(p))
            return Reflect.get(target, p, receiver)
        }
    }
    /** @type {T} */
    const state = /** @type {T} */ ({})
    for (const v in obj) {
        if (typeof obj[v] === 'object' && Boolean(obj[v])) {
            state[v] = createState(obj[v], s, v)
        } else {
            state[v] = obj[v]
        }
    }

    /** @type {vanilla.State<T>} */
    const stateProxy = new Proxy(state, handler)
    stateProxy.__originalObject = obj
    return /** @type {T} */ (stateProxy)
}

/** @param {vanilla.StaticComponent | vanilla.TextComponent} component
  * @returns {component is vanilla.TextComponent} */
function isTextComponent(component) {
    return component.type === 'textnode'
}

/**
    * @param {string | number | boolean | void | EventListener | CSSStyleDeclaration} value
    * @param {HTMLElement | Text} node
    @param {string} attribute
    * @param {string | number | boolean | void | EventListener | CSSStyleDeclaration} prevValue 
    * */
function setOrUpdateAttribute(node, attribute, value, prevValue) {
    if (node instanceof Text) return

    // TODO: check if rerender or not
    if (attribute === 'key') return

    if (attribute.startsWith('on')) {
        const eventName = /** @type {keyof HTMLElementEventMap} */(attribute.slice(2))
        if (prevValue && typeof prevValue === 'function') {
            node.removeEventListener(eventName, /** @type {EventListener} */(prevValue))
        }
        if (value) {
            if (typeof value === 'function') node.addEventListener(eventName, /** @type {EventListener} */(value))
            else node.setAttribute(attribute, value.toString())
        }
        return
    }

    if (typeof value === 'boolean') {
        /** @type {HTMLInputElement} */ (node)[attribute] = Boolean(value);
        return
    }

    if (attribute === 'value') {
        /** @type {HTMLInputElement | HTMLTextAreaElement} */ (node).value = value ? value.toString() : ''
        return
    }

    if (attribute === 'style' && typeof value === 'object') {
        node.style = null
        Object.assign(node.style, value)
        return
    }

    if (typeof value !== 'undefined' && value !== null) node.setAttribute(attribute, String(value))
    else node.removeAttribute(attribute)
}

/** @param {vanilla.StaticComponent} component
  * @returns {Text | HTMLElement} */
function createElement(component) {
    if (isTextComponent(component)) {
        return document.createTextNode(component.children)
    }

    const node = document.createElement(component.type)

    for (const attr in (component.attrs || {})) {
        setOrUpdateAttribute(node, attr, component.attrs[attr], undefined)
    }

    return node;
}


/** @param {vanilla.ComponentDescriptor} descriptor */
const componentUpdateFunction = (descriptor) => {
    console.group('[UPDATE] component')
    console.info('descriptor', descriptor)
    assert(typeof descriptor.component === 'function', 'Cannot perform update on non-function-component')

    /** @type {vanilla.DefinedComponent | string | void} */
    const rendered = typeof descriptor.component === 'function'
        ? descriptor.component.call(descriptor.component)
        : descriptor.component

    // component remains, check if it changed
    if (rendered && descriptor.rendered) {
        if (typeof rendered === 'string') {
            if (isTextComponent(descriptor.rendered)) {
                console.log('update text');
                // update only text
                /** @type {vanilla.TextComponent} */(descriptor.rendered).children = rendered;
                /** @type {Text} */(descriptor.node).data = rendered
                return
            } else {
                console.log('render text instead of a component');
                // render text instead of a component
                // unbindAndDelete(descriptor)
                const textNode = new Text(rendered)
                descriptor.parentNode.replaceChild(textNode, descriptor.node)
                descriptor.node = textNode
                /** @type {vanilla.TextComponent} */
                descriptor.rendered = {
                    type: 'textnode',
                    attrs: {},
                    children: rendered
                }
            }
        } else {
            // TODO:
            // it was text, but now it's not
            // treat it as completely new element

            // TODO: optimize
            console.log('Change from text to component');
            unbindAndDelete(descriptor, { deleteMarker: false })
            renderAndBindConditional(descriptor, rendered)
        }
        console.groupEnd()
        return
    }

    // appeared
    if (rendered && !descriptor.rendered) {
        console.log('Component appeared');
        renderAndBindConditional(descriptor, rendered)
        console.groupEnd()
        return
    }

    // disappeared
    if (!rendered && descriptor.rendered) {
        console.log('Component removed');
        unbindAndDelete(descriptor, { deleteMarker: false })
        console.groupEnd()
        return
    }

    console.groupEnd()
    // here component remains non-rendered
}

/** @param {vanilla.ComponentDescriptor} descriptor */
const typeUpdateFunction = (descriptor) => {
    console.group('[UPDATE] Type')
    assert(descriptor.rendered, "Cannot update type on falsy element")

    const component = typeof descriptor.component === 'function'
        ? descriptor.component()
        : descriptor.component

    assert(Boolean(component), 'Cannot perform type update on falsy component')
    assert(typeof component === 'object', 'Cannot perform type update on text node')
    assert(typeof component.type === 'function', 'Cannot update type with a static descriptor')

    const newType = component.type()

    // type didn't change, no update needed
    if (newType === descriptor.rendered.type) {
        console.log('Type didnt change')
        console.groupEnd()
        return
    }

    // TODO: separate rendering
    const attributesRaw = typeof component.attrs === 'function'
        ? component.attrs()
        : component.attrs
    const attrs = { ...(attributesRaw || {}) }
    for (const attr in attrs) {
        if (typeof attrs[attr] === 'function' && !attr.startsWith('on')) {
            attrs[attr] = attrs[attr].call(attrs[attr])
        }
    }

    // TODO: handle and test handlers updates
    const newElem = createElement({ type: newType, attrs })
    const prevElem = descriptor.node
    newElem.replaceChildren(...prevElem.childNodes)
    descriptor.rendered.type = newType
    descriptor.parentNode.replaceChild(newElem, prevElem)
    descriptor.node = newElem
    descriptor.children.forEach((d) => d.parentNode = newElem)
    console.log('Type updated')
    console.groupEnd()
}

/** @param {vanilla.ComponentDescriptor} descriptor
    * @param {Object} [options]
    * @param {boolean} [options.deleteMarker]
    * */
function unbindAndDelete(descriptor, options) {
    console.log('Unbind and delete', descriptor)

    descriptor.bindings.forEach((binding) => {
        if (binding.type === 'component') return

        const stateUpdatesMap = window.__APP_STATE.updates[binding.type].get(binding.symbol)
        if (!stateUpdatesMap) return

        const propertyBindings = stateUpdatesMap[binding.key]
        if (!propertyBindings) return

        stateUpdatesMap[binding.key] = propertyBindings.filter((b) => b.descriptor.id !== binding.descriptor.id)
    })

    descriptor.bindings = descriptor.bindings.filter((b) => b.type === 'component')

    if (options?.deleteMarker) {
        const marker = getMarkerNode(descriptor)
        if (marker) descriptor.parentNode.removeChild(marker)
    }

    descriptor.parentNode.removeChild(descriptor.node)
    descriptor.node = undefined
    descriptor.rendered = undefined
}

/** @param {vanilla.ComponentDescriptor} descriptor */
const attributesUpdateFunction = (descriptor) => {
    console.log('[UPDATE] Attributes', descriptor)
    const component = typeof descriptor.component === 'function'
        ? descriptor.component()
        : descriptor.component

    if (!component) {
        console.log('No component')
        console.groupEnd()
        return
    }
    assert(typeof component === 'object', 'Cannot update attributes on a text component')
    assert(typeof component.attrs === 'function', 'Cannot perform attributes updates for static attrs')

    // TODO: check whether it should be silent return or assertion failure
    if (!descriptor.rendered) {
        console.log('Nothing rendered')
        console.groupEnd()
        return
    }

    /** @type {Record<string, (vanilla.AttrValue|(() => vanilla.AttrValue))>} */
    const newAttributes = {}
    for (const prevAttr of Object.keys(descriptor.rendered.attrs)) {
        newAttributes[prevAttr] = undefined
    }
    Object.assign(newAttributes, component.attrs())

    // assert(!!descriptor.rendered, 'Cannot update attributes on empty component')

    for (const attr in newAttributes) {
        if (typeof newAttributes[attr] === 'function' && !attr.startsWith('on')) {
            /** @type {vanilla.AttrValue} */
            newAttributes[attr] = evalAndBindUpdate(
                descriptor,
                /** @type {() => vanilla.AttrValue} */(newAttributes[attr]),
                'attribute',
                attr
            )
        }

        if (newAttributes[attr] !== descriptor.rendered.attrs[attr]) {
            console.log('Update attribute', attr)
            setOrUpdateAttribute(descriptor.node, attr, newAttributes[attr], descriptor.rendered.attrs[attr])
            descriptor.rendered.attrs[attr] = newAttributes[attr]
        }
    }
    console.groupEnd()
}

/** @param {vanilla.ComponentDescriptor} descriptor
    * @param {string} attribute */
const attributeUpdateFunction = (descriptor, attribute) => {
    console.group('[UPDATE] Attribute', attribute, descriptor)
    // assert(typeof descriptor.component !== 'function', 'Cannot update attributes on dynamic component')
    assert(!!descriptor.rendered, 'Cannot perform attribute update on non-existent component')
    assert(descriptor.rendered.type !== 'textnode', 'Cannot update attributes on a text component')

    const component = typeof descriptor.component === 'function'
        ? descriptor.component()
        : descriptor.component

    assert(typeof component === 'object', 'Cannot update attributes on a plain or non-existent component')

    const attrs = typeof component.attrs === 'function'
        ? component.attrs()
        : component.attrs

    assert(typeof attrs[attribute] === 'function', `Cannot perform static attribute "${attribute}" update`)
    /** @type {vanilla.AttrValue} */
    const attributeValue = attrs[attribute]()

    // no updates
    if (attributeValue === descriptor.rendered.attrs[attribute]) {
        console.log('Attribute didnt change')
        console.groupEnd()
        return
    }
    setOrUpdateAttribute(descriptor.node, attribute, attributeValue, descriptor.rendered.attrs[attribute])
    descriptor.rendered.attrs[attribute] = attributeValue
    console.log('Attribute updated')
    console.groupEnd()
}

/** @param {vanilla.ComponentDescriptor} descriptor */
const childrenUpdateFunction = (descriptor) => {
    console.group('[UPDATE] Children', descriptor)
    const component = typeof descriptor.component === 'function'
        ? descriptor.component()
        : descriptor.component

    if (!component) {
        console.log('No component')
        console.groupEnd()
        return
    }

    if (!descriptor.rendered) {
        console.log('Nothing rendered')
        console.groupEnd()
        return
    }

    assert(typeof component === 'object', 'Cannot update children on plain component')
    assert(typeof component.children === 'function', 'Cannot update static children list')

    let newChildren = component.children()
    if (typeof newChildren === 'string') newChildren = [newChildren]
    if (!newChildren) newChildren = []

    console.log('new children', newChildren)
    console.log('prev children', descriptor.children.map((c) => c.rendered))

    const prevDescriptors = descriptor.children
    // const prevIdToDescriptor = new Map(prevDescriptors.map((d) => [d.id, d]))
    const prevKeyToDescriptor = new Map(prevDescriptors.map((d, i) => [getKeyFromAttributes(d.rendered, i), d]))

    const newDescriptors = newChildren.map((nc, i) => {
        const prev = prevKeyToDescriptor.get(getKeyFromAttributes(nc, i))
        if (!prev) return render(nc, /** @type {HTMLElement} */(descriptor.node), { appendImmediately: false })
        return prev
    })
    const newIdToChild = new Map(newDescriptors.map((d) => [d.id, d]))
    const elementsToRemove = prevDescriptors.filter((d) => !newIdToChild.has(d.id))
    elementsToRemove.forEach((d) => {
        unbindAndDelete(d, { deleteMarker: true })
    })

    const fragment = document.createDocumentFragment()
    newDescriptors.forEach((d) => {
        fragment.appendChild(d.node)
        if (d.type === 'dynamic') fragment.appendChild(new Comment(d.id))
    });

    // TODO: optimize nodes update. Currently it just reappends elements

    // const newIdToDescriptor = new Map(newDescriptors.map((d) => [d.id, d]))

    /** @type {Record<vanilla.UpdateOperation['type'], number>} */
    // const priorities = {
    //     remove: 1,
    //     move: 2,
    //     insert: 3
    // }
    // const DOMOperations = getOptimalDOMOperations(prevDescriptors, newDescriptors)
    // console.log('DOMOperations', DOMOperations)
    // DOMOperations.operations
    //     .sort((a, b) => priorities[a.type] - priorities[b.type])
    //     .forEach((op) => {
    //         if (op.type === 'remove') {
    //             const prevDescriptor = prevIdToDescriptor.get(op.descriptorId)
    //             assert(Boolean(prevDescriptor), 'Descriptor should exist')
    //             unbindAndDelete(prevDescriptor)
    //             return
    //         }
    //         if (op.type === 'move') {
    //             const prevDescriptor = prevIdToDescriptor.get(op.descriptorId)
    //             assert(Boolean(prevDescriptor), 'Descriptor should exist')
    //             assert(descriptor.node.nodeType !== Node.TEXT_NODE, 'Cannot move children on a text node')
    //             descriptor.node.insertBefore(prevDescriptor.node, /** @type {HTMLElement} */(descriptor.node).children[op.toIndex + 1])
    //             return
    //         }
    //         if (op.type === 'insert') {
    //             const newDescriptor = newIdToDescriptor.get(op.descriptorId)
    //             assert(Boolean(newDescriptor), 'New descriptor should exist')
    //             if (op.insertAfter.type === 'after') {
    //                 const insertAfterDescriptor = prevIdToDescriptor.get(op.insertAfter.descriptorId)
    //                 const insertBefore = insertAfterDescriptor ? insertAfterDescriptor.node.nextSibling : undefined
    //                 descriptor.node.insertBefore(newDescriptor.node, insertBefore)
    //                 return
    //             }
    //
    //             if (op.insertAfter.type === 'before') {
    //                 const insertBeforeDescriptor = prevIdToDescriptor.get(op.insertAfter.descriptorId)
    //                 descriptor.node.insertBefore(newDescriptor.node, insertBeforeDescriptor ? insertBeforeDescriptor.node : undefined)
    //                 return
    //             }
    //
    //             if (op.insertAfter.type === 'beginning') {
    //                 descriptor.node.insertBefore(newDescriptor.node, descriptor.node.firstChild)
    //                 return
    //             }
    //         }
    //     })


    /** @type {HTMLElement} */(descriptor.node).innerHTML = null;
    descriptor.node.appendChild(fragment)
    descriptor.children = newDescriptors;

    console.log('Children updated', prevDescriptors, newChildren)
    console.groupEnd()
}

/** @param {vanilla.Component | vanilla.TextComponent | vanilla.StaticComponent | void} comp
    * @param {number} index
    * @returns {string | number} */
function getKeyFromAttributes(comp, index) {
    const component = typeof comp === 'function'
        ? comp()
        : comp

    if (!component) return index
    if (typeof component === 'string') return component
    if (typeof component === 'object' && component.type === 'textnode') {
        const children = typeof component.children === 'function'
            ? component.children()
            : component.children

        return /** @type {string} */(children)
    }

    let attrs;
    attrs = typeof component === 'object' ? component.attrs : {}
    if (typeof attrs === 'function') attrs = attrs()

    // FIXME: do not use index implicitly, doesnt make any sense
    let key;
    key = (attrs && (typeof attrs.key !== 'undefined')) ? attrs.key : index
    if (typeof key === 'function') key = key()
    return key
}

/** @param {vanilla.ComponentDescriptor} descriptor
    * @param {vanilla.DefinedComponent | string} r */
function renderAndBindConditional(descriptor, r) {
    let rendered = undefined

    if (typeof r === 'string') {
        rendered = {
            type: 'textnode',
            attrs: undefined,
            children: r
        }
    } else {
        rendered = {
            type: r.type,
            attrs: r.attrs,
            children: r.children
        }
    }

    if (typeof rendered.type === 'function') {
        rendered.type = evalAndBindUpdate(descriptor, rendered.type, 'type')
    }
    if (typeof rendered.attrs === 'function') {
        rendered.attrs = evalAndBindUpdate(descriptor, rendered.attrs, 'attributes')
    }
    if (typeof rendered.children === 'function') {
        rendered.children = evalAndBindUpdate(descriptor, rendered.children, 'children')
    }

    // attrs
    if (rendered.attrs) {
        rendered.attrs = { ...rendered.attrs }

        for (const attr in rendered.attrs) {
            if (typeof rendered.attrs[attr] === 'function' && !attr.startsWith('on')) {
                rendered.attrs[attr] = evalAndBindUpdate(
                    descriptor,
                    /** @type {() => vanilla.AttrValue} */(rendered.attrs[attr]),
                    'attribute',
                    attr
                )
            }
        }
    }


    assert(typeof rendered.type !== 'function', 'Cannot proceed with function type')
    assert(typeof rendered.attrs !== 'function', 'Cannot proceed with function attributes')
    assert(typeof rendered.children !== 'function', 'Cannot proceed with function children')
    if (rendered.attrs) {
        assert(Object.keys(rendered.attrs).every((k) => k.startsWith('on') || typeof rendered.attrs[k] !== 'function'))
    }

    descriptor.rendered = /** @type {vanilla.StaticComponent} */ (rendered)
    descriptor.node = createElement(descriptor.rendered)

    if (Array.isArray(rendered.children) && rendered.type !== 'textnode') {
        for (const child of rendered.children) {
            descriptor.children.push(render(child, /** @type {HTMLElement} */(descriptor.node)))
        }
    }

    const marker = getMarkerNode(descriptor)
    assert(!!marker, 'Cannot insert dynamic component without marker')
    descriptor.parentNode.insertBefore(descriptor.node, marker)
    return descriptor
}

/** @param {vanilla.ComponentDescriptor} childDescriptor
    * @returns {Comment | void} commentNode */
function getMarkerNode(childDescriptor) {
    for (const node of childDescriptor.parentNode.childNodes) {
        if (node.nodeType === Node.COMMENT_NODE && /** @type {Comment} */(node).data === childDescriptor.id) {
            return /** @type {Comment} */ (node)
        }
    }
}

/** @template T
    * @param {vanilla.ComponentDescriptor} descriptor 
    * @param {() => T} update
    * @param {vanilla.Binding['type']} type 
    * @param {string | void} arg0 
    * @returns T */
function evalAndBindUpdate(descriptor, update, type, arg0) {
    console.log('[EVAL]', descriptor, type)
    window.__APP_STATE.lastSymbols.length = 0
    /** @type {T} */
    const result = update.call(update)

    /// FIXME: This approach creates a lot of unnecessary bindings, when 'children' is statically rendered
    // which means on every 'EVAL' call, every child property call is also bond to 'children' update

    window.__APP_STATE.lastSymbols.forEach(({ key, symbol }) => {
        // TODO: optimize deduplication
        const symbolBindings = window.__APP_STATE.updates[type].get(symbol)
        if (symbolBindings) {
            const propertyBindings = symbolBindings[key]
            if (propertyBindings) {
                const bindingExist = Boolean(propertyBindings.find((b) =>
                    b.descriptor.id == descriptor.id
                    && b.type === type
                    && (b.type === 'attribute' ? b.attributeName === arg0 : true)
                ))
                if (bindingExist) {
                    console.log('[EVAL]', 'Binding exist')
                    return result
                }
            }
        }

        /** @type {vanilla.Binding | void} */
        let binding;
        switch (type) {
            case "type":
                /** @type {vanilla.TypeBinding} */
                const typeBinding = {
                    type,
                    key,
                    symbol,
                    descriptor,
                    updateFunction: () => typeUpdateFunction(descriptor)
                }
                binding = typeBinding
                break;
            case "component":
                /** @type {vanilla.ComponentBinding} */
                const componentBinding = {
                    type,
                    key,
                    symbol,
                    descriptor,
                    updateFunction: () => componentUpdateFunction(descriptor)
                }
                binding = componentBinding
                break;
            case "attributes":
                /** @type {vanilla.AttributesBinding} */
                const attributesBinding = {
                    type,
                    key,
                    symbol,
                    descriptor,
                    updateFunction: () => attributesUpdateFunction(descriptor)
                }
                binding = attributesBinding;
                break
            case "attribute":
                /** @type {vanilla.AttributeBinding} */
                const attributeBinding = {
                    type: 'attribute',
                    attributeName: arg0 || '',
                    key,
                    symbol,
                    descriptor,
                    updateFunction: () => attributeUpdateFunction(descriptor, arg0 || '')
                }
                binding = attributeBinding
                break
            case "children":
                /** @type {vanilla.ChildrenBinding} */
                const childrenBinding = {
                    type: 'children',
                    key,
                    symbol,
                    descriptor,
                    updateFunction: () => childrenUpdateFunction(descriptor)
                }
                binding = childrenBinding
                break
            default:
                throw new Error(`Unknown binding type: ${type}`)
        }

        console.log('[EVAL]', 'Binding created', binding)
        assert(!!binding, 'Binding was not set')
        descriptor.bindings.push(binding)

        if (!window.__APP_STATE.updates[type].has(symbol)) {
            window.__APP_STATE.updates[type].set(symbol, {})
        }
        const state = window.__APP_STATE.updates[type].get(symbol)
        if (!(key in state)) {
            state[key] = []
        }
        state[key].push(binding)
    })
    window.__APP_STATE.lastSymbols.length = 0
    return result
}

/** @param {vanilla.Component} component 
    * @param {HTMLElement} parentNode
    * @param {Object} [options]
    * @param {boolean} [options.appendImmediately]
* @returns {vanilla.ComponentDescriptor} */
function render(component, parentNode, options) {
    /** @type {vanilla.ComponentDescriptor} */
    const descriptor = {
        id: generateRandomId(),
        type: 'static',
        parentNode,
        node: undefined,
        component,
        rendered: undefined,
        children: [],
        bindings: []
    }

    const appendImmediately = options && options.appendImmediately !== undefined
        ? options.appendImmediately
        : true

    console.group('RENDER')
    console.log('rendering', component, 'in', parentNode)

    let rendered = undefined

    if (typeof component === 'function') {
        console.log('its a function btw')

        descriptor.type = 'dynamic'
        const result = evalAndBindUpdate(descriptor, /** @type {() => (vanilla.DefinedComponent | vanilla.Falsy)} */(component), 'component')

        // regardless of function result
        if (appendImmediately) parentNode.appendChild(new Comment(descriptor.id))

        if (!isComponent(result)) {
            console.log('its not a component')
            console.groupEnd()
            rendered = undefined
            descriptor.rendered = undefined
            return descriptor
        }

        if (typeof result === 'string') {
            console.log('its resulted as textnode', result)
            /** @type {vanilla.TextComponent} */
            rendered = {
                type: 'textnode',
                attrs: {},
                children: result
            }
        } else {
            console.log('its resulted as component', result)
            rendered = {
                type: result.type,
                attrs: result.attrs || {},
                children: result.children
            }
        }
    } else if (typeof component === 'string') {
        console.log('its a string', component)
        /** @type {vanilla.TextComponent} */
        rendered = {
            type: 'textnode',
            attrs: {},
            children: component
        }
    } else {
        rendered = {
            type: component.type,
            attrs: component.attrs || {},
            children: component.children
        }
        console.log('component rendered', rendered)
    }

    if (typeof rendered.type === 'function') {
        console.log('eval type')
        rendered.type = evalAndBindUpdate(descriptor, rendered.type, 'type')
    }
    if (typeof rendered.attrs === 'function') {
        console.log('eval attrs')
        rendered.attrs = evalAndBindUpdate(descriptor, /** @type {() => vanilla.AttrValue} */(rendered.attrs), 'attributes') || {}
    }
    if (typeof rendered.children === 'function') {
        console.log('eval children')
        rendered.children = evalAndBindUpdate(descriptor, rendered.children, 'children') || []
    }

    // attrs
    // copy object, otherwise changes affect component
    rendered.attrs = { ...rendered.attrs }

    for (const attr in rendered.attrs) {
        if (typeof rendered.attrs[attr] === 'function' && !attr.startsWith('on')) {
            /** @type {vanilla.AttrValue} */
            rendered.attrs[attr] = evalAndBindUpdate(
                descriptor,
                /** @type {() => vanilla.AttrValue} */(rendered.attrs[attr]),
                'attribute',
                attr
            )
        }
    }


    assert(typeof rendered.type !== 'function', 'Cannot proceed with function type')
    assert(typeof rendered.attrs !== 'function', 'Cannot proceed with function attributes')
    assert(typeof rendered.children !== 'function', 'Cannot proceed with function children')
    if (rendered.attrs) {
        assert(Object.keys(rendered.attrs).every((k) => k.startsWith('on') || typeof rendered.attrs[k] !== 'function'))
    }

    descriptor.rendered = /** @type {vanilla.StaticComponent} */ (rendered)
    descriptor.node = createElement(descriptor.rendered)

    if (rendered.type !== 'textnode') {
        if (typeof rendered.children === 'string') {
            rendered.children = [rendered.children]
        }
        console.log('rendering children', rendered.children)
        assert(Array.isArray(rendered.children), `Children of ${rendered.type} should be an array`)
        for (const child of rendered.children) {
            descriptor.children.push(render(child, /** @type {HTMLElement} */(descriptor.node)))
        }
    }


    if (appendImmediately) parentNode.appendChild(descriptor.node)

    console.groupEnd()
    return descriptor
}

/** @param {vanilla.DefinedComponent | vanilla.Falsy} component
    * @returns {component is vanilla.DefinedComponent} */
function isComponent(component) {
    return Boolean(component)
}

/** @param {vanilla.Component} rootComponent
    * @param {HTMLElement} container */
function renderApp(rootComponent, container) {
    const descriptor = render(rootComponent, container)
    console.log("descriptor", descriptor)
}

/** @param {Record<string, string|number> | string} styles  */
function stringifyStyles(styles) {
    if (typeof styles === 'string') return styles

    const result = []
    for (const styleName in styles) {
        result.push(`${camelCaseToPascalCase(styleName)}:${styles[styleName]}`)
    }

    return result.join(';')
}

/** @param {string} str
    * @returns string */
function camelCaseToPascalCase(str) {
    let result = '';
    for (let i = 0; i < str.length; i++) {
        if (str[i] >= 'A' && str[i] <= 'Z') {
            result += `-${str[i].toLowerCase()}`
        } else {
            result += str[i]
        }
    }
    return result
}

/** @param {unknown} condition
* @param {string[]} messages
    * @returns {asserts condition}*/
function assert(condition, ...messages) {
    if (!!condition === false) {
        throw new Error(messages.join(' ') || "Assertion failed")
    }
}

function generateRandomId() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const idLength = 16;

    for (let i = 0; i < idLength; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        result += chars.charAt(randomIndex);
    }

    return 'e:' + result;
}

class ArrayWithNotify {
    /**
     * @template T
     * @param {Array<T>} items
     * @param {() => void} notify
     */
    constructor(items = [], notify) {
        this.arr = Array.isArray(items) ? items : [];
        this.notify = notify;
        this.__originalObject = this.arr;

        // Automatically proxy all Array methods that aren't explicitly defined
        return new Proxy(this, {
            get: (target, prop) => {
                // If we have our own implementation, use it
                if (prop in target) {
                    return target[prop];
                }

                // If it's an array method, return a wrapped version that delegates to the internal array
                if (typeof Array.prototype[prop] === 'function') {
                    return function() {
                        const result = this.arr[prop].apply(this.arr, arguments)

                        // If the result is the array itself, return this wrapper instead
                        if (result === this.arr) {
                            return this;
                        }

                        return result;
                    };
                }

                // For array properties (like length)
                return this.arr[prop];
            },

            set: (target, prop, value) => {
                if (prop === 'length') {
                    const oldLength = this.arr.length;
                    this.arr.length = value;
                    if (oldLength !== value) {
                        this.notify();
                    }
                    return true;
                }

                // Handle numeric indices
                if (!isNaN(Number(prop))) {
                    this.arr[prop] = this._wrapItem(value);
                    this.notify();
                    return true;
                }

                target[prop] = value;
                return true;
            }
        });
    }

    push() {
        const result = this.arr.push.apply(this.arr, this._wrapItems(arguments))
        this.notify()
        return result;
    }

    pop() {
        const result = this.arr.pop.call(this.arr)
        if (result) this.notify()
        return this._unwrapItem(result);
    }

    splice() {
        const start = arguments[0]
        const deleteCount = arguments[1]
        const items = this._wrapItems(Array.prototype.slice.call(arguments, 2))
        const result = this.arr.splice.call(this.arr, start, deleteCount, ...items)
        this.notify()
        return this._unwrapItems(result);
    }

    sort() {
        const result = this.arr.sort.apply(this.arr, arguments)
        this.notify()
        return result;
    }

    shift() {
        const result = this.arr.shift.apply(this.arr, arguments)
        if (result) this.notify()
        return this._unwrapItem(result);
    }

    unshift() {
        const items = this._wrapItems(Array.prototype.slice.call(arguments))
        const result = this.arr.unshift.apply(this.arr, items)
        this.notify()
        return result;
    }

    reverse() {
        this.arr.reverse.apply(this.arr, arguments)
        this.notify()
        return this;
    }

    fill() {
        const value = this._wrapItem(arguments[0])
        this.arr.fill.call(this.arr, value, arguments[1], arguments[2])
        this.notify()
        return this
    }

    // Your existing methods for push, pop, splice, etc. can be kept
    // but the Proxy will handle any methods you don't explicitly define

    /** @param {T} item @returns {T} */
    _wrapItem(item) {
        if (item && typeof item === 'object') {
            return createState(item);
        }
        return item;
    }

    /** @param {T} item @returns {T} */
    _unwrapItem(item) {
        if (!item) return item;
        const originalObject = item.__originalObject;
        return originalObject || item;
    }

    /** @param {Iterable<T>} items @returns {Array<T>} */
    _wrapItems(items) {
        const result = [];
        for (const item of items) {
            result.push(this._wrapItem(item));
        }
        return result;
    }

    /** @param {Iterable<T>} items @returns {Array<T>} */
    _unwrapItems(items) {
        const result = [];
        for (const item of items) {
            result.push(this._unwrapItem(item));
        }
        return result;
    }
}

/** @param {vanilla.ComponentDescriptor[]} prevDescriptors
  * @param {vanilla.ComponentDescriptor[]} newDescriptors */
// function getOptimalDOMOperations(prevDescriptors, newDescriptors) {
//     // Step 1: Categorize elements
//     const oldSet = new Set(prevDescriptors.map((d) => d.id))
//     const newSet = new Set(newDescriptors.map((d) => d.id))
//
//     const toRemove = prevDescriptors.filter((d) => !newSet.has(d.id));
//     const toAdd = newDescriptors.filter((d) => !oldSet.has(d.id));
//     const common = prevDescriptors.filter((d) => newSet.has(d.id));
//
//     // Step 2: Create position mappings for common elements
//     /** @type {Map<string, number>} */
//     const newPositions = new Map();
//     newDescriptors.forEach((desc, index) => {
//         if (oldSet.has(desc.id)) {
//             newPositions.set(desc.id, index);
//         }
//     });
//
//     // Step 3: Find optimal rearrangement for common elements
//     const targetPositions = common.map((d) => newPositions.get(d.id));
//     const lisIndices = findLISIndices(targetPositions);
//     const stableElements = new Set(lisIndices.map(i => common[i].id));
//
//     // Step 4: Generate all operations
//     /** @type {vanilla.UpdateOperation[]} */
//     const operations = [];
//
//     // Removals (do these first)
//     toRemove.forEach((d) => {
//         operations.push({
//             type: 'remove',
//             descriptorId: d.id,
//             fromIndex: prevDescriptors.findIndex((pd) => pd.id === d.id)
//         });
//     });
//
//     // Moves (for common elements not in LIS)
//     common.forEach((d) => {
//         if (!stableElements.has(d.id)) {
//             const targetPos = newPositions.get(d.id)
//             operations.push({
//                 type: 'move',
//                 descriptorId: d.id,
//                 fromIndex: prevDescriptors.findIndex((pd) => pd.id === d.id),
//                 insertBefore: findInsertionReference(d, newDescriptors, oldSet, targetPos)
//             });
//         }
//     });
//
//     // Insertions (do these last)
//     toAdd.forEach((d) => {
//         const targetPos = newDescriptors.findIndex((nd) => nd.id === d.id);
//         operations.push({
//             type: 'insert',
//             descriptorId: d.id,
//             toIndex: newDescriptors.findIndex((nd) => nd.id === d.id),
//             insertBefore: findInsertionReference(d, newDescriptors, oldSet, targetPos)
//         });
//     });
//
//     return {
//         operations,
//         stats: {
//             removals: toRemove.length,
//             moves: common.length - stableElements.size,
//             insertions: toAdd.length,
//             stable: stableElements.size,
//             total: operations.length
//         }
//     };
// }

/** @param {vanilla.ComponentDescriptor} descriptor
    * @param {vanilla.ComponentDescriptor[]} newDescriptors
    * @param {vanilla.ComponentDescriptor[]} addedDescriptors */
// function findFinalPosition(descriptor, newDescriptors, addedDescriptors) {
//     // Find position in final order, accounting for insertions
//     let position = newDescriptors.findIndex((d) => d.id === descriptor.id);
//     let adjustment = 0;
//
//     // Count how many new elements come before this one
//     for (let i = 0; i < position; i++) {
//         const newD = newDescriptors[i]
//         if (addedDescriptors.some((ad) => ad.id === newD.id)) {
//             adjustment++;
//         }
//     }
//
//     return position - adjustment;
// }

/** @param {vanilla.ComponentDescriptor} descriptor
    * @param {vanilla.ComponentDescriptor[]} newDescriptors
    * @param {Set<string>} oldDescriptors
    * @param {number} targetPos
    * @returns {vanilla.ComponentDescriptor}*/
// function findInsertionReference(descriptor, newDescriptors, oldDescriptors, targetPos) {
//     // const insertIndex = newDescriptors.findIndex((nd) => nd.id === descriptor.id);
//
//     // Find the nearest existing element that comes before this insertion
//     for (let i = targetPos + 1; i < newDescriptors.length; i++) {
//         if (oldDescriptors.has(newDescriptors[i].id)) {
//             return newDescriptors[i]
//             // return {
//             //     type: 'after',
//             //     descriptorId: newDescriptors[i].id
//             // };
//         }
//     }
//     return null
//
//     // Find the nearest existing element that comes after this insertion
//     // for (let i = insertIndex + 1; i < newDescriptors.length; i++) {
//     //     if (oldDescriptors.has(newDescriptors[i].id)) {
//     //         return {
//     //             type: 'before',
//     //             descriptorId: newDescriptors[i].id
//     //         };
//     //     }
//     // }
//
//     // If no reference found, insert at beginning
//     // return { type: 'beginning' };
// }

/** @param {Array<number>} arr
    * @returns {Array<number>}*/
// function findLISIndices(arr) {
//     const n = arr.length;
//     if (n === 0) return [];
//
//     const tails = [];
//     const parent = new Array(n).fill(-1);
//
//     for (let i = 0; i < n; i++) {
//         let left = 0;
//         let right = tails.length;
//
//         while (left < right) {
//             const mid = Math.floor((left + right) / 2);
//             if (arr[tails[mid]] < arr[i]) {
//                 left = mid + 1;
//             } else {
//                 right = mid;
//             }
//         }
//
//         if (left === tails.length) {
//             tails.push(i);
//         } else {
//             tails[left] = i;
//         }
//
//         if (left > 0) {
//             parent[i] = tails[left - 1];
//         }
//     }
//
//     const result = [];
//     let current = tails[tails.length - 1];
//
//     while (current !== -1) {
//         result.unshift(current);
//         current = parent[current];
//     }
//
//     return result;
// }

// WARN: take another look on this
if (!document) throw new Error('No document')
document.dispatchEvent(new CustomEvent('e:init'))
