# Agent

```ts
const agentController = new AgentController(client);
```

## Class Name

`AgentController`

## Methods

* [Parse Task](../../doc/controllers/agent.md#parse-task)
* [Match Providers](../../doc/controllers/agent.md#match-providers)
* [Mcp](../../doc/controllers/agent.md#mcp)


# Parse Task

```ts
async parseTask(
  body: ApiAgentParseRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiAgentParseResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `body` | [`ApiAgentParseRequest`](../../doc/models/api-agent-parse-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Structured draft plus model metadata

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiAgentParseResponse`](../../doc/models/api-agent-parse-response.md).

## Example Usage

```ts
const body: ApiAgentParseRequest = {
  prompt: 'Go to my office, inspect the electricity meter and send me a photograph of the reading. Budget $10.',
};

try {
  const response = await agentController.parseTask(body);

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


# Match Providers

```ts
async matchProviders(
  body: ApiAgentMatchRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiAgentMatchResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `body` | [`ApiAgentMatchRequest`](../../doc/models/api-agent-match-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Ranked providers with rationale

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiAgentMatchResponse`](../../doc/models/api-agent-match-response.md).

## Example Usage

```ts
const body: ApiAgentMatchRequest = {
  title: 'title8',
  category: CategoryEnum.PhysicalInspection,
  location: 'location0',
  budget: 49.66,
};

try {
  const response = await agentController.matchProviders(body);

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


# Mcp

```ts
async mcp(
  body: ApiMcpRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<unknown | undefined>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `body` | [`ApiMcpRequest`](../../doc/models/api-mcp-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: JSON-RPC response

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type `unknown`.

## Example Usage

```ts
const body: ApiMcpRequest = {
  jsonrpc: '2.0',
  method: MethodEnum.Initialize,
};

try {
  const response = await agentController.mcp(body);

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

