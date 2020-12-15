import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { IAuthStrategy, SegmaStrategy, QingtuiStrategy } from './strategy';

interface IApiResult {
    code: number;
    message: string;
    traceId?: string;
    possibleReason?: string;
    suggestMeasure?: string;
    data?: unknown;
}

interface IApiConfig {
    tip: (message: string, code?: number, result?: IApiResult) => void;
    axiosConfig?: AxiosRequestConfig;
    auth?: IAuthStrategy;
}

const defaultConfig: IApiConfig = {
    tip: console.log,
    axiosConfig: {
        baseURL: '',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        transformResponse: (data: any) => {
            if (typeof data === 'string' && data[0] === '{') {
                return JSON.parse(data);
            } else {
                return data;
            }
        },
        paramsSerializer: function (params) {
            return qs.stringify(params, { arrayFormat: 'brackets' });
        },
    },
};

function ApiFactory(config: IApiConfig = defaultConfig) {
    config = {
        ...defaultConfig,
        ...config,
        axiosConfig: {
            ...defaultConfig.axiosConfig,
            ...config.axiosConfig,
        },
    };
    const { tip, axiosConfig, auth } = config;

    const $axios = axios.create(axiosConfig);

    // todo: integrate with api builder
    $axios.interceptors.request.use(
        async config => {
            if (auth) {
                await auth.onAuth(config);
            }
            return config;
        },
        error => {
            return Promise.reject(error);
        }
    );

    const errorHandler: Record<number | string, (e: AxiosError) => Promise<any>> = {
        401: error => {
            if (auth) {
                auth.onUnauthorized(error);
            }
            return Promise.reject(error);
        },
        403: error => {
            let { meta = {} } = error.response?.data || {};
            if (!meta.slient) {
                tip('权限验证失败，即将跳转到首页');
            }
            setTimeout(() => {
                window.location.href = window.location.origin;
            }, 500);
            return Promise.reject(error);
        },
        default: error => {
            if (!(error.message && (error.message === '取消上传' || error.message === 'cancel'))) {
                if (navigator.onLine) {
                    error.message ? tip(error.message) : tip('服务器错误，请联系系统管理员！');
                } else {
                    tip('网络错误，请检查网络连接！');
                }
            }
            return Promise.reject(error);
        },
    };

    $axios.interceptors.response.use(
        response => {
            let { code, message = '服务器错误', traceId, possibleReason, suggestMeasure, data, meta = {} } = response.data || {};
            const success = String(code) === '0';
            const result: IApiResult = {
                code,
                message,
                traceId,
                possibleReason,
                suggestMeasure,
            };
            if (success) {
                return data;
            } else {
                if (!meta.slient) {
                    tip(message, code, result);
                }
                // todo: replace message with result
                return Promise.reject(message);
            }
        },
        error => {
            if (!error.response || !error.response.data) {
                return Promise.reject(error);
            }
            const status = error.response && error.response.status;
            const handler = errorHandler[status] || errorHandler.default;
            return handler(error);
        }
    );

    return $axios;
}

export { ApiFactory, SegmaStrategy, QingtuiStrategy };
