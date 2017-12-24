import MutableThenable from './MutableThenable';
import NamespacedKeyValueSet from './NamespacedKeyValueSet';

const UNKNOWN_ERROR = 'An Unknown Error Occurred';

const Private = new WeakMap();

export default class Dispatcher {
	constructor(thenableEngine, Logger, defaultCatch) {
		if(Logger && Logger.attach) Logger.attach(this, 'dispatcher');

		Private.set(this, {
			defaultCatch,
			engine: thenableEngine || MutableThenable,
			thenables: new NamespacedKeyValueSet(),
			resolvers: new NamespacedKeyValueSet()
		});
	}

	when(eventName, invalidFunc) {
		if(invalidFunc !== void 0) {
			throw new TypeError('when: Only one parameter is allowed. Did you mean to write .when().then()?');
		}
		this.log(`when(${eventName})`, this.LOG_LOUD);
		return this.getThenable(eventName);
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

	getThenable(eventName, ifNotCreate = true) {
		const { thenables } = Private.get(this);
		this.log(`getThenable(${eventName}, ${ifNotCreate})`, this.LOG_DEBUG);
		if(thenables.has(eventName)) return thenables.get(eventName);
		else if(ifNotCreate === true) return this.createThenableFor(eventName);
		else return false;
	}

	getResolver(eventName) {
		this.log(`getResolver(${eventName})`, this.LOG_DEBUG);
		const { resolvers } = Private.get(this);
		if(!resolvers.hasLike(eventName)) this.createThenableFor(eventName);
		return resolvers.getLike(eventName);
	}

	forEachResolver(eventName, fn) {
		this.log(`forEachResolver(${eventName}, ${fn ? 'fn': 'undefined'})`, this.LOG_DEBUG);
		const { resolvers } = Private.get(this);
		if(!resolvers.hasLike(eventName)) this.createThenableFor(eventName);
		return resolvers.forEachLike(eventName, fn);
	}

	createThenableFor(eventName) {
		this.log(`createThenableFor(${eventName}) **`, this.LOG_DEBUG);
		const { thenables, engine, resolvers, defaultCatch } = Private.get(this);
		return thenables.set(eventName,
			new engine(
				(resolve, reject, unresolve) => {
					resolvers.set(eventName, {
						"resolve": resolve,
						"reject": reject,
						"unresolve": unresolve
					});
				}, defaultCatch || ((e) => {
					const msg = `UnhandledThenableRejectionWarning${"\n"}${e ? e.stack || e.message || e || UNKNOWN_ERROR : UNKNOWN_ERROR}`;
					this.log(['ERROR',msg]);
					throw new Error(msg);
				})
			)
		);
	}

	log() { return; }
}
