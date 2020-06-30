import Axios, { AxiosRequestConfig, AxiosInstance, AxiosResponse } from 'axios';
const { CancelToken } = Axios;

type Action = (config: AxiosRequestConfig) => Promise<AxiosResponse<any>>;
interface CancelableAction extends Action {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
}

function CancelableAxios(instance: AxiosInstance): Function {
    let token: Function | null;
    let action: CancelableAction = (config: AxiosRequestConfig) => {
        return instance({
            ...config,
            cancelToken: new CancelToken(c => {
                token = c;
            }),
        }).then(
            result => {
                token = null;
                return result;
            },
            error => {
                token = null;
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
