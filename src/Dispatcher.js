import MutablePromise from './MutablePromise';
import NamespacedKeyValueSet from './NamespacedKeyValueSet';

const Private = new WeakMap();

export default class Dispatcher {
	constructor(promiseEngine, Logger, defaultCatch) {
		if(Logger && Logger.attach) Logger.attach(this, 'dispatcher');

		Private.set(this, {
			defaultCatch,
			engine: promiseEngine || MutablePromise,
			promises: new NamespacedKeyValueSet(),
			resolvers: new NamespacedKeyValueSet()
		});
	}

	when(eventName, invalidFunc) {
		if(invalidFunc !== void 0) {
			throw new TypeError('when: Only one parameter is allowed. Did you mean to write .when().then()?');
		}
		this.log(`when(${eventName})`, this.LOG_LOUD);
		return this.getPromise(eventName);
	}

	resolve(eventName, val) {
		this.log(`resolve(${eventName})`, this.LOG_LOUD);
		this.forEachResolver(eventName, p => p.resolve(val));
	}

	reject(eventName, val) {
		this.log(`reject(${eventName})`, this.LOG_LOUD);
		this.forEachResolver(eventName, p => p.reject(val));
	}

	unresolve(eventName) {
		this.log(`unresolve(${eventName})`, this.LOG_LOUD);
		this.getResolver(eventName).filter(
			p => typeof p.unresolve === 'function'
		).forEach(p => p.unresolve());
	}

	getPromise(eventName, ifNotCreate = true) {
		const { promises } = Private.get(this);
		this.log(`getPromise(${eventName}, ${ifNotCreate})`, this.LOG_DEBUG);
		if(promises.has(eventName)) return promises.get(eventName);
		else if(ifNotCreate === true) return this.createPromiseFor(eventName);
		else return false;
	}

	getResolver(eventName) {
		this.log(`getResolver(${eventName})`, this.LOG_DEBUG);
		const { resolvers } = Private.get(this);
		if(!resolvers.hasLike(eventName)) this.createPromiseFor(eventName);
		return resolvers.getLike(eventName);
	}

	forEachResolvers(eventName, fn) {
		this.log(`forEachResolvers(${eventName}, ${fn ? 'fn': 'undefined'})`, this.LOG_DEBUG);
		const { resolvers } = Private.get(this);
		if(!resolvers.hasLike(eventName)) this.createPromiseFor(eventName);
		return resolvers.forEachLike(eventName, fn);
	}

	createPromiseFor(eventName) {
		this.log(`createPromiseFor(${eventName}) **`, this.LOG_DEBUG);
		const { promises, engine, resolvers, defaultCatch } = Private.get(this);
		return promises.set(eventName,
			new engine(
				(resolve, reject, unresolve) => {
					resolvers.set(eventName, {
						"resolve": resolve,
						"reject": reject,
						"unresolve": unresolve
					});
				}, defaultCatch || (
					(e) => this.log(['ERROR',
						e ?
							e.stack || e.message || e
						:
							'An Unknown Error Occurred'
					])
				)
			)
		);
	}

	log() { return; }
}
