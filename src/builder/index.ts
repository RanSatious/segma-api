import Axios, { AxiosRequestConfig, AxiosInstance } from 'axios';
import { compose } from '../utils';
import callbackPromise from './plugins/callback';
import { CancelableMock } from './plugins/mock';
import { CancelableAxios } from './plugins/axios';

interface ApiFunction extends Function {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
}

interface ApiBuilderConfig {
    name: string;
    axios: () => AxiosRequestConfig;
    mock: () => Promise<any>;
    isMock: boolean | string;
    cancel?: boolean;
    callback?: boolean;
}

interface BuilderConfig {
    axios: AxiosInstance;
    log: (name: string, ...args: any[]) => void;
}

let _config: BuilderConfig = {
    axios: Axios,
    log: console.log,
};

export function initBuilder(config: BuilderConfig) {
    _config = {
        ..._config,
        ...config,
    };
}

export function buildApi(config: ApiBuilderConfig): ApiFunction {
    const { name, axios, mock, isMock, cancel, callback } = config;
    let steps: any[] = [];

    steps.push((...params: any[]) => {
        _config.log(name, ...params);
        return params;
    });

    steps.push(isMock ? mock : axios);

    if (cancel) {
        steps.push(isMock ? CancelableMock() : CancelableAxios(_config.axios));
    } else if (!isMock) {
        steps.push(_config.axios);
    }

    if (callback) {
        steps.push(callbackPromise);
    }

    return compose(...steps);
}
