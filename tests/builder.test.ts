import { initBuilder, buildApi } from '../dist/builder/index';
import Axios from 'axios';

const sleep = (interval = 500) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, interval);
    });
};

beforeAll(() => {
    initBuilder({
        axios: Axios,
        log: () => {},
    });
});

test('api is function', () => {
    let api = buildApi({
        name: 'mock-name',
        mock: () => Promise.resolve('result'),
        axios: () => ({
            url: '/test',
            method: 'GET',
        }),
        isMock: true,
    });
    expect(typeof api).toBe('function');
});

test('cancelable api has cancel and getToken property', () => {
    let api = buildApi({
        name: 'mock-name',
        mock: () => Promise.resolve('result'),
        axios: () => ({
            url: '/test',
            method: 'GET',
        }),
        isMock: true,
        cancel: true,
    });
    expect('cancel' in api).toBe(true);
    expect('getToken' in api).toBe(true);
});

test('[mock] api return data correctly', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: '/test',
            method: 'GET',
        }),
        isMock: true,
        cancel: true,
    });

    let result = await api();
    expect(result).toBe('result');
});

test('[mock] cancel api with correct message', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: '/test',
            method: 'GET',
        }),
        isMock: true,
        cancel: true,
    });

    try {
        setTimeout(() => {
            api.cancel('cancel message');
        }, 10);
        await api();
    } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('cancel message');
    }
});

test('[mock] callback works correctly', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: '/test',
            method: 'GET',
        }),
        isMock: true,
        cancel: true,
        callback: true,
    });

    await api((status, result) => {
        expect(['start', 'success', 'error'].includes(status)).toBe(true);
        if (status === 'start') {
            expect(result).toBeFalsy();
        } else if (status === 'success') {
            expect(result).toBe('result');
        }
    });
});

test('[mock] callback works correctly when error exists', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return Promise.reject('error exists');
        },
        axios: () => ({
            url: '/test',
            method: 'GET',
        }),
        isMock: true,
        cancel: true,
        callback: true,
    });

    let result;
    try {
        await api((...args) => {
            result = args;
        });
    } catch (error) {
        expect(error).toBe('error exists');
    } finally {
        expect(result[0]).toBe('error');
        expect(result[1]).toBe('error exists');
    }
});

test('api return data correctly', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: 'http://localhost:7000',
            method: 'GET',
        }),
        isMock: false,
    });

    let result = await api();
    expect(result.data).toBe('hello world');
});

test('cancel api with correct message', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: 'http://localhost:7000',
            method: 'GET',
        }),
        isMock: false,
        cancel: true,
    });

    try {
        setTimeout(() => {
            api.cancel('cancel message');
        }, 10);
        await api();
    } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toBe('cancel message');
    }
});

test('callback works correctly', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: 'http://localhost:7000',
            method: 'GET',
        }),
        isMock: false,
        cancel: true,
        callback: true,
    });

    await api((status, result) => {
        expect(['start', 'success', 'error'].includes(status)).toBe(true);
        if (status === 'start') {
            expect(result).toBeFalsy();
        } else if (status === 'success') {
            expect(result.data).toBe('hello world');
        }
    });
});

test('callback works correctly when error exists', async () => {
    let api = buildApi({
        name: 'name',
        mock: async () => {
            await sleep();
            return 'result';
        },
        axios: () => ({
            url: 'http://localhost:7000/404',
            method: 'GET',
        }),
        isMock: false,
        cancel: true,
        callback: true,
    });

    let result;
    try {
        await api((...args) => {
            result = args;
        });
    } catch (error) {
        expect(error).toBeInstanceOf(Error);
    } finally {
        expect(result[0]).toBe('error');
        expect(result[1].response.data).toBe('not found');
    }
});
