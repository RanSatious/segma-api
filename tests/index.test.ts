import { hello } from '../dist/index';

test('hello is function', () => {
    expect(typeof hello).toBe('function');
});
