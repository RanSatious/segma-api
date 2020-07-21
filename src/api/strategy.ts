import { AxiosError, AxiosRequestConfig } from 'axios';
import { logout } from './message';
import { getToken } from '../token/token';

export interface IAuthStrategy {
    onAuth: (config: AxiosRequestConfig) => Promise<void>;
    onUnauthorized: (error: AxiosError) => void;
}

export const SegmaStrategy: IAuthStrategy = {
    async onAuth(config) {
        // todo: refactor token manager
        config.headers['Authorization'] = await getToken();
    },
    onUnauthorized(error) {
        setTimeout(() => {
            logout(process.env.VUE_APP_AUTH_REDIRECT_URI);
        }, 500);
    },
};
