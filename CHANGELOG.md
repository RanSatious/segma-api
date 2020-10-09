# 0.1.6 (2020-10-09)

-   update dependencies.

# 0.1.5 (2020-08-07)

-   [AuthChecker] update `AuthChecker`'s default logout behavior.

# 0.1.4 (2020-08-07)

-   [AuthStrategy] update `SegmaStrategy`, add `QingtuiStrategy`.

# 0.1.3 (2020-07-21)

-   [ApiFactory] refactor `IApiConfig` with new auth strategy: `IAuthStrategy`, add a build-in strategy called `SegmaStrategy`.

# 0.1.2 (2020-07-20)

-   [api builder] `mock: (config?: AxiosRequestConfig) => Promise<any>` in `ApiBuilderConfig` will receive a `config: AxiosRequestConfig` parameter which is returned by `axios: () => AxiosRequestConfig` if exists.

# 0.1.0 (2020-07-02)

首次发布
