import { ApiFactory } from '../dist/api';

describe('default config', () => {
    const instance = ApiFactory();

    test('get data correctly', async () => {
        let result = await instance.get('http://localhost:7000/api');
        expect(result).toBe('result');
    });

    test('throw error', async () => {
        try {
            await instance.get('http://localhost:7000/api/error');
        } catch (error) {
            expect(error).toBeTruthy();
        }
    });
});

describe('custom tip function', () => {
    test('get message and code', async () => {
        let params;
        try {
            const instance = ApiFactory({
                tip: (message, code) => {
                    params = [message, code];
                },
            });
            await instance.get('http://localhost:7000/api/error');
        } catch (error) {
            expect(params[0]).toBe('error msg');
            expect(params[1]).toBe(10010);
            expect(error).toBeTruthy();
        }
    });
});

describe('custom auth strategy', () => {
    test('onAuth', async () => {
        const instance = ApiFactory({
            tip: console.log,
            auth: {
                async onAuth(config) {
                    config.headers['Authorization'] = 'test';
                },
                onUnauthorized(error) {},
            },
        });
        let result = await instance.get('http://localhost:7000/api/auth');
        expect(result).toBe('test');
    });
    test('onUnauthorized', async () => {
        const instance = ApiFactory({
            tip: console.log,
            auth: {
                async onAuth(config) {},
                onUnauthorized(error) {
                    expect(error).toBeTruthy();
                },
            },
        });
        try {
            await instance.get('http://localhost:7000/api/auth/error');
        } catch (error) {
            const { response } = error;
            expect(response).toBeTruthy();
            expect(response.status).toBe(401);
            expect(response.data).toBeTruthy();
            expect(response.data.data).toBe('auth failed');
        }
    });
});

describe('handle error', () => {
    test('404', async () => {
        let params;
        const instance = ApiFactory({
            tip(message, code, result) {
                params = [message, code, result];
            },
        });
        try {
            await instance.get('http://localhost:7000/api/error/404');
        } catch (error) {
            expect(params[0]).toBe('资源不存在');
            expect(params[1]).toBe('404');
            expect(params[2].possibleReason).toBe('Not Found');
            expect(error).toBeTruthy();
        }
    });

    test('502', async () => {
        let params;
        const instance = ApiFactory({
            tip(message, code, result) {
                params = [message, code, result];
            },
        });
        try {
            await instance.get('http://localhost:7000/api/error/502');
        } catch (error) {
            expect(params[0]).toBe('网关请求错误');
            expect(params[1]).toBe('502');
            expect(params[2].possibleReason).toBe('Bad Gateway');
            expect(error).toBeTruthy();
        }
    });

    test('500', async () => {
        let params;
        const instance = ApiFactory({
            tip(message, code, result) {
                params = [message, code, result];
            },
        });
        try {
            await instance.get('http://localhost:7000/api/error/500');
        } catch (error) {
            expect(params[0]).toBe('未知错误');
            expect(params[1]).toBe('-1');
            expect(params[2].possibleReason).toBe('Unknown Error');
            expect(error).toBeTruthy();
        }
    });
});
