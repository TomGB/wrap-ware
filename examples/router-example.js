const wrap = require('../index');

const routerLogic = (url, body) => {
  if (url === '/example' && body.id === 'banana') {
    console.log('example wants banana');
    return { response: '🍌' };
  }
  throw new Error(`${url} is invalid`);
};

const routerLogging = {
  before: ({ input: [url, body] }) => {
    console.log('router was called with:');
    console.log('url', url);
    console.log('body', body);
  },
  after: ({ output }) => {
    console.log('router responded with', output);
  },
};

const addIDToBody = ({ input: [url, body], resolve: next }) => {
  const newBody = { ...body, id: 'banana' };
  console.log('adding id to body');
  next([url, newBody]);
};

const errorHandling = ({ error }) => {
  console.log('handling router error');
  return { error };
};

const router = wrap(routerLogic).before(addIDToBody).onError(errorHandling).use(routerLogging);

module.exports = router;
