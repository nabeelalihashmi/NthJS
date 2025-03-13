# NthJS - Minimal JavaScript Reactivity Library

NthJS is a lightweight, dependency-free javascript reactivity and reactive dom library. It provides fine-grained reactivity without a build step, making it an minimal alternative to frameworks like Vue or Svelte for smaller projects. It is great companion for PHP projects. It is ~1.4kb minified+gzipped.

## Motivation for NthJS
I needed simple reactivity many time in frontend, but didn’t want the overhead of a build step. Neither I wanted to use Vue or other those have many features I never needed. I wanted something lightweight, yet powerful - something that took inspiration from Vue and Svelte, including features like watchers and group bindings, without unnecessary bloat. That’s why nthJS is born. It’s minimal, modular, and designed to keep reactivity purely in JavaScript, avoiding extra markup in the DOM. While it focuses on a JS-first approach, it can be easily extended to support data-attribute-based bindings if needed.

## Features
- **Signals & Effects**: Reactive state with automatic dependency tracking.
- **Computed Values**: Derived state that updates when dependencies change.
- **Watchers**: Listen for state changes and trigger callbacks.
- **DOM Bindings**: Bind state to the DOM with `createBinding`, `createListBinding`, and `createGroupBinding`.
- **Async Support**: Fetch data reactively with `createAsyncSignal`.

## Installation
Simply include the `nthjs.js` file in your project via cdn.

```
<script src="https://cdn.jsdelivr.net/gh/nabeelalihashmi/nthjs@main/nthjs.min.js"></script>
```

or download and use.

## API Documentation

### `createSignal(initialValue)`
Creates a reactive signal.

#### Parameters:
- `initialValue`: Any value (primitive or object).

#### Returns:
A signal object with:
- `.value`: **Getter & setter** for the reactive state.

#### Usage:
```js
const count = createSignal(0);
console.log(count.value); // 0

count.value = 5;
console.log(count.value); // 5
```

---

### `createEffect(effectFn)`
Runs an effect whenever its dependencies change.

#### Parameters:
- `effectFn`: A function that depends on reactive signals.

#### Usage:
```js
const count = createSignal(0);

createEffect(() => {
    console.log("Count changed:", count.value);
});

count.value = 10; // Logs "Count changed: 10"
```

---

### `createComputed(computeFn)`
Creates a computed value that updates when dependencies change.

#### Parameters:
- `computeFn`: A function returning a derived value.

#### Returns:
A signal containing the computed value.

#### Usage:
```js
const a = createSignal(2);
const b = createSignal(3);

const sum = createComputed(() => a.value + b.value);

console.log(sum.value); // 5

a.value = 10;
console.log(sum.value); // 13
```

---

### `watch(signal, callback)`
Watches a signal and executes a callback when its value changes.

#### Parameters:
- `signal`: The signal to watch.
- `callback`: Function `(newValue, oldValue) => {}`.

#### Usage:
```js
const name = createSignal("Alice");

watch(name, (newVal, oldVal) => {
    console.log(`Name changed from ${oldVal} to ${newVal}`);
});

name.value = "Bob"; // Logs: "Name changed from Alice to Bob"
```

---

### `createBinding(element, signal, attribute?)`
Binds a signal to a DOM element.

#### Parameters:
- `element`: The target DOM element.
- `signal`: The reactive signal.
- `attribute?`: Optional attribute to bind.

#### Usage:
```js
const title = createSignal("Hello");

const h1 = document.querySelector("h1");
createBinding(h1, title); // Updates text content

const input = document.querySelector("input");
createBinding(input, title, "value"); // Two-way binding
```

---

### `createListBinding(container, signal, renderItem)`
Binds a signal array to a container element, rendering child elements.

#### Parameters:
- `container`: Parent element.
- `signal`: Reactive array signal.
- `renderItem`: Function `(item) => HTMLElement`.

#### Usage:
```js
const items = createSignal([{ key: "1", text: "Item 1" }]);

const ul = document.querySelector("ul");
createListBinding(ul, items, (item) => {
    const li = document.createElement("li");
    li.textContent = item.text;
    return li;
});

items.value = [...items.value, { key: "2", text: "Item 2" }];
```

---

### `createGroupBinding(elements, signal)`
Binds a group of radio buttons or checkboxes to a signal.

#### Parameters:
- `elements`: Array of input elements.
- `signal`: Reactive signal.

#### Usage:
**For radio buttons:**
```js
const selected = createSignal("option1");
const radios = document.querySelectorAll("input[type=radio]");

createGroupBinding(radios, selected);
```

**For checkboxes:**
```js
const selectedValues = createSignal(["a"]);

const checkboxes = document.querySelectorAll("input[type=checkbox]");
createGroupBinding(checkboxes, selectedValues);
```

---

## Async Support

### `createAsyncSignal(initialValue, fetcher)`
Creates a reactive signal that updates from an async function.

#### Parameters:
- `initialValue`: Default value.
- `fetcher`: Async function `(signal) => Promise<data>`.

#### Usage:
```js
const [data, fetchData, loading, error] = createAsyncSignal(null, async () => {
    const response = await fetch("https://api.example.com/data");
    return response.json();
});

createEffect(() => {
    if (loading.value) console.log("Loading...");
    if (data.value) console.log("Data loaded:", data.value);
    if (error.value) console.log("Error:", error.value);
});

// Trigger fetch
fetchData();
```

---

## Why Use NthJS?
- **No build step**: Works directly in the browser.
- **Tiny & fast**: Minimal overhead, designed for simplicity.
- **Fine-grained reactivity**: Updates only the necessary parts of the DOM.

---

## License
MIT
