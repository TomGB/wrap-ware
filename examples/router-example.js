const wrap = require('../index');

const routerLogic = (url, body) => {
    if (url === 'www.google.com' && body.id === 'banana') {
        console.log('google wants banana');
        return '🍌';
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
    onError: (error) => {
        console.log(error);
    }
}

const router = wrap(routerLogic).use(addIDToBody).use(errorHandling).use(routerLogging);

module.exports = router;