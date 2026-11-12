# Auth

```ts
const authController = new AuthController(client);
```

## Class Name

`AuthController`

## Methods

* [Login](../../doc/controllers/auth.md#login)
* [Signup](../../doc/controllers/auth.md#signup)
* [Me](../../doc/controllers/auth.md#me)
* [Logout](../../doc/controllers/auth.md#logout)


# Login

```ts
async login(
  body: ApiAuthLoginRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiAuthLoginResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `body` | [`ApiAuthLoginRequest`](../../doc/models/api-auth-login-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Signed in

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiAuthLoginResponse`](../../doc/models/api-auth-login-response.md).

## Example Usage

```ts
const body: ApiAuthLoginRequest = {
  email: 'alex@humanfallback.ai',
  password: 'demo1234',
};

try {
  const response = await authController.login(body);

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
    if (error instanceof CustomError) {
      console.log(error.result);
    }
  }
}
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 401 | Error | [`CustomError`](../../doc/models/custom-error.md) |


# Signup

```ts
async signup(
  body: ApiAuthSignupRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiAuthSignupResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `body` | [`ApiAuthSignupRequest`](../../doc/models/api-auth-signup-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**201**: Account created

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiAuthSignupResponse`](../../doc/models/api-auth-signup-response.md).

## Example Usage

```ts
const body: ApiAuthSignupRequest = {
  name: 'name6',
  email: 'email0',
  password: 'password0',
  role: Role1Enum.Customer,
};

try {
  const response = await authController.signup(body);

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
    if (error instanceof CustomError) {
      console.log(error.result);
    }
  }
}
```

## Errors

| HTTP Status Code | Error Description | Exception Class |
|  --- | --- | --- |
| 409 | Error | [`CustomError`](../../doc/models/custom-error.md) |


# Me

```ts
async me(
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiAuthMeResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Current user, or null

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiAuthMeResponse`](../../doc/models/api-auth-me-response.md).

## Example Usage

```ts
try {
  const response = await authController.me();

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
  }
}
```


# Logout

```ts
async logout(requestOptions?: RequestOptions): Promise<ApiResponse<void>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Signed out

This method returns an [`ApiResponse`](../../doc/api-response.md) instance.

## Example Usage

```ts
try {
  const response = await authController.logout();

  // Extracting fully parsed response body.
  console.log(response.result);

  // Extracting response status code.
  console.log(response.statusCode);
  // Extracting response headers.
  console.log(response.headers);
  // Extracting response body of type `string | Stream`
  console.log(response.body);
} catch (error) {
  if (error instanceof ApiError) {
    // Extracting response error status code.
    console.log(error.statusCode);
    // Extracting response error headers.
    console.log(error.headers);
    // Extracting response error body of type `string | Stream`.
    console.log(error.body);
  }
}
```

