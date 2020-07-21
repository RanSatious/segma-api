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
        try {
            const instance = ApiFactory({
                tip: (message, code) => {
                    expect(message).toBe('error msg');
                    expect(code).toBe(10010);
                },
            });
            await instance.get('http://localhost:7000/api/error');
        } catch (error) {
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
