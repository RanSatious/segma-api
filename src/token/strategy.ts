interface IStrategy {
    get: (name: string) => string | null;
    set: (name: string, value: string) => void;
    remove: (name: string) => void;
}

const strategyList: Record<string, IStrategy> = {
    localStorage: {
        get: window.localStorage.getItem,
        set: window.localStorage.setItem,
        remove: window.localStorage.removeItem,
    },
};

const addStrategy = (name: string, payload: IStrategy, force: boolean = false) => {
    if (strategyList[name]) {
        if (force) {
            console.warn(`overridding strategy [${name}]`);
        } else {
            throw new Error(`strategy [${name}] already exsits`);
        }
    }
    strategyList[name] = payload;
};

const selectStrategy = (name: string = 'localStorage') => {
    return strategyList[name];
};

export { addStrategy, selectStrategy };
