import { expect } from 'chai';
import Dispatcher from '../index.js';

const RESOLVED_BEFORE = 'RESOLVED_BEFORE';
const RESOLVED_AFTER = 'RESOLVED_AFTER';
const REJECTED = 'REJECTED';

const Disp = new Dispatcher(void 0, void 0, () => {});

describe('Dispatcher', () => {
	describe('.when()', () => {
		it('should throw an error if there are too many parameters', () => {
			try {
				Disp.when(EVENT_NAME, () => {});
			} catch(e) { return; }
			throw new Error('NO ERROR THROWN');
		});

		describe('.then( onFulfilled, onRejected )', () => {
			const VAL_A = 'VAL_A';
			const VAL_B = 'VAL_B';
			const VAL_C = 'VAL_C';
			const VAL_D = 'VAL_D';

			const resolutionThen = [];
			const resolutionCatch = [];
			const naturalPromises = [];
			const resolvedVals = [];

			const EVENT_NAME = 'traditional_thenable-like';

			Disp.resolve(EVENT_NAME, RESOLVED_BEFORE);

			Disp.when(EVENT_NAME).then(
				(v) => { resolutionThen.push(v); },
				(v) => { resolutionCatch.push(v); }
			).then(
				() => Promise.resolve('NATURAL')
			).then(
				v => naturalPromises.push(v)
			)

			Disp.resolve(EVENT_NAME, RESOLVED_AFTER);

			Disp.when(EVENT_NAME)
				.then(() => { return VAL_A; })
				.then((v) => { resolvedVals.push(v); return VAL_B; })
				.then((v) => { resolvedVals.push(v); return VAL_C; })
				.then((v) => { resolvedVals.push(v); return VAL_D; })
				.then((v) => { resolvedVals.push(v); })

			Disp.reject(EVENT_NAME, REJECTED);

			Disp.when(EVENT_NAME).then(void 0, (v) => { resolutionCatch.push(v); });

			it('should execute `onFulfilled` once if already resolved and once for every subsequent resolve', () => {
				expect(resolutionThen).to.have.length(2);
				expect(resolutionThen[0]).to.equal(RESOLVED_BEFORE);
				expect(resolutionThen[1]).to.equal(RESOLVED_AFTER);
			});

			it('should execute `onRejected` once if thenable is already rejected and once for every subsequent reject', () => {
				expect(resolutionCatch).to.have.length(2);
				expect(resolutionCatch[0]).to.equal(REJECTED);
				expect(resolutionCatch[1]).to.equal(REJECTED);
			});

			it('should accept other promises as return values for `thens`', () => {
				expect(naturalPromises).to.have.length(2);
				expect(naturalPromises[0]).to.equal('NATURAL');
				expect(naturalPromises[1]).to.equal('NATURAL');
			});

			it('should return properly chainable `thenables`', () => {
				expect(resolvedVals).to.have.length(4);
				expect(resolvedVals[0]).to.equal(VAL_A);
				expect(resolvedVals[3]).to.equal(VAL_D);
			});

			it('should throw an error if there are missing parameters', () => {
				try {
					Disp.when(EVENT_NAME).catch();
				} catch(e) { return; }
				throw new Error('NO ERROR THROWN');
			});

			describe('.catch()', () => {
				const resolutionCatch = [];
				const resolutionThen = [];

				const EVENT_NAME = 'rejected_by_error_in_then';

				Disp.resolve(EVENT_NAME, RESOLVED_BEFORE);
				Disp.when(EVENT_NAME)
					.then(
						(v) => { throw REJECTED; },
						(e) => { resolutionCatch.push(e); }
					)
					.catch((e) => { resolutionCatch.push(e); });

				it('should catch when a thenable is rejected within a then', () => {
					expect(resolutionCatch[0]).to.equal(REJECTED);
					expect(resolutionCatch[1]).to.equal(REJECTED);
				});

				it('should only fulfill catches', () => {
					expect(resolutionCatch).to.have.length(2);
					expect(resolutionThen).to.have.length(0);
				});
			});
		});

		describe('.once( onFulfilled )', () => {
			const resolutionsFirst = [];
			const resolutionsSecond = [];

			const EVENT_NAME = 'watch_fulfilled_only_once';

			Disp.resolve(EVENT_NAME, RESOLVED_BEFORE);
			Disp.when(EVENT_NAME).once((v) => { resolutionsFirst.push(v); });
			Disp.resolve(EVENT_NAME, RESOLVED_AFTER);
			Disp.when(EVENT_NAME).once((v) => { resolutionsSecond.push(v); });

			it('should only fulfill once', () => {
				expect(resolutionsFirst).to.have.length(1);
				expect(resolutionsSecond).to.have.length(1);
			});

			it('should fulfill when thenable is already resolved', () => {
				expect(resolutionsFirst[0]).to.equal(RESOLVED_BEFORE);
			});

			it('should fulfill when a thenable is resolved later', () => {
				expect(resolutionsSecond[0]).to.equal(RESOLVED_AFTER);
			});

			it('should throw an error if there are missing parameters', () => {
				try {
					Disp.when(EVENT_NAME).once();
				} catch(e) { return; }
				throw new Error('NO ERROR THROWN');
			});
		});

		describe('.catch()', () => {
			const resolutionCatch = [];
			const resolutionThen = [];
			const resolutionRecover = [];

			const EVENT_NAME = 'rejected_event';

			Disp.when(EVENT_NAME)
				.catch((v) => { resolutionCatch.push(v); return true; })
				.then((v) => { resolutionRecover.push(v); });
			Disp.when(EVENT_NAME).then((v) => { resolutionThen.push(v); });
			Disp.reject(EVENT_NAME, REJECTED);

			it('should catch when a thenable is already rejected', () => {
				expect(resolutionCatch[0]).to.equal(REJECTED);
			});

			it('should recover if catch returns a value', () => {
				expect(resolutionRecover).to.have.length(1);
				expect(resolutionRecover[0]).to.equal(true);
			});

			it('should only fulfill catches', () => {
				expect(resolutionCatch).to.have.length(1);
				expect(resolutionThen).to.have.length(0);
			});

			it('should throw an error if there are missing parameters', () => {
				try {
					Disp.when(EVENT_NAME).catch();
				} catch(e) { return; }
				throw new Error('NO ERROR THROWN');
			});
		});
	});

	describe('.resolve', () => {
		const resolutionThen = [];
		const illegalResolutions = [];

		const EVENT_NAMES = 'foo.bar.baz.quux'.split('.');
		const LEN = EVENT_NAMES.length;

		for(let i=0; i<LEN; i++) {
			Disp.when(`${EVENT_NAMES.slice(0,i+1).join('.')}.*`)
				.then((v) => { resolutionThen.push(v); });
			Disp.when(`${EVENT_NAMES.slice(0,i+1).join('.')}`)
				.then((v) => { illegalResolutions.push(v); });
		}

		Disp.resolve(EVENT_NAMES.slice(0,LEN-1).join('.'), RESOLVED_AFTER);

		it(`should resolve all ${LEN-1} thens including those in lower namespaces, excluding those in higher namespaces`, () => {
			expect(resolutionThen).to.have.length(LEN-1);
			expect(resolutionThen[0]).to.equal(RESOLVED_AFTER);
			expect(resolutionThen[LEN-2]).to.equal(RESOLVED_AFTER);
		});

		it(`should not resolve absolute thens in lower namespaces`, () => {
			expect(illegalResolutions).to.have.length(1);
			expect(illegalResolutions[0]).to.equal(RESOLVED_AFTER);
		});
	});

	describe('.reject', () => {
		const resolutionThen = [];
		const illegalResolutionsCatch = [];

		const EVENT_NAMES = 'foo.bar.baz.quux'.split('.');
		const LEN = EVENT_NAMES.length;

		for(let i=0;i<LEN;i++) {
			Disp.when(`${EVENT_NAMES.slice(0,i+1).join('.')}.*`)
				.catch((v) => { resolutionThen.push(v); });
			Disp.when(`${EVENT_NAMES.slice(0,i+1).join('.')}`)
				.catch((v) => { illegalResolutionsCatch.push(v); });
		}

		Disp.reject(EVENT_NAMES.slice(0,LEN-1).join('.'), REJECTED);

		it(`should reject all ${LEN-1} catchs including those in lower namespaces, excluding those in higher namespaces`, () => {
			expect(resolutionThen).to.have.length(LEN-1);
			expect(resolutionThen[0]).to.equal(REJECTED);
			expect(resolutionThen[LEN-2]).to.equal(REJECTED);
		});

		it(`should not reject absolute catchs in lower namespaces`, () => {
			expect(illegalResolutionsCatch).to.have.length(1);
			expect(illegalResolutionsCatch[0]).to.equal(REJECTED);
		});
	});
});
