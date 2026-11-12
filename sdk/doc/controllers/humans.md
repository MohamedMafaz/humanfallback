# Humans

```ts
const humansController = new HumansController(client);
```

## Class Name

`HumansController`

## Methods

* [List Humans](../../doc/controllers/humans.md#list-humans)
* [Get Human](../../doc/controllers/humans.md#get-human)


# List Humans

```ts
async listHumans(
  q?: string,
  category?: CategoryEnum,
  available?: AvailableEnum,
  maxPrice?: number,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiHumansResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `q` | `string \| undefined` | Query, Optional | - |
| `category` | [`CategoryEnum \| undefined`](../../doc/models/category-enum.md) | Query, Optional | - |
| `available` | [`AvailableEnum \| undefined`](../../doc/models/available-enum.md) | Query, Optional | - |
| `maxPrice` | `number \| undefined` | Query, Optional | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Providers

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiHumansResponse`](../../doc/models/api-humans-response.md).

## Example Usage

```ts
try {
  const response = await humansController.listHumans();

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


# Get Human

```ts
async getHuman(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiHumansResponse1>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Provider

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiHumansResponse1`](../../doc/models/api-humans-response-1.md).

## Example Usage

```ts
const id = 'id0';

try {
  const response = await humansController.getHuman(id);

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
| 404 | Error | [`CustomError`](../../doc/models/custom-error.md) |

