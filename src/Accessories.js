import MutablePromise from './MutablePromise.js';

export default class PromiseAccessory {
	constructor(...args) {
		this.__thenable = new MutablePromise(...args);
	}

	then(...args) { return this.__thenable.then(...args); }
	catch(...args) { return this.__thenable.catch(...args); }

	once() { return this.only(1); }

	only(i) {
		const promise = this.__thenable;

		var thenCounter = 0,
			catchCounter = 0;

		const then = (onResolve, onReject) => {
			function thenFn(...args) {
				thenCounter++;
				if(thenCounter >= i) promise.unlisten(thenFn, 'then');
				return onResolve(...args);
			};

			function catchFn(...args) {
				catchCounter++;
				if(catchCounter >= i) promise.unlisten(catchFn, 'catch');
				return onReject(...args);
			};

			return promise.then(
				onResolve instanceof Function ? thenFn : void 0,
				onReject instanceof Function ? catchFn : void 0
			);
		};

		return {
			then,
			catch: (onReject) => then(void 0, onReject),
		};
	}

	onlyIf(testFn) {
		const promise = this.__thenable;

		const then = (onResolve, onReject) => {
			const thenFn = (v) => testFn(v) ? onResolve(v) : v;
			const catchFn = (v) => testFn(v) ? onReject(v) : v;

			return promise.then(
				onResolve instanceof Function ? thenFn : void 0,
				onReject instanceof Function ? catchFn : void 0
			);
		};

		return {
			then,
			catch: (onReject) => then(void 0, onReject),
		};
	}
}
