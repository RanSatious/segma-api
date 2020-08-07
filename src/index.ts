import { ApiFactory, SegmaStrategy, QingtuiStrategy } from './api';
import { getToken, setToken, clearToken } from './token/token';
import { AuthChecker } from './auth/checker';
import { initBuilder, buildApi } from './builder';

export { ApiFactory, getToken, setToken, clearToken, AuthChecker, initBuilder, buildApi, SegmaStrategy, QingtuiStrategy };
