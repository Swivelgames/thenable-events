import Dispatcher from 'thenable-events';

(typeof window === "undefined" ? global : window).Dispatcher = Dispatcher;

const Disp = new Dispatcher();

// .then( onFulfilled, onRejected )
Disp.resolve('traditional_promise-like', 'traditional_promise-like: resolved before `then`');
Disp.when('traditional_promise-like').then( (v) => console.log(v) );
Disp.resolve('traditional_promise-like', 'traditional_promise-like: resolved after `then`');

// .once( onFulfilled, onRejected )
Disp.when('watch_fulfilled_only_once').once( (v) => console.log(v) );
Disp.resolve('watch_fulfilled_only_once', 'watch_fulfilled_only_once');

// .once( onFulfilled, onRejected )
Disp.when('watch_fulfilled_only_once').once( (v) => console.log(`${v}-previously_resolved`) );

// .catch( onRejected )
Disp.when('rejected_event').catch( (v) => console.error(v) );
try {
	throw new Error('rejected_event');
} catch(e) {
	Disp.reject('rejected_event', e);
}

// .then( onFulfilled, onRejected )
Disp.resolve('rejected_by_error_in_then', 'rejected_by_error_in_then: resolved before `then`');
Disp.when('rejected_by_error_in_then')
	.then( (v) => { throw new Error(v) }, (e) => console.error(e) )
	.catch((e) => console.error(e));
Disp.resolve('rejected_by_error_in_then', 'rejected_by_error_in_then: resolved after `then`');

// Missing Params
try {
	Disp.resolve('missing_then_params', 'missing_then_params: resolved before `then`');
	Disp.when('missing_then_params').then();
} catch(e) { console.error(e); }

try {
	Disp.resolve('missing_once_params', 'missing_once_params: resolved before `then`');
	Disp.when('missing_once_params').once();
} catch(e) { console.error(e); }

try {
	Disp.resolve('missing_catch_params', 'missing_catch_params: resolved before `then`');
	Disp.when('missing_catch_params').catch();
} catch(e) { console.error(e); }
