function createBinding(element, signal, attribute) {
    if (!attribute) {
        createEffect(() => element.textContent = signal.value);
    } else if (attribute === 'value') {
        element.value = signal.value;
        element.addEventListener('input', () => signal.value = element.value);
        createEffect(() => element.value = signal.value);
    } else if (attribute === 'class') {
        createEffect(() => {
            element.className = Array.isArray(signal.value) ? signal.value.join(' ') : signal.value;
        });
    } else if (attribute === 'visible') {
        createEffect(() => element.style.display = signal.value ? '' : 'none');
    } else if (attribute === 'style') {
        createEffect(() => {
            Object.entries(signal.value).forEach(([prop, val]) => {
                element.style[prop] = val;
            });
        });
    } else {
        createEffect(() => {
            if (typeof signal.value === 'boolean') {
                signal.value ? element.setAttribute(attribute, '') : element.removeAttribute(attribute);
            } else {
                element.setAttribute(attribute, signal.value);
            }
        });
    }
}

// ✅ FIXED bindList to update items without losing state
function createListBinding(element, signal, renderItem) {
    createEffect(() => {
        const newItems = signal.value;
        const existingItems = Array.from(element.children);
        
        // Map to track existing elements
        const itemMap = new Map();
        existingItems.forEach(el => itemMap.set(el.dataset.key, el));

        newItems.forEach(item => {
            let child = itemMap.get(item.key);
            if (!child) {
                child = renderItem(item);
                child.dataset.key = item.key;
                element.appendChild(child);
            }
        });

        // Remove extra items
        existingItems.forEach(el => {
            if (!newItems.some(item => item.key === el.dataset.key)) {
                element.removeChild(el);
            }
        });
    });
}

// ✅ Added bindGroup for checkboxes & radios
function createGroupBinding(elements, signal) {
    if (!elements || elements.length === 0) return;
    
    const type = elements[0].type;
    
    if (type === "radio") {
        elements.forEach(el => {
            el.addEventListener("change", () => {
                if (el.checked) signal.value = el.value;
            });

            createEffect(() => el.checked = signal.value === el.value);
        });
    } else if (type === "checkbox") {
        createEffect(() => {
            elements.forEach(el => {
                el.checked = signal.value.includes(el.value);
            });
        });

        elements.forEach(el => {
            el.addEventListener("change", () => {
                const updatedValues = new Set(signal.value);
                el.checked ? updatedValues.add(el.value) : updatedValues.delete(el.value);
                signal.value = Array.from(updatedValues);
            });
        });
    }
}
