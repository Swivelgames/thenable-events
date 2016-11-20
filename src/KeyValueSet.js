import Weakmap from 'weakmap';

const EMPTY_PARAM = 'EMPTY_PARAM';
const kvps = new Weakmap();
const keyExists = (key, kvp) =>

export default class KeyValueSet {
	constructor(kvp) {
		kvps.set(this, {});
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

	forEach(callback, context = EMPTY_PARAM) {
		const kvp = kvps.get(this);
		Object.keys(kvp).forEach(context === EMPTY_PARAM ? (k) => {
			callback(kvp[k], k, this)
		} : (k) => {
			callback.call(context, kvp[k], k, this)
		});
	}
}
