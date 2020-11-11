import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { compose } from '../utils';
import { CancelableMock } from './plugins/mock';
import { CancelableAxios } from './plugins/axios';
import { CallbackPromise } from './plugins/callback';

interface ApiFunction extends Function {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
    callback?: Function;
}

interface ApiBuilderConfig {
    name: string;
    axios: (params?: unknown) => AxiosRequestConfig;
    mock: (config?: AxiosRequestConfig) => Promise<any>;
    isMock: boolean | string;
    cancel?: boolean;
    callback?: boolean;
}

interface BuilderConfig {
    axios: AxiosInstance;
    log: (name: string, ...args: any[]) => void;
}

let defaultBuilderConfig: BuilderConfig = {
    axios: Axios,
    log: console.log,
};

export function initBuilder(builderConfig: BuilderConfig) {
    builderConfig = {
        ...defaultBuilderConfig,
        ...builderConfig,
    };
    return function buildApi(config: ApiBuilderConfig): ApiFunction {
        const { name, axios = () => void 0, mock, isMock, cancel, callback } = config;
        let steps: any[] = [];

        steps.push((...params: any[]) => {
            builderConfig.log(name, ...params);
            return params;
        });

        steps.push(axios);
        if (isMock) {
            steps.push(mock);
            if (cancel) {
                steps.push(CancelableMock());
            }
        } else {
            steps.push(cancel ? CancelableAxios(builderConfig.axios) : builderConfig.axios);
        }

        if (callback) {
            steps.push(CallbackPromise());
        }

        return compose(...steps);
    };
}
