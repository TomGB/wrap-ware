# Wrap Ware

A middleware wrapper which works with promises / async

Wrap the core function using `wrap(core)`, then add middlewares using `add(middleware)`.

`const handler = wrap(core).add(middleware2).add(middleware1)`

The middlewares will execute the `before` function from rigth to left.
Then the core will execute.
Then the middlewares will execute the `after` function from left to right.

## Install

`npm install wrap-ware`

## Use

`const wrap = require('wrap-ware);`

## API

```
const wrappedMain = wrap(main).use(middleware);
```

`main` = callback

Will be passed the arguments that you call `wrappedMain` with.

`middleware` = object with some of these functions: `before`, `after`, `onError`.

---

`before` / `after` = callback `({ input, output, error, resolve, reject }) => ['arg1', 'arg2']`

`input` = [] of the args that `wrappedMain` was called with.

`output` = the return value of the wrappedMain function.

`error` = the return value of the wrappedMain function when an error has been thrown.

`resolve` = callback which accepts an [] of args. This will be used to call the next middleware.

`reject` = callback to trigger the onError method of the next middleware.

The controller object can be modified to affect the subsequent middlewares.
The `before` / `after` function can also simply return an array rather than calling the `resolve` callback.

---

`onError` = callback `({ input, output, error, input, response }) => `

`error` = the return value of the wrappedMain function when an error has been thrown.

`resolve` = callback which accepts an [] of args. This will be used to call the next middleware.

`reject` = callback to skip the remaining onError methods of the middlewares and throws to where `wrap(core)()` was executed

## Example

### Create core functionality you are wrapping

```
const routerLogic = (url, body) => {
    if (url === '/example' && body.id === 'banana') {
        console.log('example wants banana');
        return { response: '🍌' };
    }
    if (url === '/invalid') {
        throw new Error(`${url} is invalid`);
    }
}
```

### Create middlewares

```
const addIDToBody = {
    before: ({ input: [url, body], resolve }) => {
        const newBody = { ...body, id: 'banana' };
        console.log('adding id to body')
        return [url, newBody];
    }
}
```

```
const errorHandling = {
    onError: ({ error }) => {
        console.log('handling router error');
        return { error };
    },
}
```

### Create the router using Wrap Ware

```
const router = wrap(routerLogic).use(addIDToBody).use(errorHandling);
```

### Invoke

```
const { result, error } = router('/example', { data: 'some data' }');
console.log(result) // 🍌;
```

```
const { result, error } = router('/invalid', { data: 'some data' }');
console.log(error) // Error('/invalid is invalid') (a handled error object)
```