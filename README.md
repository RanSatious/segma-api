# @segma/api-tools

## 简介

这是一个与构建 api 请求相关的工具包，包含了定制 axios 实例、认证 token 的管理、基于 vue 的认证 mixin、构建可取消、可 mock 数据的 api 请求等功能。

## 仓库地址

```bash
https://github.com/RanSatious/segma-api
```

## 快速开始

### 安装

```bash
# 切换仓库
npm config set registry http://npm.segma.tech/
npm i @segma/api-tools
```

### 使用

```javascript
import { ApiFactory, getToken, setToken, clearToken, AuthChecker, initBuilder, buildApi } from '@segma/api-tools';
```

## ApiFactory

我们通常使用 axios 来请求后端接口，但在实际使用时，往往需要对 axios 实例进行一些定制化的配置来适应后端接口的一些通用的约定，如返回数据格式、验证机制、错误处理等等。

这些通用的约定一般是作为团队的代码规范，不会随着项目而变化，所以在以往的实践中，前端需要在每个项目里去编写这样一份相同的配置，这是重复性的工作，需要进行改进。

于是，api-tools 提供了 ApiFactory 函数，可以快速生成一个已经拥有默认配置的 axios 实例。

**快速使用**

```javascript
import { ApiFactory, SegmaStrategy } from '@segma/api-tools';

const axios = ApiFactory({
    tip: console.log,
    auth: SegmaStrategy,
    axiosConfig: {
        baseURL: process.env.VUE_APP_BASE_API,
    },
});

async function request() {
    let result = await axios.get('http://localhost:7000/api');
    console.log(result);
}
```

**接口定义**

```typescript
import { AxiosInstance } from 'axios';

declare function ApiFactory(config: IApiConfig): AxiosInstance;

interface IApiConfig {
    // 提示接口错误消息的函数
    tip: (message: string, code?: number | null) => void;
    // axios 配置
    // 会与默认的 axios 配置进行合并
    axiosConfig?: AxiosRequestConfig;
    // 认证策略
    auth?: IAuthStrategy;
}

interface IAuthStrategy {
    // 在请求前调用
    onAuth: (config: AxiosRequestConfig) => Promise<void>;
    // 在请求返回401时调用
    onUnauthorized: (error: AxiosError) => void;
}
```

**默认配置**

```typescript
import qs from 'qs';

const defaultConfig: IApiConfig = {
    tip: console.log,
    axiosConfig: {
        baseURL: '',
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        transformResponse: (data: any) => {
            if (typeof data === 'string' && data[0] === '{') {
                return JSON.parse(data);
            } else {
                return data;
            }
        },
        paramsSerializer: function (params) {
            return qs.stringify(params, { arrayFormat: 'brackets' });
        },
    },
};
```

**SegmaStrategy**

Segma的认证策略

```typescript
const SegmaStrategy: IAuthStrategy = {
    async onAuth(config) {
        config.headers['Authorization'] = await getToken();
    },
    onUnauthorized(error) {
        let redirect = process.env.VUE_APP_AUTH_REDIRECT_URI;
        let clientId = process.env.VUE_APP_AUTH_CLIENT_ID;
        if (redirect && clientId) {
            setTimeout(() => {
                logout(`${redirect}?state=xyz&client_id=${clientId}&redirect_uri=${encodeURIComponent(window.location.href)}`);
            }, 500);
        }
    },
};
```

**QingtuiStrategy**

轻推的认证策略

```typescript
const QingtuiStrategy: IAuthStrategy = {
    async onAuth(config) {
        config.headers['Authorization'] = await getToken();
    },
    onUnauthorized(error) {
        let redirect = process.env.VUE_APP_AUTH_REDIRECT_URI;
        if (redirect) {
            setTimeout(() => {
                logout(`${redirect}?uri=${encodeURIComponent(window.location.href)}`);
            }, 500);
        }
    },
};
```

## token manager

token 的管理主要与 axios 实例，AuthChecker 一起使用，做到与业务代码基本解耦，日常的开发不需要关心 token 如何处理。

**快速使用**

