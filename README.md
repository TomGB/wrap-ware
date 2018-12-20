# Wrap Ware

A middleware wrapper which works with promises / async

## Install

`npm install middy`

or

`yarn add middy`

## Usage

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
    before: ([url, body], next) => {
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