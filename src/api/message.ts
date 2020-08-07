const handlers: Record<string, Function> = {
    loginout: (href: string) => {
        window.location.href = href;
    },
};

window.addEventListener('message', event => {
    const { type, redirect } = event.data;
    if (event.origin === window.location.origin) {
        handlers[type] && handlers[type](redirect);
    }
});

export const logout = (redirect = '') => {
    const target = window.parent || window.opener;
    target.postMessage({ type: 'loginout', redirect }, '*');
};
