const EMPTY_PARAM = 'EMPTY_PARAM';
const kvps = new WeakMap();

const getKeysForNamespace = (key, setInst) => {
	if (!key || !setInst) return [];
	const set = setInst instanceof NamespacedKeyValueSet ? kvps.get(setInst) : setInst;
	const spaces = key.split('.');
	return Object.keys(set).filter(k =>
		key.split('.').slice(0, k.split('.').length).join('.') === k
	);
};

export default class NamespacedKeyValueSet {
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
		if(!this.has(key)) kvp[key] = value;
		return value;
	}

	get(key) {
		const kvp = kvps.get(this);
		if(this.has(key)) return kvp[key];
		return void 0;
	}

	has(key) {
		return Object.keys(kvps.get(this)).indexOf(key) > -1
	}

	delete(key) {
		if(!this.has(key)) return true;
		const kvp = kvps.get(this);
		delete kvp[key];
		return true;
	}

	forEach(callback, context = EMPTY_PARAM, kvp = kvps.get(this)) {
		Object.keys(kvp).forEach(context === EMPTY_PARAM ? (k) => {
			callback(kvp[k], k, this)
		} : (k) => {
			callback.call(context, kvp[k], k, this)
		});
	}

	getLike(key) { return getKeysForNamespace(key, this).reduce((r,k) => ({ ...r, [k]: this.get(k) }), {}); }
	setLike(key, value) { return getKeysForNamespace(key, this).map(k => this.setLike(key, value)), value; }
	hasLike(key) { return getKeysForNamespace(key, this).length > 0; }
	deleteLike(key) { return getKeysForNamespace(key, this).map(k => this.delete(key)), true; }
	forEachLike(key, callback, context) { this.forEach(callback, context, this.getLike(key)); }
}
