# E

Yet another javascript library for modern web applications.

**It's a WIP**. I mean it. The code is garbage, but will be refactored at the end.

## Features

### Zero-build

No need to set up webpack, esbuild or any other js build tool. Just put a `<script/>` in your html and you're good to go.

### Pure JS

No additional concepts to learn. No additional syntax to learn.

__E__ is just a tiny wrapper adding reactivity to browser API and making it declarative rather than imperative.

### Tiny

_Fits in 1Kb (gzipped)_!

...okay, that's actually not true at the moment 😁. But it's the desired state.

While project is WIP, there is a lot of code duplicates (really a lot),
console statements and assertions, which would be remove in production minified build.

Also, I think I could split it in to modules, because some features could not be really needed by everyone.

### Fast

Each reactive state update is finely targeted to update only those parts, that use updated value.

### ...Modular?

Didn't decide about this yet.

On one hand we have zero-build library to be used right away.
But on the other hand, if we want to build something mid- or large-sized, where size and performance matter the most, modularity is necessary.

## Quick start

_API is quite unstable and subject to changes._

```js

// wait for the custom event 'e:init', which is fired when lib code is loaded
document.addEventListener('e:init', () => {
    // create a state using 'createState' function
    const state = createState({
        value: 1,
        arrOfValues: [1, 2, 3],
        nested: {
            value: 'hello'
        }
    })

    // this snippet will be rendered as:
    //  <main class="app">
    //    <div>Hello, world!</div>
    //  </main>
    const App = e('main', { class: 'app' }, [
        e('div', 'Hello, world!')
    ])

    // render app in to a container
    renderApp(Rendering, document.getElementById('container'));
})
```

### State

State is created using `createState` function. Object should be passed as a parameter. Arbitrary nesting is allowed:

```js
const state = createState({
    value: 1,
    arrOfValues: [1, 2, 3],
    arrOfObjects: [
        { name: 'item1', isActive: false },
        { name: 'item2', isActive: false }
    ]
    nested: {
        value: 'hello'
    }
})
```

#### State updates

State is supposed to be mutated directly.
All the changes are tracked separately.
You're free to use immutable structures and overwrite state, but it would be less effecient.

```js
const state = createState({
    arrOfObjects: [
        { name: 'item', isActive: false },
        { name: 'item', isActive: false }
    ]
    nested: {
        nested: {
            counter: 0,
        }
    }
})

// will only affect elements which rely on 'isActive' flag
state.arrOfObjects[0].isActive = true

// add new item to the array by pushing to it
state.arrOfObjects.push({ name: 'item3', isActive: true })
// ...or by concatenating, but it's not recommended
state.arrOfObjects = [...state.arrOfObjects, { name: 'item3', isActive: true }]

// will only affect elements, which rely on the counter value
state.nested.nested.counter++
```

### Rendering

Basically, you use `e` global function, which stands for "element".

```
e(<element-type>, <text-child>)
e(<element-type>, [<child>])
e(<element-type>, [attributes], <text-child>)
e(<element-type>, [attributes], [<child>])
```

**element-type**  
_string_  
Element type, such as `div` or `span`. Only valid HTML elements are supported.

**attributes**  
_object_  
Object with attributes with the same name as they would appear in html markup.  
For event listeners, add `on` prefix, e.g. `onclick`, `onfocus`.  
Special attributes: `key` and `ref`.

**[child]**  
Array of Elements.  
Element created with `e` function call. Functions, that return `e` of falsy values are considered an Element.

**text-child**  
Special case of **[child]**.  
If you want just to render a text, do so. Under the hood it's wrapped to the `e` function call.

### Reactivity

Each value in the state is reactive, which means changes are tracked and propagate to the elements using them.

Cool part is that changes are tracked precisely, means nesting does not affect the performance.

Reactivity is acheived using wrapping element to a function call (it's pure JavaScript, do you still remember that)?

To tell __E__ that you want the element to be "bond" to the state value, is to wrap it to a function call:

```js
const state = createState({ value: 0, isActive: false })

/* ... */

e('div', [
    // this would render and remove the whole element, based on 'state.isActive' value
    // use any falsy value to return nothing: false, undefined, null, 0, ''
    // if you want to render that values, stringify them explicitely
    () => state.isActive ? e('p', 'Hello') : undefined,
    // this would rerender only content of <p/> element when 'state.value' is changed
    e('p', () => `Counter value: ${value}`),
    // these buttons mutate the state and 'cause corresponding rerenders
    e('button', { onclick: () => state.isActive = !state.isActive }, 'Toggle element'),
    e('button', { onclick: () => state.counter++ }, 'Increment counter'),

    // Examples of misuse

    // this element won't be reactive, and will render only the initial value
    e('div', `Non-reactive value: ${state.value}`),
    // this element would be rendered or not, depending on an initial value, but won't be reactive
    state.isActive ? e('p', 'Hello') : undefined,
])
```

Basically, anything could be wrapped in to a function to become reactive, __besides event listeners__:

```js

const state = createState({
    value: 0,
    isActive: false,
    items: [
        { name: 'item' }
    ]
})

e('div', [
    // type is reactive
    e(() => state.isActive ? 'button' : 'span', 'Button'),
    // whole attributes object is reactive
    e('div', () => isActive ? { class: 'active', tabindex: 0 } : {}, 'Hello'),
    // separate attributes are reactive as well
    e('div', { class: () => `container ${state.isActive ? 'active' : ''}` }, 'Hello'),
    // element text is reactive
    e('div', () => `Value: ${state.value}`),
    // or children
    e('div', () => items.map((item) => (
        e('div', item.name)
    )))
])

```

## Why

To have something in between heavy React, Vue, Angular apps;
purely static or bloated backend generated JS;
manually written JS scripts.

Could be a good companion for Backend web frameworks,
which does not have their own js generation,
or which does have such, but less efficient and more heavy.

---

But, essentially, for education purposes. I wonder if I'm cappable to do so.

If I'll manage to make the first working release, I can say I've reached the target.
If __E__ would be helpful to anyone, for educational purposes or to breath a bit of life to your static apps, I could not be happier.

## Not

Things this project doesn't have:

- SSR  
   I consider adding integration with popular server-side libs, like: RoR, Laravel and other.
   But the whole purpose of this library is to keep javascript scripting in control.

- Modules  
   As it's non-build pure javascript library, it's designed to be plugged in to page right away.
   JavaScript in browser does not support modules fully and it's not convenient to plug in each module by hand.

# Name

Name of this project is fluid, so don't pay much attention.
