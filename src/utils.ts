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

/**
 * id 生成器
 *
 * @export
 * @param {number} [len=10]
 * @returns
 */
export function uid(len: number = 10) {
    let str = '';
    let HEX = 'ZYXWVUTSRQPONMLKJIHGFEDCBAzyxwvutsrqponmlkjihgfedcba9876543210';
    while (len--) {
        str += HEX[(Math.random() * HEX.length) | 0];
    }
    return str;
}

function compose(...funcs: Function[]): Function {
    const action: Function = (...args: any[]) => {
        let result = funcs.reduce((result, func, index) => {
            // spread params passing from outside
            if (index <= 1) {
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
