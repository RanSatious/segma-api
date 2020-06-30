const handlers: Record<string, Function> = {
    loginout: () => {
        if (process.env.VUE_APP_AUTH_REDIRECT_URI) {
            // todo: 需要优化
            window.location.href = `${process.env.VUE_APP_AUTH_REDIRECT_URI}?uri=${encodeURIComponent(window.location.href)}`;
        }
    },
};

window.addEventListener('message', event => {
    const { type } = event.data;
    if (event.origin === window.location.origin) {
        handlers[type] && handlers[type]();
    }
});

export const logout = () => {
    const target = window.parent || window.opener;
    target.postMessage({ type: 'loginout' }, '*');
};