```javascript
import { getToken, setToken, clearToken } from '@segma/api-tools';

// 获取 token
// 注意是异步操作
let token;
getToken().then(result => {
    token = result;
});

// 设置 token
setToken('token_value');

// 清理 token
clearToken();
```

**接口定义**

```typescript
// 对应 strategy 的 get 操作
declare const getToken: () => Promise<string>;
// 对应 strategy 的 set 操作
declare const setToken: (token?: string | null) => void;
// 对应 strategy 的 remove 操作
declare const clearToken: () => void;
```

**管理策略**

一个 token 的管理策略包含了 get/set/remove 3 种操作，具体参见下面的接口定义，你可以自由添加、选择 token 的管理策略，默认提供 localstorage 的策略。

```typescript
interface IStrategy {
    get: (name: string) => string | null;
    set: (name: string, value: string) => void;
    remove: (name: string) => void;
}
declare const addStrategy: (name: string, payload: IStrategy, force?: boolean) => void;
declare const selectStrategy: (name?: string) => IStrategy;
export { addStrategy, selectStrategy };
```

> 虽然提供了变更管理策略的能力，但请谨慎使用。

**todo**

-   自定义 token 的名称，现在固定为 auth_token。

## AuthChecker

通过 AuthChecker 快速创建一个可以获取、保存、检查 token 是否存在的 mixin。

**快速使用**

```javascript
// 创建 mixin
// src/plugins/mixins/auth.js
import { AuthChecker } from '@segma/api-tools';

export default AuthChecker();
```

```javascript
// 使用 mixin
// 在需要验证 token 的布局、视图甚至组件文件中，引入 mixin
// src/components/layout/Default.vue
import auth from '../../plugins/mixins/auth';

export default {
    name: 'DefaultLayout',
    mixins: [auth],
};
```

**接口定义**

```typescript
interface IAuthConfig {
    // 是否在获取不到 token 时自动登出
    autoLogout: boolean;
    // logout 的具体操作
    logout: Function;
}
```

**默认配置**

```typescript
import { logout } from '../api/message';

const defaultConfig: IAuthConfig = {
    autoLogout: true,
    logout: () => {
        logout(process.env.VUE_APP_AUTH_REDIRECT_URI);
    },
};
```

## api builder

通过 ApiFactory 可以快速构建出满足前后端约定的 axios 实例，但是在实际的开发过程中，下面的一些场景仍会造成一些麻烦：

-   请求报错，检查了很久，才发现是请求参数写错了
-   后端接口迟迟不给出来，接口联调陷入僵局
-   每个请求都需要重复地去控制加载状态
-   网络波动，第一次请求的数据比第二次请求的数据还要后返回，测试提了 bug

api builder 可以轻松解决以上所有痛点：

-   （规划中）请求预处理，包括并不限于日志输出、参数格式化等
-   开放接口的 mock 能力，轻松切换 mock 与真实请求
-   监测接口的状态变化，减少重复代码的编写
-   接口的可取消能力

#### 初始化

初始化的目的主要是为了指定 axios 实例。

**快速使用**

```javascript
// 初始化
import { initBuilder } from '@segma/api-tools';

initBuilder({
    axios,
    log: console.log,
});
```

**接口定义**

```typescript
import { AxiosInstance } from 'axios';

declare function initBuilder(config: BuilderConfig): void;

interface BuilderConfig {
    // axios 实例
    axios: AxiosInstance;
    // 日志函数
    log: (name: string, ...args: any[]) => void;
}
```

**默认配置**

```typescript
import Axios from 'axios';

let _config: BuilderConfig = {
    axios: Axios,
    log: console.log,
};
```

### 与 ApiFactory 集成

```javascript
import { ApiFactory, initBuilder } from '@segma/api-tools';

initBuilder({
    axios: ApiFactory({
        tip: console.log,
        auth: true,
        redirect: process.env.VUE_APP_AUTH_REDIRECT_URI,
    }),
    log: console.log,
});
```

### 构建 api

**首先完成初始化操作**

**快速使用**

