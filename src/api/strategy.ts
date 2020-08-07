import { AxiosError, AxiosRequestConfig } from 'axios';
import { logout } from './message';
import { getToken } from '../token/token';

export interface IAuthStrategy {
    onAuth: (config: AxiosRequestConfig) => Promise<void>;
    onUnauthorized: (error: AxiosError) => void;
}

// Segma认证策略
export const SegmaStrategy: IAuthStrategy = {
    async onAuth(config) {
        // todo: refactor token manager
        config.headers['Authorization'] = await getToken();
    },
    onUnauthorized(error) {
        let redirect = process.env.VUE_APP_AUTH_REDIRECT_URI;
        let clientId = process.env.VUE_APP_AUTH_CLIENT_ID;
        if (redirect && clientId) {
            setTimeout(() => {
                logout(`${redirect}?state=xyz&client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.href)}`);
            }, 500);
        }
    },
};

// 轻推认证策略
export const QingtuiStrategy: IAuthStrategy = {
    async onAuth(config) {
        config.headers['Authorization'] = await getToken();
    },
    onUnauthorized(error) {
        let redirect = process.env.VUE_APP_AUTH_REDIRECT_URI;
        if (redirect) {
            setTimeout(() => {
                logout(`${redirect}?uri=${encodeURIComponent(window.location.href)}`);
            }, 500);
        }
    },
};
