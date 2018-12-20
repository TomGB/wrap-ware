class MiddlewareController {
    constructor () {
        this.input = undefined;
        this.output = undefined;
        this.error = undefined;
        this.wareIndex = 0;
    }
}

const isUndefined = item => typeof item === 'undefined';

const wrap = mainFunction => {
    const middlewares = [];

    const controller = new MiddlewareController();

    const run = async (...args) => {
        middlewares.reverse();

        controller.input = args;

        try {
            while(controller.wareIndex < middlewares.length) {
                const before = middlewares[controller.wareIndex++].before;
                if (!before) continue;

                const middlewareResponse = await new Promise(async (resolve, reject) => {
                    const output = await before({ ...controller, resolve, reject });
                    resolve(output);
                });

                if (Array.isArray(middlewareResponse)) controller.input = middlewareResponse;
            }
    
            controller.output = await mainFunction(...controller.input);

            while(controller.wareIndex > 0) {
                const after = middlewares[--controller.wareIndex].after;
                if (!after) continue;

                const middlewareResponse = await new Promise(async (resolve, reject) => {
                    const output = await after({ ...controller, resolve, reject });
                    resolve(output);
                });
    
                if (!isUndefined(middlewareResponse)) controller.output = middlewareResponse;
            }
    
            return controller.output;
        } catch (initialError) {
            controller.error = initialError;

            while(controller.wareIndex > 0) {
                const onError = middlewares[--controller.wareIndex].onError;
                if (!onError) continue;

                const middlewareResponse = await new Promise(async (resolve, reject) => {
                    const output = await onError({ ...controller, resolve, reject });
                    resolve(output);
                });
    
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

        middlewares.push(middleware);
        return run;
    }

    return run;
}

module.exports = wrap;
