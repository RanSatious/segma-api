import { getPromiseStatus } from '../dist/utils';

test('promise is pending', async () => {
    let p = new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
    expect(await getPromiseStatus(p)).toBe('pending');
});

test('promise is resolved', async () => {
    expect(await getPromiseStatus(Promise.resolve('success'))).toBe('resolved');
});

test('promise is rejected', async () => {
    expect(await getPromiseStatus(Promise.reject('error'))).toBe('rejected');
});
