export type Action<T> = (mockPromise: Promise<T>) => Promise<T>;
