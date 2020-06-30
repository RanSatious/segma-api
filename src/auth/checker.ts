import { setToken, getToken } from '../token/token';
import { logout } from '../api/message';

interface IAuthConfig {
    autoLogout: boolean;
}

function AuthChecker(config: IAuthConfig = { autoLogout: true }) {
    return {
        watch: {
            $route: {
                immediate: true,
                handler(val: any) {
                    if (!val.name) {
                        return;
                    }
                    let { token } = val.query;
                    if (!token) {
                        token = new URLSearchParams(location.search).get('token');
                    }
                    setToken(token);
                    if (token) {
                        let { token: tk, ...query } = (this as any).$route.query;
                        (this as any).$router.push({
                            name: (this as any).$route.name,
                            query,
                        });
                    }
                },
            },
        },
        async mounted() {
            const { autoLogout } = config;
            let token = await getToken();
            if (!token && autoLogout) {
                logout();
            }
        },
    };
}

export default AuthChecker;
