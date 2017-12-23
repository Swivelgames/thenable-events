import { expect } from 'chai';
import Dispatcher from '../Dispatcher';

const RESOLVED_BEFORE = 'RESOLVED_BEFORE';
const RESOLVED_AFTER = 'RESOLVED_AFTER';

const Disp = new Dispatcher();

describe('Dispatcher', () => {
	describe('#when()', () => {
		const EVENT_NAME = 'traditional_promise-like';
		Disp.resolve(EVENT_NAME, RESOLVED_BEFORE);
		describe('#then( onFulfilled )', () => {
			const resolutions = [];
			Disp.when(EVENT_NAME).then((v) => { resolutions.push(v); });
			Disp.resolve(EVENT_NAME, RESOLVED_AFTER);

			it('should only fulfill twice', () => {
				expect(resolutions).to.have.length(2);
			});

			it('should fulfill when promise is already resolved', () => {
				expect(resolutions[0]).to.equal(RESOLVED_BEFORE);
			});

			it('should fulfill when promise a second time', () => {
				expect(resolutions[1]).to.equal(RESOLVED_AFTER);
			});
		});
	});
});