```javascript
import { buildApi } from '@segma/api-tools';

const api = buildApi({
    name: 'test',
    axios: () => ({
        url: 'http://localhost:7000/api',
        method: 'GET',
    }),
    isMock: false,
});

const request = async () => {
    let result = await api.test({ page: 1 });
    console.log(result);
};

request();
```

**接口定义**

```typescript
import { AxiosRequestConfig } from 'axios';

declare function buildApi(config: ApiBuilderConfig): ApiFunction;

interface ApiBuilderConfig {
    // 接口名称，供内置的日志功能使用
    name: string;
    // 返回 axios 请求参数的函数
    // 详情可参考：https://github.com/axios/axios#request-config
    axios: () => AxiosRequestConfig;
    // 返回 mock 数据的方法
    // 接收 axios 方法返回的 AxiosRequestConfig 作为参数
    mock: (config?: AxiosRequestConfig) => Promise<any>;
    // 是否 mock 数据
    isMock: boolean;
    // 接口是否可以执行取消操作，为 true 时，返回的接口函数会多出 cancel/getToken 2个方法
    cancel?: boolean;
    // 是否监测接口的状态变化，为 true 时，返回的接口函数会多出 callback 1个方法
    callback?: boolean;
}

interface ApiFunction extends Function {
    cancel?: (message: string) => void;
    getToken?: () => Function | null;
    callback?: Function;
}
```

### mock 请求

```javascript
import { buildApi } from '@segma/api-tools';

const api = buildApi({
    name: 'test',
    mock: async () => 'mock result',
    isMock: true,
});
```

**注意事项**

-   mock 需要返回一个 Promise 或是一个 async 函数
-   可搭配 [mockjs](http://mockjs.com/) 使用
-   isMock 为 true 时，mock 必须设置，axios 则不用；为 false 时，axios 必须设置，mock 则不用

### 取消请求

```javascript
import { buildApi } from '@segma/api-tools';

const api = buildApi({
    name: 'test',
    axios: () => ({
        url: 'http://localhost:7000/api/wait',
        method: 'GET',
    }),
    isMock: false,
    cancel: true,
});

const request = async () => {
    api.cancel();
    let result = await api();
    console.log(result);
};

request();
```

**方法说明**

-   `cancel(): void`

取消当前正在进行的请求，需要注意取消只是客户端单方面的行为，不会影响到服务端。

-   `getToken(): Function | null`

获取内部的取消函数，可能为空，主要用于判断接口是否处于请求状态。

```javascript
let loading = false;
api.callback(status => {
    loading = status === 'start' || (status === 'error' && api.getToken());
});
```

**注意事项**

-   不管是 mock 还是真实请求，都支持取消
-   不能在会导致数据变更的接口（大部分 POST 请求，PUT、DELETE 请求）上执行取消操作

### 监测接口状态

```javascript
import { buildApi } from '@segma/api-tools';

const api = buildApi({
    name: 'test',
    axios: () => ({
        url: 'http://localhost:7000/api/wait',
        method: 'GET',
    }),
    isMock: false,
    cancel: true,
    // 监测接口状态的开关
    callback: true,
});

let loading = false;
api.callback(status => {
    loading = status === 'start' || (status === 'error' && api.getToken());
});

const request = async () => {
    api.cancel();
    let result = await api();
    console.log(result);
};

// 对比以前的写法，不用再去使用 try/catch/finally 来控制加载状态，代码变得简洁
// 当然在串联多个异步操作时，仍可以使用以前的写法
const oldRequest = async () => {
    try {
        loading = true;
        let result = await api();
        console.log(result);
    } catch (error) {
        // handle error
    } finally {
        loading = false;
    }
};

request();
```

**方法说明**

-   `callback((status: 'start' | 'success' | 'error', ...args: any[]) => void): void`

接收一个回调函数作为参数，回调函数的第一个参数 status 表示了接口当前的状态，只会是 start/success/error 这 3 个其中之一；后续参数会根据 status 的值而变化：

-   start：无后续参数
-   success：后续参数为接口返回的结果
-   error：后续参数为接口返回的错误

### todo

-   整合 ApiFactory 与 api builder
