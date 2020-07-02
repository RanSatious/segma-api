import Axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
import { uid } from '../../utils';
const { CancelToken } = Axios;

type Action = (config: AxiosRequestConfig) => Promise<AxiosResponse<any>>;
interface CancelableAction extends Action {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
}

function CancelableAxios(instance: AxiosInstance): Function {
    let map = new Map();
    let token: Function | null;
    let action: CancelableAction = (config: AxiosRequestConfig) => {
        let key = uid();
        return instance({
            ...config,
            cancelToken: new CancelToken(c => {
                token = c;
                map.set(key, token);
            }),
        }).then(
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

    action.cancel = (message: string) => {
        token && token(new Error(message || 'cancel'));
        token = null;
    };
    action.getToken = () => token;
    return action;
}

export { CancelableAxios };
