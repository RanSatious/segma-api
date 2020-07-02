import { Action } from './action';
import { uid } from '../../utils';

interface CancelableAction extends Action<any> {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
}

function CancelableMock() {
    let map = new Map();
    let token: Function | null;
    let action: CancelableAction = (mockPromise: Promise<any>) => {
        let key = uid();
        return Promise.race([
            mockPromise,
            new Promise((resolve, reject) => {
                token = reject;
                map.set(key, token);
            }),
        ]).then(
            result => {
                if (token === map.get(key)) {
                    token = null;
                }
                map.delete(key);
                return result;
            },
            error => {
                if (token === map.get(key)) {
                    token = null;
                }
                map.delete(key);
                throw error;
            }
        );
    };
    action.cancel = message => {
        token && token(new Error(message || 'cancel'));
        token = null;
    };
    action.getToken = () => token;
    return action;
}

export { CancelableMock };
