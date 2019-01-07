const isUndefined = item => typeof item === 'undefined';
const isFunction = possibleFn => typeof possibleFn === 'function';
const isUndefinedOrFunction = possibleFn => typeof possibleFn === 'undefined' || isFunction(possibleFn);
const wrapInPromise = async fn => new Promise(async (resolve, reject) => {
    try {
        const output = await fn(resolve, reject);
        resolve(output);
    } catch (error) {
        reject(error);
    }
});

const wrap = mainFunction => {
    const middlewares = [];

    const controller = {
        input: undefined,
        output: undefined,
        error: undefined,
        wareIndex: 0,
    };

    const run = async (...args) => {
        middlewares.reverse();

        controller.input = args;

        try {
            while(controller.wareIndex < middlewares.length) {
                const before = middlewares[controller.wareIndex++].before;
                if (!before) continue;

                const middlewareResponse = await wrapInPromise((resolve, reject) => before({ ...controller, resolve, reject }));

                if (Array.isArray(middlewareResponse)) controller.input = middlewareResponse;
            }
    
            controller.output = await mainFunction(...controller.input);

            while(controller.wareIndex > 0) {
                const after = middlewares[--controller.wareIndex].after;
                if (!after) continue;

                const middlewareResponse = await wrapInPromise((resolve, reject) => after({ ...controller, resolve, reject }));

                if (!isUndefined(middlewareResponse)) controller.output = middlewareResponse;
            }
    
            return controller.output;
        } catch (initialError) {
            controller.error = initialError;

            while(controller.wareIndex > 0) {
                const onError = middlewares[--controller.wareIndex].onError;
                if (!onError) continue;

                const middlewareResponse = await wrapInPromise((resolve, reject) => onError({ ...controller, resolve, reject }));

                if (!isUndefined(middlewareResponse)) controller.error = middlewareResponse;
            }

            return controller.error;
        }
    };

    run.use = middleware => {
        if (!middleware || typeof middleware !== 'object') {
            throw new Error('Middleware must be an object');
        }
        const { before, after, onError } = middleware;
        if (!before && !after && !onError) {
            throw new Error('Middleware must have a before, after or onError');
        }

        if (!isUndefinedOrFunction(before)) {
            throw new Error(`Middleware 'before' must be a function or undefined`);
        }
        if (!isUndefinedOrFunction(after)) {
            throw new Error(`Middleware 'after' must be a function or undefined`);
        }
        if (!isUndefinedOrFunction(onError)) {
            throw new Error(`Middleware 'onError' must be a function or undefined`);
        }

        middlewares.push(middleware);
        return run;
    }

    run.before = beforeFn => {
        if (!isFunction(beforeFn)) {
            throw new Error(`Middleware 'before' must be a function`);
        }

        middlewares.push({ before: beforeFn });

        return run;
    }

    run.after = afterFn => {
        if (!isFunction(afterFn)) {
            throw new Error(`Middleware 'after' must be a function`);
        }

        middlewares.push({ after: afterFn });

        return run;
    }

    run.onError = onErrorFn => {
        if (!isFunction(onErrorFn)) {
            throw new Error(`Middleware 'onError' must be a function`);
        }

        middlewares.push({ onError: onErrorFn });

        return run;
    }

    return run;
}

module.exports = wrap;
