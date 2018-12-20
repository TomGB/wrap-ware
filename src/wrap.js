const isUndefined = item => typeof item === 'undefined';

const wrap = mainFunction => {
    const middlewares = [];

    const run = async (...args) => {
        middlewares.reverse();

        let input = args;
        let response;
        let wareIndex = 0;

        try {
            while(wareIndex < middlewares.length) {
                const before = middlewares[wareIndex++].before;
                if (!before) continue;

                const middlewareResponse = await new Promise(async (resolve, reject) => {
                    const output = await before(await input, resolve, reject);
                    resolve(output);
                });
    
                if (Array.isArray(middlewareResponse)) input = middlewareResponse;
            }
    
            response = await mainFunction(...input);

            while(wareIndex > 0) {
                const after = middlewares[--wareIndex].after;
                if (!after) continue;

                const middlewareResponse = await new Promise(async (resolve, reject) => {
                    const output = await after(await response, resolve, reject);
                    resolve(output);
                });
    
                if (!isUndefined(middlewareResponse)) response = middlewareResponse;
            }
    
            return response;
        } catch (initialError) {
            let error = initialError;

            while(wareIndex > 0) {
                const onError = middlewares[--wareIndex].onError;
                if (!onError) continue;

                const middlewareResponse = await new Promise(async (resolve) => {
                    const output = await onError({ error, input, response }, resolve);
                    resolve(output);
                });
    
                if (!isUndefined(middlewareResponse)) error = middlewareResponse;
            }

            return error;
        }
    };

    run.use = middleware => {
        middlewares.push(middleware);
        return run;
    }

    return run;
}

module.exports = wrap;
