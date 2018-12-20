const wrap = require('../index');

const routerLogic = (url, body) => {
    if (url === '/example' && body.id === 'banana') {
        console.log('example wants banana');
        return { response: '🍌' };
    }
    if (url === '/invalid') {
        throw new Error(`${url} is invalid`);
    }
}

const routerLogging = {
    before: ([url, body]) => {
        console.log('router was called with:')
        console.log('url', url);
        console.log('body', body);
    },
    after: response => {
        console.log('router responded with', response)
    }
};

const addIDToBody = {
    before: ([url, body], next) => {
        const newBody = { ...body, id: 'banana' };
        console.log('adding id to body')
        return [url, newBody];
    }
}

const errorHandling = {
    onError: ({ error }) => {
        console.log('handling router error');
        return { error };
    },
}

const router = wrap(routerLogic).use(addIDToBody).use(errorHandling).use(routerLogging);

module.exports = router;