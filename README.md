# NthJS - Minimal Modular JavaScript Reactivity Starter Kit Library

NthJS is a lightweight, dependency-free javascript reactivity and reactive dom library. It provides fine-grained reactivity without a build step, making it an minimal alternative to frameworks like Vue or Svelte for smaller projects. It is great companion for PHP projects. It is ~1.4kb minified+gzipped.

## Main Idea
NthJS provides a minimal yet solid base to make your own reactive library according to your needs. Just edit `nthjs.js` file, This is <250 loc. Remove functions/features you don't want or add functions/features you want, such as automatic binding of data attributes etc. 


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

## Complete Example

```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NthJS Demo</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            background: #f4f4f4;
            text-align: center;
        }
        h1 {
            color: #333;
        }
        .container {
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            display: inline-block;
        }
        .counter {
            font-size: 24px;
            margin: 10px 0;
        }
        button {
            padding: 10px 15px;
            margin: 5px;
            font-size: 16px;
            cursor: pointer;
            border: none;
            border-radius: 5px;
            transition: 0.3s;
        }
        button:hover {
            background: #ddd;
        }
        ul {
            list-style: none;
            padding: 0;
        }
        li {
            padding: 8px;
            background: #ddd;
            margin: 5px 0;
            border-radius: 5px;
        }
        .loading {
            color: orange;
        }
        .error {
            color: red;
        }
    </style>
</head>
<body>

    <h1>NthJS Demo</h1>

    <div class="container">

        <!-- Counter -->
        <h2>Counter</h2>
        <div class="counter" id="count">0</div>
        <button id="inc">Increment</button>
        <button id="dec">Decrement</button>

        <!-- Input Binding -->
        <h2>Name Input</h2>
        <input type="text" id="nameInput">
        <p>Hello, <span id="nameDisplay"></span>!</p>

        <!-- Computed Signal -->
        <h2>Sum of Two Numbers</h2>
        <input type="number" id="num1" value="0"> +
        <input type="number" id="num2" value="0">
        <p>Sum: <span id="sum"></span></p>

        <!-- List Rendering -->
        <h2>Dynamic List</h2>
        <button id="addItem">Add Item</button>
        <ul id="list"></ul>

        <!-- Group Binding -->
        <h2>Favorite Color</h2>
        <label><input type="radio" name="color" value="red"> Red</label>
        <label><input type="radio" name="color" value="blue"> Blue</label>
        <label><input type="radio" name="color" value="green"> Green</label>
        <p>Selected Color: <span id="selectedColor"></span></p>

        <h2>Hobbies</h2>
        <label><input type="checkbox" value="Reading"> Reading</label>
        <label><input type="checkbox" value="Gaming"> Gaming</label>
        <label><input type="checkbox" value="Cooking"> Cooking</label>
        <p>Selected Hobbies: <span id="hobbies"></span></p>

        <!-- Async Signal -->
        <h2>Fetch Data</h2>
        <button id="fetchData">Load Data</button>
        <p id="loading" class="loading" style="display: none;">Loading...</p>
        <p id="error" class="error"></p>
        <p id="dataDisplay"></p>

    </div>

    <script src="https://cdn.jsdelivr.net/gh/nabeelalihashmi/nthjs@main/nthjs.min.js"></script>
    <script>
        // Counter
        const count = createSignal(0);
        createBinding(document.getElementById("count"), count);
        document.getElementById("inc").addEventListener("click", () => count.value++);
        document.getElementById("dec").addEventListener("click", () => count.value--);

        // Name Input
        const name = createSignal("User");
        createBinding(document.getElementById("nameInput"), name, "value");
        createBinding(document.getElementById("nameDisplay"), name);

        // Computed Sum
        const num1 = createSignal(0);
        const num2 = createSignal(0);
        const sum = createComputed(() => parseInt(num1.value) + parseInt(num2.value));
        createBinding(document.getElementById("sum"), sum);

        document.getElementById("num1").addEventListener("input", e => num1.value = e.target.value);
        document.getElementById("num2").addEventListener("input", e => num2.value = e.target.value);

        // Dynamic List
        const items = createSignal([]);
        createListBinding(document.getElementById("list"), items, item => {
            const li = document.createElement("li");
            li.textContent = item.text;
            return li;
        });

        document.getElementById("addItem").addEventListener("click", () => {
            items.value = [...items.value, { key: Date.now(), text: "Item " + (items.value.length + 1) }];
        });

        // Group Binding (Radio)
        const selectedColor = createSignal("red");
        createGroupBinding(document.querySelectorAll("input[name=color]"), selectedColor);
        createBinding(document.getElementById("selectedColor"), selectedColor);

        // Group Binding (Checkbox)
        const hobbies = createSignal([]);
        createGroupBinding(document.querySelectorAll("input[type=checkbox]"), hobbies);
        createBinding(document.getElementById("hobbies"), hobbies);

        // Async Signal (Fixed)
        const [dataSignal, fetchData, isLoading, errorSignal] = createAsyncSignal(null, async () => {
            const res = await fetch('https://jsonplaceholder.typicode.com/todos/1');
            if (!res.ok) throw new Error("Failed to fetch data!");
            return res.json();
        });

        createEffect(() => {
            document.getElementById("loading").style.display = isLoading.value ? "block" : "none";
            document.getElementById("error").textContent = errorSignal.value || "";
            document.getElementById("dataDisplay").textContent = dataSignal.value ? 
                `To-Do: ${dataSignal.value.title}` : "";
        });

        document.getElementById("fetchData").addEventListener("click", fetchData);
    </script>

</body>
</html>
```

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
