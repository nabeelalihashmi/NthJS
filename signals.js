const devtools = {
    logUpdates: true,
    logEffects: true,
    logAsync: true
};

function log(...args) {
    if (devtools.logUpdates) console.log(...args);
}

function createSignal(initialValue) {
    let value = makeReactive(initialValue);
    const subscribers = new Set();
    let scheduled = false;

    function notifySubscribers(oldValue) {
        if (!scheduled) {
            scheduled = true;
            queueMicrotask(() => {
                subscribers.forEach(subscriber => subscriber(value, oldValue));
                scheduled = false;
            });
        }
    }

    const signal = {
        get value() {
            if (currentSubscriber) {
                subscribers.add(currentSubscriber);
            }
            return value;
        },
        set value(newValue) {
            if (Object.is(value, newValue)) return;
            const oldValue = value;
            value = makeReactive(newValue);
            log(`🔄 Signal updated:`, { oldValue, newValue });
            notifySubscribers(oldValue);
        }
    };

    return signal;
}

let currentSubscriber = null;

function createEffect(effect) {
    function wrappedEffect() {
        cleanup(wrappedEffect);
        currentSubscriber = wrappedEffect;
        log(`⚡ Effect executed`);
        effect();
        currentSubscriber = null;
    }
    wrappedEffect();
}

function cleanup(effectFn) {
    for (const signal of trackedSignals) {
        signal.subscribers.delete(effectFn);
    }
    trackedSignals.clear();
}

const trackedSignals = new Set();

function watch(signal, callback) {
    let oldValue = signal.value;
    createEffect(() => {
        const newValue = signal.value;
        if (!Object.is(newValue, oldValue)) {
            log(`👀 Watch triggered:`, { newValue, oldValue });
            callback(newValue, oldValue);
            oldValue = newValue;
        }
    });
}

function createAsyncSignal(initialValue, fetcher) {
    const signal = createSignal(initialValue);
    const loading = createSignal(false);
    const error = createSignal(null);
    let currentRequest = null;

    async function refresh(...args) {
        if (currentRequest) {
            currentRequest.abort?.();
        }
        const controller = new AbortController();
        currentRequest = controller;
        loading.value = true;
        log(`🌐 Fetch started...`);

        try {
            const result = await fetcher(...args, controller.signal);
            signal.value = result;
            error.value = null;
            log(`✅ Fetch success:`, result);
        } catch (err) {
            if (err.name !== "AbortError") {
                error.value = err;
                log(`❌ Fetch error:`, err);
            }
        } finally {
            loading.value = false;
        }
    }

    return [signal, refresh, loading, error];
}

function makeReactive(obj, seen = new WeakMap()) {
    if (typeof obj !== 'object' || obj === null || obj.__isReactive) return obj;
    if (seen.has(obj)) return seen.get(obj);

    const subscribers = new Map(); // Track property-level dependencies
    const proxy = new Proxy(obj, {
        get(target, prop) {
            if (prop === "__isReactive") return true;
            if (currentSubscriber) {
                if (!subscribers.has(prop)) {
                    subscribers.set(prop, new Set());
                }
                subscribers.get(prop).add(currentSubscriber);
            }
            return makeReactive(target[prop], seen);
        },
        set(target, prop, value) {
            if (!Object.is(target[prop], value)) {
                const oldValue = target[prop];
                target[prop] = makeReactive(value, seen);
                log(`📌 Reactive prop changed:`, { prop, oldValue, newValue: value });
                subscribers.get(prop)?.forEach(subscriber => subscriber(target, oldValue));
            }
            return true;
        }
    });

    seen.set(obj, proxy);
    return proxy;
}

function createComputed(computeFn) {
    const signal = createSignal(computeFn());
    createEffect(() => {
        const newValue = computeFn();
        if (!Object.is(signal.value, newValue)) {
            log(`🔢 Computed updated:`, { newValue });
            signal.value = newValue;
        }
    });
    return signal;
}
