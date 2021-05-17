# 0.2.6 (2021-05-17)

-   [api] add `MessageTipFactory` to set up custom message tip function.

# 0.2.5 (2020-12-17)

-   [api] return full result instead of message only.

# 0.2.4 (2020-12-16)

-   [api] dealing most kinds of error with tip function.

# 0.2.3 (2020-12-15)

-   update response struct.

# 0.2.2 (2020-12-02)

-   update dependencies.

# 0.2.1 (2020-11-17)

-   [auth checker] avoid redundant navigation.

# 0.2.0 (2020-11-11)

-   [api builder] instead of using `buildApi` directly, `initBuilder` will return `buildApi` now.

# 0.1.9 (2020-10-14)

-   update dependencies.

# 0.1.8 (2020-10-14)

-   [api builder] spread params passing from outside.

# 0.1.7 (2020-10-13)

-   [api builder] add param to `ApiBuilderConfig.axios`.

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
