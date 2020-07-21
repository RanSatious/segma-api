# 0.1.3 (2020-07-21)

-   [ApiFactory] refactor `IApiConfig` with new auth strategy: `IAuthStrategy`, add a build-in strategy called `SegmaStrategy`.

# 0.1.2 (2020-07-20)

-   [api builder] `mock: (config?: AxiosRequestConfig) => Promise<any>` in `ApiBuilderConfig` will receive a `config: AxiosRequestConfig` parameter which is returned by `axios: () => AxiosRequestConfig` if exists.

# 0.1.0 (2020-07-02)

首次发布
