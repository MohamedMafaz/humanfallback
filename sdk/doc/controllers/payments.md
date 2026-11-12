# Payments

```ts
const paymentsController = new PaymentsController(client);
```

## Class Name

`PaymentsController`

## Methods

* [Create Payment Order](../../doc/controllers/payments.md#create-payment-order)
* [Capture Payment](../../doc/controllers/payments.md#capture-payment)
* [Paypal Config](../../doc/controllers/payments.md#paypal-config)


# Create Payment Order

```ts
async createPaymentOrder(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksPayResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: PayPal order (or simulator order)

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksPayResponse`](../../doc/models/api-tasks-pay-response.md).

## Example Usage

```ts
const id = 'id0';

try {
  const response = await paymentsController.createPaymentOrder(id);

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


# Capture Payment

```ts
async capturePayment(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksCaptureResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Captured; the task is released to the provider

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksCaptureResponse`](../../doc/models/api-tasks-capture-response.md).

## Example Usage

```ts
const id = 'id0';

try {
  const response = await paymentsController.capturePayment(id);

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
| 402 | Error | [`CustomError`](../../doc/models/custom-error.md) |


# Paypal Config

```ts
async paypalConfig(
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiPaypalConfigResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Mode and public client id

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiPaypalConfigResponse`](../../doc/models/api-paypal-config-response.md).

## Example Usage

```ts
try {
  const response = await paymentsController.paypalConfig();

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

