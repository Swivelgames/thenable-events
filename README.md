# `thenable-events` v2
Powerful event-based system that introduces thenable objects to enable promise-like event handling

#### Version 2 is here!
* Improved compatibility with `thenable` definition in Promises/A+ spec
* Introduction of Namespaced events
* *Contributors: Introduction of proper `mocha` and `chai` tests*

## Powerful Features

* Dispatch events
* Handle success and error events using promise-like syntax
* Implements `thenables` compatible with Promises/A+ spec
* Namespaced events work out of the box

# Quick Start

Install:
```shell
$ yarn add thenable-events
```

Use:
```javascript
import Dispatcher from 'thenable-events';
const EventDispatcher = new Dispatcher();
EventDispatcher.when('eventName').then(val => console.log(val));
EventDispatcher.resolve('eventName', 'Foobar!');
// Console> 'Foobar!'
```

## Usage Examples

### Dispatching Events

Traditional event-based systems combine the antiquated `callback` structure in order to handle events:

```javascript
myObservable.on('eventName', () => console.log('Foobar!'));
```

While `thenable-events` employs a promise-like structure that is compatible with Promises/A+ implementations:

```javascript
import Dispatcher from 'thenable-events';
const EventDispatcher = new Dispatcher();
EventDispatcher.when('eventName').then(() => console.log('Foobar!'));
```

### Handling API Responses

Because of these improvements, we can use the power of chaining in a promise-like structure with event-based syntax where ***the chain is resolved every time an event is fired***.

Here's an example using `axios` for an API call:

```javascript
import axios from 'axios';
import Dispatcher from 'thenable-events';

const EventDispatcher = new Dispatcher();

const getData = () =>
	axios.get('/svcs/myendpoint').then(
		(res) => {
			EventDispatcher.resolve('api.myendpoint', res.body);
			return res;
		},
		(err) => {
			EventDispatcher.reject('api.myendpoint', err);
			throw err;
		}
	);

// ...

EventDispatcher.when('api.myendpoint')
	.then(body => JSON.parse(body))
	.then(json => console.log({ json }))
	.catch(err => console.error(err));
```

### Support for Namespaced Event-Names

Support for namespaced event-names works out of the box, enabling handling of a wide-range of events within a single line:

```javascript
const getData = () =>
	// ...
		EventDispatcher.reject('api.myendpoint', err);
	// ...

// Catches all rejected events under 'api.myendpoint.*'
EventDispatcher.when('api.*')
	.catch(err => {
		console.error('Catch-all for All API Errors', err);
	});
```

## Concepts

With the promises becoming more ubiquitous due to their powerful structure, `thenable-events` employs `thenable` objects (as defined in Promises/A+) with interfaces very similar to Promises.

### Promises/A+ Compatibility

The power of `thenable-events` is the similarity in the way that the `then` interface is implemented. The interface is entirely compatible with traditional Promise/A+ implementations. However, the real power comes from the ability to use promise-like syntax (thenable) within an event-based structure.

So what are the true differences?

It's quite simple, really:

* `thenable-events` resolves each `then` chain every time an event is `resolved` or `rejected`

This is the only limitation with Promises being assimilated in a proper event-based architecture without the need for callbacks.

This issue is solved with `thenable-events`:

#### Old versus New

**Old**
```javascript
myObservable.on('api.myendpoint', (data) => {
	let json;
	try {
		json = JSON.parse(data);
	} catch(e) {
		console.error(err);
		return;
	}
	console.log({ json });
});
```

**New**
```javascript
EventDispatcher.when('api.myendpoint')
    .then(body => JSON.parse(body))
    .then(json => console.log({ json }))
    .catch(err => console.error(err));
```
