import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import qs from 'qs';
import { IAuthStrategy, SegmaStrategy, QingtuiStrategy } from './strategy';

interface IApiResult {
    code: number | string;
    message: string;
    traceId?: string | null;
    possibleReason?: string | null;
    suggestMeasure?: string | null;
    data?: unknown | null;
    meta?: any;
}

type MessageTipKey = keyof Omit<IApiResult, 'message' | 'data' | 'meta'>;
type MessageTipFunc = (message: string, code?: number | string, result?: IApiResult) => void;

const MessageTipFactory = (tip: Function): MessageTipFunc => {
    return (message: string, code?: number | string, result?: IApiResult) => {
        const title = result ? result.message : '';
        const KEY_MAP = {
            code: '错误码',
            traceId: '追踪ID',
            possibleReason: '可能原因',
            suggestMeasure: '建议措施',
        };
        let msgString = Object.keys(KEY_MAP).reduce((total, current) => {
            let key = KEY_MAP[current as MessageTipKey];
            let val = result ? result[current as MessageTipKey] : '';
            return val ? `${total} <p title=${val}>${key}：${val}</p>` : total;
        }, '');
        let titleMessage = title ? `<p class="el-message__title" title=${title}>${title}</p>` : '';
        let msg = titleMessage + msgString;
        tip({
            iconClass: 'iconfont se-icon-f-warning icon-orange',
            customClass: 'el-message',
            dangerouslyUseHTMLString: true,
            message: msg,
            showClose: true,
        });
    };
};

interface IApiConfig {
    tip: MessageTipFunc;
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
            let status = error.response?.status;
            let { code, message, possibleReason = null, traceId = null, suggestMeasure = null, data = null, meta = {} } = (error.response?.data as IApiResult) || {};
            let result: IApiResult = {
                code,
                message,
                possibleReason,
                traceId,
                suggestMeasure,
                data,
            };

            if (status === 404) {
                result = {
                    ...result,
                    code: '404',
                    message: '资源不存在',
                    possibleReason: 'Not Found',
                };
            } else if (status === 502) {
                result = {
                    ...result,
                    code: '502',
                    message: '网关请求错误',
                    possibleReason: 'Bad Gateway',
                };
            } else {
                result = {
                    ...result,
                    code: '-1',
                    message: '未知错误',
                    possibleReason: 'Unknown Error',
                };
            }

            if (!meta.slient) {
                tip(result.message, result.code, result);
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
                return Promise.reject(result);
            }
        },
        error => {
            if (!error.response || !error.response.status) {
                return Promise.reject(error);
            }
            const status = error.response && error.response.status;
            const handler = errorHandler[status] || errorHandler.default;
            return handler(error);
        }
    );

    return $axios;
}

export { ApiFactory, SegmaStrategy, QingtuiStrategy, MessageTipFactory };
