module.exports = class Chainable<Parent> {
    parent: Parent
    constructor(parent: Parent) {
        this.parent = parent;
    }

    batch(handler: (self: typeof this) => void) {
        handler(this);
        return this;
    }

    end() {
        return this.parent;
    }
}
