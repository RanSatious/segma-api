import { getPromiseStatus } from '../utils';
import { selectStrategy } from './strategy';

let tokenResolve: Function;
let tokenPromise: Promise<string> = new Promise((resolve, reject) => {
    tokenResolve = resolve;
});

let strategy = selectStrategy();

const TOKEN = 'auth_token';

const getToken = async (): Promise<string> => {
    let token = strategy.get(TOKEN);
    if (token) {
        return token;
    }
    if ((await getPromiseStatus(tokenPromise)) === 'pending') {
        return tokenPromise;
    }
    return '';
};

const setToken = (token: string | null = strategy.get(TOKEN)): void => {
    tokenResolve(token);
    if (token) {
        strategy.set(TOKEN, token);
    }
};

const clearToken = () => {
    tokenResolve(null);
    strategy.remove(TOKEN);
};

export { getToken, setToken, clearToken };
