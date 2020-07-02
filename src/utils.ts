type PromiseStatus = 'pending' | 'resolved' | 'rejected';

/**
 * 获取一个 Promise 的状态
 *
 * @template T
 * @param {Promise<T>} promise
 * @returns {Promise<PromiseStatus>}
 */
async function getPromiseStatus<T>(promise: Promise<T>): Promise<PromiseStatus> {
    const p = {};
    try {
        let result = await Promise.race([promise, p]);
        if (result === p) {
            return 'pending';
        }
        return 'resolved';
    } catch (error) {
        return 'rejected';
    }
}

function compose(...funcs: Function[]): Function {
    const action: Function = (...args: any[]) => {
        let result = funcs.reduce((result, func, index) => {
            if (index === 0) {
                return func(...result);
            }
            return func(result);
        }, args);

        return result;
    };

    funcs.forEach((func: Function) => {
        Object.keys(func).forEach(key => {
            (action as any)[key] = (func as any)[key];
        });
    });

    return action;
}

export { getPromiseStatus, compose };
