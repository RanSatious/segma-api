import { ApiFactory } from '../dist/api';

const instance = ApiFactory({
    tip: console.log,
    auth: false,
});

test('get data correctly', async () => {
    let result = await instance.get('http://localhost:7000/api');
    expect(result).toBe('result');
});
