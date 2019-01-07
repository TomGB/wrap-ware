const wrap = require('./wrap');

let main;
let middleware1;
let middleware2;

describe('wrap middleware', () => {
    beforeEach(() => {
        main = () => {};
            
        middleware1 = {
            before: () => {},
            after: () => {},
        };

        middleware2 = {
            before: () => {},
            after: () => {},
        };
    })

    it('executes the middlewares in the correct order', async () => {
        const callOrder = [];

        main = () => callOrder.push('main');
    
        middleware1.before = () => callOrder.push('middleware 1 before');
        middleware1.after = () => callOrder.push('middleware 1 after');
        
        middleware2.before = () => callOrder.push('middleware 2 before');
        middleware2.after = () => callOrder.push('middleware 2 after');
    
        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain();

        expect(callOrder).toEqual([
            'middleware 1 before',
            'middleware 2 before',
            'main',
            'middleware 2 after',
            'middleware 1 after'
        ]);
    });

    it('works with async functions and executes the middlewares in the correct order', async () => {
        const callOrder = [];

        const main = async () => {
            callOrder.push('main');
            Promise.resolve();
        }
    
        middleware1.before = () => new Promise(resolve => {
            callOrder.push('middleware 1 before');
            setTimeout(() => {
                callOrder.push('middleware 1 async task');
                resolve();
            }, 20);
        });

        middleware1.after = async () => {
            callOrder.push('middleware 1 after')
        };
        
        middleware2.before = async () => {
            callOrder.push('middleware 2 before');
        };
        middleware2.after = async () => {
            callOrder.push('middleware 2 after')
        };
    
        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain();

        expect(callOrder).toEqual([
            'middleware 1 before',
            'middleware 1 async task',
            'middleware 2 before',
            'main',
            'middleware 2 after',
            'middleware 1 after'
        ]);
    });

    it('passes through input arguments to the main function', async () => {
        main = jest.fn();
        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain('some input', 'some more input');

        expect(main).toHaveBeenCalledWith('some input', 'some more input');
    });

    it('passes through the output from the mainFunction', async () => {
        main = () => 'main output';

        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        const result = await wrappedMain();

        expect(result).toBe('main output');
    });

    it('passes through the output from the mainFunction', async () => {
        main = () => 'main output';
    
        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        const result = await wrappedMain();

        expect(result).toBe('main output');
    });

    it('calls each of the befores with the input', async () => {    
        middleware1.before = jest.fn();
        middleware2.before = jest.fn();
        
        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain('argument 1', 'argument 2');

        expect(middleware1.before).toHaveBeenCalledWith(expect.objectContaining({
            input: ['argument 1', 'argument 2'],
        }));
        expect(middleware2.before).toHaveBeenCalledWith(expect.objectContaining({
            input: ['argument 1', 'argument 2'],
        }));
    });

    it('calls each of the afters with the output', async () => {
        main = () => 'the main output';
    
        middleware1.after = jest.fn();
        middleware2.after = jest.fn();
        
        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain();

        expect(middleware1.after).toHaveBeenCalledWith(expect.objectContaining({
            output: 'the main output',
        }));
        expect(middleware2.after).toHaveBeenCalledWith(expect.objectContaining({
            output: 'the main output',
        }));
    });

    it('calls the main with the output of middleware.before', async () => {
        main = jest.fn();
    
        middleware1.before = () => ['arg 1', 'arg 2'];

        const wrappedMain = wrap(main).use(middleware1);
    
        await wrappedMain();

        expect(main).toHaveBeenCalledWith('arg 1', 'arg 2');
    });

    it('returns the output from the after', async () => {
        middleware1.after = () => 'some data';

        const wrappedMain = wrap(main).use(middleware1);
    
        const output = await wrappedMain();

        expect(output).toBe('some data');
    });

    it(`returns the output from middleware2.after if middleware1.after does not return a value`, async () => {
        middleware1.after = () => 'some data';

        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        const output = await wrappedMain();

        expect(output).toBe('some data');
    });

    it(`works if no after is specified`, async () => {
        main = () => 'some data';
        middleware1.after = undefined;

        const wrappedMain = wrap(main).use(middleware1);
    
        const output = await wrappedMain();

        expect(output).toBe('some data');
    });

    it(`works if no before is specified`, async () => {
        main = jest.fn();
        middleware1.before = undefined;

        const wrappedMain = wrap(main).use(middleware1);
    
        await wrappedMain('some input');

        expect(main).toHaveBeenCalledWith('some input');
    });

    it(`calls the onError middlewares if the main throws an error`, async () => {
        main = () => { throw new Error('problem'); };
        middleware1.onError = jest.fn();

        const wrappedMain = wrap(main).use(middleware1);
    
        await wrappedMain('some data');

        expect(middleware1.onError).toHaveBeenCalledWith(expect.objectContaining({
            error: new Error('problem'),
            input: ['some data'],
            output: undefined
        }));
    });

    it(`calls the onError middlewares if a before throws an error`, async () => {
        middleware2.before = () => { throw new Error('problem'); };
        middleware1.onError = jest.fn();

        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain('some data');

        expect(middleware1.onError).toHaveBeenCalledWith(expect.objectContaining({
            error: new Error('problem'),
            input: ['some data'],
            output: undefined
        }));
    });

    it(`calls the onError middlewares if an after throws an error`, async () => {
        middleware2.after = () => { throw new Error('problem'); };
        middleware1.onError = jest.fn();

        const wrappedMain = wrap(main).use(middleware2).use(middleware1);
    
        await wrappedMain('some data');

        expect(middleware1.onError).toHaveBeenCalledWith(expect.objectContaining({
            error: new Error('problem'),
            input: ['some data'],
            output: undefined
        }));
    });

    it(`throws an error if the middleware does not have a before, after or onError function`, async () => {
        middleware1 = {};

        const setup = () => {
            wrap(main).use(middleware1)
        };

        expect(setup).toThrow(Error('Middleware must have a before, after or onError'));
    });

    it(`throws an error if the middleware's properties are not functions`, async () => {
        middleware1 = {
            before: 'not a function',
        };

        const setup = () => {
            wrap(main).use(middleware1)
        };

        expect(setup).toThrow(Error(`Middleware 'before' must be a function or undefined`));
    });

    it(`wrap().before(fn) accepts a function and creates a middleware which executes the before step`, async () => {
        const callOrder = [];

        const beforeFn = () => callOrder.push('before called');
        main = () => callOrder.push('main');

        const wrappedMain = wrap(main).before(beforeFn);
    
        await wrappedMain();

        expect(callOrder).toEqual([
            'before called',
            'main',
        ]);
    });

    it(`wrap().after(fn) accepts a function and creates a middleware which executes the after step`, async () => {
        const callOrder = [];

        const afterFn = () => callOrder.push('after called');
        main = () => callOrder.push('main');

        const wrappedMain = wrap(main).after(afterFn);
    
        await wrappedMain();

        expect(callOrder).toEqual([
            'main',
            'after called',
        ]);
    });

    it(`wrap().onError(fn) accepts a function and creates a middleware which executes the onError step`, async () => {
        const callOrder = [];

        const onError = () => callOrder.push('onError called');
        main = () => {
            callOrder.push('main');
            throw new Error('problem');
        }

        const wrappedMain = wrap(main).onError(onError);
    
        await wrappedMain();

        expect(callOrder).toEqual([
            'main',
            'onError called',
        ]);
    });

    it(`wrap().before(fn) throws an error if the variable passed to before is not a function`, async () => {
        const beforeFn = 'not a function';

        const setup = () => {
            wrap(main).before(beforeFn);
        };

        expect(setup).toThrow(Error(`Middleware 'before' must be a function`));
    });

    it(`wrap().after() throws an error if the variable passed to after is not a function`, async () => {
        const afterFn = 'not a function';

        const setup = () => {
            wrap(main).after(afterFn);
        };

        expect(setup).toThrow(Error(`Middleware 'after' must be a function`));
    });

    it(`wrap().onError() throws an error if the variable passed to onError is not a function`, async () => {
        const onErrorFn = 'not a function';

        const setup = () => {
            wrap(main).onError(onErrorFn);
        };

        expect(setup).toThrow(Error(`Middleware 'onError' must be a function`));
    });
});
