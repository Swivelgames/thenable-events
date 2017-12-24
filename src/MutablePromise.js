const [ STATE_INITIAL, STATE_REJECTED, STATE_FULFILLED, EMPTY_ARG ] = [ void 0, 'catch', 'then', 'EMPTY_ARG' ];

const Private = new WeakMap();

const required = (method, paramName) => { throw new Error(`MutablePromise.${method}(): missing required parameter: ${paramName}`) }

const isThenable = p => p && typeof p.then === 'function' && typeof p.catch === 'function'

function resolverFunc(val, type) {
	const priv = Private.get(this);
	const cbs = priv[`${type}s`];
	priv.value = val;
	priv.valueType = type;
	cbs.forEach(v => v(val));
};

export default class MutablePromise {
	constructor(fn = () => {}, defaultCatch) {
		const priv = {
			resolve: v => resolverFunc.call(this, v, STATE_FULFILLED),
			reject: e => resolverFunc.call(this, e, STATE_REJECTED),
			unset: () => {
				const priv = Private.get(this);
				priv.value = priv.valueType = STATE_INITIAL;
				priv.unsetters.forEach( v => v() );
			},
			thens: [],
			catchs: [],
			unsetters: [],
			defaultCatch,
			valueType: STATE_INITIAL,
			value: void 0
		};

		if(typeof defaultCatch === 'function') priv.catchs.push(defaultCatch);

		const { resolve, reject, unset } = priv;

		Private.set(this, priv);

		if(isThenable(fn)) {
			fn.then(resolve, reject);
		} else {
			fn(resolve, reject, unset);
		}
	}

	then(onFulfilled, onRejected) {
		if(typeof onFulfilled !== 'function' && typeof onRejected !== 'function') {
			required('then', 'requires either onFulfilled or onRejected');
		}

		if(typeof onFulfilled !== 'function') onFulfilled = () => {};
		if(typeof onRejected !== 'function') onRejected = () => {};

		const { defaultCatch } = Private.get(this);

		return new MutablePromise( (res, rej, un) => {
			const {
				thens,
				catchs,
				unsetters,
				value,
				valueType
			} = Private.get(this);

			const exec = (v, bias) => {
				try {
					const ret = (bias !== rej) ? onFulfilled(v) : onRejected(v);
					if (typeof ret === 'undefined') return bias();
					if (!isThenable(ret)) return res(ret);
					ret.then(v => res(v)).catch(e => rej(e));
				} catch(e) {
					if (bias !== rej) onRejected(e);
					rej(e);
				} finally { once(); }
			};

			const thn = v => exec(v, res);
			const ctch = v => exec(v, rej);

			thens.push( thn );
			catchs.push( ctch );
			unsetters.push( (v) => un() );

			function once() {
				if(onFulfilled.__ONCE) {
					const tidx = thens.indexOf(thn);
					if(tidx > -1) thens.splice(tidx,1);

					const cidx = catchs.indexOf(ctch);
					if(cidx > -1) catchs.splice(cidx,1);

					delete onFulfilled.__ONCE
				}
			}

			if(valueType === STATE_FULFILLED) thn(value);
			else if(valueType === STATE_REJECTED) ctch(value);
		}, defaultCatch);
	}

	once(onFulfilled, onRejected) {
		if(typeof onFulfilled !== 'function' && typeof onRejected !== 'function') {
			required('then', 'requires either onFulfilled or onRejected');
		}

		if(typeof onFulfilled !== 'function') onFulfilled = () => {};
		if(typeof onRejected !== 'function') onRejected = () => {};

		Object.defineProperty(onFulfilled, '__ONCE', {
			configurable: true,
			writable: false,
			enumerable: false,
			value: true
		});

		return this.then(onFulfilled, onRejected);
	}

	catch(onRejected = required('catch', 'onRejected')) {
		return this.then(v => v, onRejected);
	}
}
