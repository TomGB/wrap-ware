const router = require('./router-example');

describe('Router Example', () => {
  it('gives a banana if requested', async () => {
    const { response } = await router('/example', { data: 'some data' });

    expect(response).toBe('🍌');
  });

  it('returns an error object if the url is /invalid', async () => {
    const { error } = await router('/invalid', { data: 'some data' });

    expect(error).toEqual(new Error('/invalid is invalid'));
  });
});
