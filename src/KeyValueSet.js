const EMPTY_PARAM = 'EMPTY_PARAM';
const kvps = new WeakMap();

export default class KeyValueSet {
	constructor(kvp) {
		kvps.set(this, {});

		Object.defineProperty(this, 'length', {
			enumerable: false,
			configurable: false,
			get: () => Object.keys(kvps.get(this)).length,
			set: (v) => v
		});
	}

	set(key, value) {
		const kvp = kvps.get(this);
		if(!this.has(key, kvp)) kvp[key] = value;
		return value;
	}

	get(key) {
		const kvp = kvps.get(this);
		if(this.has(key, kvp)) return kvp[key];
		return void 0;
	}

	has(key, kvp = kvps.get(this)) {
		return Object.keys(kvp).indexOf(key) > -1
	}

	delete(key) {
		if(!this.has(key)) return true;
		const kvp = kvps.get(this);
		delete kvp[key];
		return true;
	}

	forEach(callback, context = EMPTY_PARAM) {
		const kvp = kvps.get(this);
		Object.keys(kvp).forEach(context === EMPTY_PARAM ? (k) => {
			callback(kvp[k], k, this)
		} : (k) => {
			callback.call(context, kvp[k], k, this)
		});
	}
}
