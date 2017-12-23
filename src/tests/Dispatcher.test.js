import { expect } from 'chai';
import Dispatcher from '../Dispatcher';

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
			const resolutionThen = [];
			const resolutionCatch = [];
			const EVENT_NAME = 'traditional_promise-like';
			Disp.resolve(EVENT_NAME, RESOLVED_BEFORE);
			Disp.when(EVENT_NAME).then(
				(v) => { resolutionThen.push(v); },
				(v) => { resolutionCatch.push(v); }
			);
			Disp.resolve(EVENT_NAME, RESOLVED_AFTER);
			Disp.reject(EVENT_NAME, REJECTED);
			Disp.when(EVENT_NAME).then(void 0, (v) => { resolutionCatch.push(v); });

			it('should execute `onFulfilled` once if already resolved and once for every subsequent resolve', () => {
				expect(resolutionThen).to.have.length(2);
				expect(resolutionThen[0]).to.equal(RESOLVED_BEFORE);
				expect(resolutionThen[1]).to.equal(RESOLVED_AFTER);
			});

			it('should execute `onRejected` once if promise is already rejected and once for every subsequent reject', () => {
				expect(resolutionCatch).to.have.length(2);
				expect(resolutionCatch[0]).to.equal(REJECTED);
				expect(resolutionCatch[1]).to.equal(REJECTED);
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

				it('should catch when a promise is rejected within a then', () => {
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

			it('should fulfill when promise is already resolved', () => {
				expect(resolutionsFirst[0]).to.equal(RESOLVED_BEFORE);
			});

			it('should fulfill when a promise is resolved later', () => {
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

			it('should catch when a promise is already rejected', () => {
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
});
