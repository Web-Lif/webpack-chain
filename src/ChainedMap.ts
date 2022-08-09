const merge = require('deepmerge');
const Chainable = require('./Chainable');

class ChainedMap<Parent, Value> extends Chainable<Parent> {

    store: Map<string, Value>

    constructor(parent: Parent) {
        super(parent);
        this.store = new Map<string, Value>();
    }

    extend(methods: string[]) {
        const self: any = this
        self.shorthands = methods;
        methods.forEach((method) => {
            self[method] = (value: any) => self.set(method, value);
        });
        return self;
    }

    clear() {
        this.store.clear();
        return this;
    }

    delete(key: string) {
        this.store.delete(key);
        return this;
    }

    order() {
        const entries = Object.fromEntries(this.store)
        const names = Object.keys(entries);
        const order = [...names];

        names.forEach((name) => {
            if (!entries[name]) {
                return;
            }
            const { __before, __after } = entries[name] as any;
            if (__before && order.includes(__before)) {
                order.splice(order.indexOf(name), 1);
                order.splice(order.indexOf(__before), 0, name);
            } else if (__after && order.includes(__after)) {
                order.splice(order.indexOf(name), 1);
                order.splice(order.indexOf(__after) + 1, 0, name);
            }
        });

        return { entries, order };
    }

    entries() {
        const { entries, order } = this.order();

        if (order.length) {
            return entries;
        }

        return undefined;
    }

    values() {
        const { entries, order } = this.order();

        return order.map((name) => entries[name]);
    }

    get(key: string) {
        return this.store.get(key);
    }

    getOrCompute(key: string, fn: () => Value) {
        if (!this.has(key)) {
            this.set(key, fn());
        }
        return this.get(key);
    }

    has(key: string) {
        return this.store.has(key);
    }

    set(key: string, value: Value) {
        this.store.set(key, value);
        return this;
    }

    merge(obj: { [key: string]: Value }, omit: string[] = []) {
        Object.keys(obj).forEach((key) => {
            if (omit.includes(key)) {
                return;
            }

            const value = obj[key];

            if (
                (!Array.isArray(value) && typeof value !== 'object') ||
                value === null ||
                !this.has(key)
            ) {
                this.set(key, value);
            } else {
                this.set(key, merge(this.get(key), value));
            }
        });

        return this;
    }

    clean(obj: any) {
        return Object.keys(obj).reduce((acc: any, key: string) => {
            const value = obj[key];

            if (value === undefined) {
                return acc;
            }

            if (Array.isArray(value) && !value.length) {
                return acc;
            }

            if (
                Object.prototype.toString.call(value) === '[object Object]' &&
                !Object.keys(value).length
            ) {
                return acc;
            }
            acc[key] = value;
            return acc;
        }, {});
    }

    when(
        condition: boolean,
        whenTruthy = Function.prototype,
        whenFalsy = Function.prototype,
    ) {
        if (condition) {
            whenTruthy(this);
        } else {
            whenFalsy(this);
        }
        return this;
    }
}
module.exports = ChainedMap;
