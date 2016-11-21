import LivingPromise from './LivingPromise';
import KeyValueSet from './KeyValueSet';

const Private = new WeakMap();

export default class Dispatcher {
	constructor(promiseEngine, Logger) {
		if(Logger && Logger.attach) Logger.attach(this, 'dispatcher');

		Private.set(this, {
			engine: promiseEngine || LivingPromise,
			promises: new KeyValueSet(),
			resolvers: new KeyValueSet()
		});
	}

	when(eventName) {
		this.log(`when(${eventName})`, this.LOG_LOUD);
		return this.getPromise(eventName);
	}

	resolve(eventName, val) {
		this.log(`resolve(${eventName})`, this.LOG_LOUD);
		this.getResolver(eventName).resolve(val);
	}

	reject(eventName, val) {
		this.log(`reject(${eventName})`, this.LOG_LOUD);
		this.getResolver(eventName).reject(val);
	}

	unresolve(eventName) {
		this.log(`unresolve(${eventName})`, this.LOG_LOUD);
		let ur = this.getResolver(eventName).unresolve;
		if(ur && typeof ur === "function") ur();
	}

	getPromise(eventName, ifNotCreate = true) {
		const { promises } = Private.get(this);
		//this.log(`getPromise(${eventName}, ${ifNotCreate})`, this.LOG_DEBUG);
		if(promises.has(eventName)) return promises.get(eventName);
		else if(ifNotCreate === true) return this.createPromiseFor(eventName);
		else return false;
	}

	getResolver(eventName) {
		//this.log(`getResolver(${eventName})`, this.LOG_DEBUG);
		const { resolvers } = Private.get(this);
		if(!resolvers.has(eventName)) this.createPromiseFor(eventName);
		return resolvers.get(eventName);
	}

	createPromiseFor(eventName) {
		//this.log(`createPromiseFor(${eventName}) **`, this.LOG_DEBUG);
		const data = Private.get(this);
		return data.promises.set(eventName, new (data.engine)( (resolve, reject, unresolve) => {
			data.resolvers.set(eventName, {
				"resolve": resolve,
				"reject": reject,
				"unresolve": unresolve
			});
		}, (e) => this.log(['ERROR',e.stack])));
	}

	log() { return; }
}
