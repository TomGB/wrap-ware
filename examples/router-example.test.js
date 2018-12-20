describe('Router Example', () => {
    it('works', async () => {
        const router = require('./router-example');
        const routerResponse = await router('www.google.com', { data: 'some data' });
    
        expect(routerResponse).toBe('🍌');
    })
});