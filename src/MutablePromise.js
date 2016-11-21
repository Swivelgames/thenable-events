const [ ERROR, SUCCESS, EMPTY_ARG ] = [ 'catch', 'then', 'EMPTY_ARG' ];

const Private = new WeakMap();

const resolve = (val, type) => {
	const priv = Private.get(this);
	const cbs = priv[type];
	priv.value = val;
	priv.valueType = type;
	cbs.forEach(v => v(val));
};

export default class MutablePromise {
	constructor(fn, context = EMPTY_ARG) {
		const priv = {
			resolve: (v) => resolve.call(this, v, SUCCESS),
			reject: (e) => resolve.call(this, e, ERROR),
			unset: () => {
				const priv = Private.get(this);
				priv.value = priv.valueType = void 0;
				priv.unsetters.forEach( v => v() );
			},
			thens: [],
			catches: [],
			unsetters: [],
			valueType: void 0,
			value: void 0
		};

		const { resolve, reject, unset } = priv;

		Private.set(this, priv);

		if(fn instanceof MutablePromise
		|| Promise && Promise.prototype && fn instanceof Promise) {
			fn.then(priv.resolve, priv.reject);
		} else {
			if(context !== EMPTY_ARG) fn.call(context, resolve, reject, unset);
			else fn(resolve, reject, unset);
		}
	}

	then(onFulfilled, onRejected = () => {}) {
		return new Thenable( (res, rej, un) => {
			const { thens, catches, unsetters } = Private.get(this);

			thens.push( (v) => {
				try {
					return res(onFulfilled(v));
				} catch(e) {
					onRejected(e); rej(e);
				}
			});

			catches.push( (v) => {
				try {
					return rej(onRejected(v));
				} catch(e) {
					rej(e);
				}
			});

			unsetters.push( (v) => un() );
		});
	}

	once(onFulfilled, onRejected = () => {}) {
		return new Thenable( (res, rej, un) => {
			const { thens, catches, unsetters } = Private.get(this);

			const thn = (v) => {
				try {
					return res(onFulfilled(v));
				} catch(e) {
					onRejected(e); rej(e);
				} finally {
					const idx = thens.indexOf(thn);
					if(idx > -1) thens.splice(idx,1);
				}
			};

			const ctch = (v) => {
				try {
					return rej(onRejected(v));
				} catch(e) {
					rej(e);
				} finally {
					const idx = catches.indexOf(ctch);
					if(idx > -1) catches.splice(idx,1);
				}
			};

			thens.push(thn);
			catches.push(ctch);
			unsetters.push( (v) => un() );
		});
	}

	catch(cb) { Private.get(this).thens.push(cb) }
}
