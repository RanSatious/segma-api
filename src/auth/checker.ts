import { setToken, getToken } from '../token/token';
import { logout } from '../api/message';

interface IAuthConfig {
    autoLogout: boolean;
    logout: Function;
}

const defaultConfig: IAuthConfig = {
    autoLogout: true,
    logout: () => {
        logout(process.env.VUE_APP_AUTH_REDIRECT_URI);
    },
};

function AuthChecker(config: IAuthConfig = { ...defaultConfig }) {
    return {
        watch: {
            $route: {
                immediate: true,
                handler(val: any) {
                    if (!val.name) {
                        return;
                    }
                    let { token, ...query } = val.query;
                    if (!token) {
                        token = new URLSearchParams(location.search).get('token');
                    }
                    setToken(token);
                    if (token) {
                        (this as any).$router.push({
                            name: (this as any).$route.name,
                            query,
                        });
                    }
                },
            },
        },
        async mounted() {
            const { autoLogout, logout } = config;
            let token = await getToken();
            if (!token && autoLogout) {
                logout();
            }
        },
    };
}

export { AuthChecker };
