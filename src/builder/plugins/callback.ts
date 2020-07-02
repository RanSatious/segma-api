import { Action } from './action';

type TStatus = 'start' | 'success' | 'error';
type TCallback = (status: TStatus, ...args: any[]) => void;
interface CallbackAction extends Action<any> {
    callback?: (func: TCallback) => void;
}

function CallbackPromise() {
    let callback: TCallback = (status: TStatus) => {};
    let action: CallbackAction = (promise: Promise<any>) => {
        callback('start');
        return promise.then(
            result => {
                callback('success', result);
                return result;
            },
            error => {
                callback('error', error);
                throw error;
            }
        );
    };

    action.callback = (val: TCallback) => {
        callback = val || callback;
    };
    return action;
}

export { CallbackPromise };
