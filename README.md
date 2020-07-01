# segma-api

## 简介

这是一个与构建 api 请求相关的工具包，包含了定制 axios 实例、认证 token 的管理、基于 vue 的认证 mixin、构建可取消、可 mock 数据的 api 请求等功能。

## 定制 axios 实例

我们通常使用 axios 来请求后端接口，但在实际使用时，往往需要对 axios 实例进行一些定制化的配置来适应后端接口的一些通用的约定，如返回数据格式、验证机制、错误处理等等。

这些通用的约定一般是作为团队的代码规范，不会随着项目而变化的，所以在以往的实践中，前端需要在每个项目里去编写这样一份相同的配置，这是重复性的工作，需要进行改进。

### 使用

在 api-tools 里，我们提供了 ApiFactory 函数，可以快速生成一个已经配置好的 axios 实例。

```javascript
import { ApiFactory } from '@segma/api-tools/api';

const axios = ApiFactory({
    tip: console.log,
    auth: true,
    redirect: process.env.VUE_APP_AUTH_REDIRECT_URI,
    axiosConfig: {
        baseURL: process.env.VUE_APP_BASE_API,
    },
});

async function request() {
    let result = await axios.get('http://localhost:7000/api');
    console.log(result);
}
```

配置结构

```typescript
interface IApiConfig {
    // 提示接口错误消息的函数
    tip: (message: string, code?: number | null) => void;
    // axios 配置
    // 会与默认的 axios 配置进行合并
    axiosConfig?: AxiosRequestConfig;
    // 如果为 true，则会在请求时向 header 添加 Authorization 字段，在响应 401 错误时，会自动执行 logout 操作。
    // todo: 重构为具体的 auth strategy，包括 如果获取与设置 token，如何响应 401 错误
    auth?: boolean;
    // 登出时需要跳转到的地址
    // todo: 重构到 auth strategy中
    redirect?: string;
}
```

默认配置

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
    auth: false,
};
```

## 管理 token

token 的管理主要与 axios 实例，AuthChecker 一起使用，做到与业务代码基本解耦，日常的开发不需要关心 token 如何处理。

### 管理策略

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

### 管理操作

```typescript
// 对应 strategy 的 get 操作
declare const getToken: () => Promise<string>;
// 对应 strategy 的 set 操作
declare const setToken: (token?: string | null) => void;
// 对应 strategy 的 remove 操作
declare const clearToken: () => void;
export { getToken, setToken, clearToken };
```

### todo

-   自定义 token 的名称，现在固定为 auth_token。

## AuthChecker

可以快速创建一个可以获取、保存、检查 token 是否存在的 mixin。

### 使用

## api 构造器
