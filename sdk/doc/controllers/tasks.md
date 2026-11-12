# Tasks

```ts
const tasksController = new TasksController(client);
```

## Class Name

`TasksController`

## Methods

* [List Tasks](../../doc/controllers/tasks.md#list-tasks)
* [Create Task](../../doc/controllers/tasks.md#create-task)
* [Get Task](../../doc/controllers/tasks.md#get-task)
* [Transition Task](../../doc/controllers/tasks.md#transition-task)


# List Tasks

```ts
async listTasks(
  status?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `status` | `string \| undefined` | Query, Optional | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Tasks

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksResponse`](../../doc/models/api-tasks-response.md).

## Example Usage

```ts
try {
  const response = await tasksController.listTasks();

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


# Create Task

```ts
async createTask(
  body: ApiTasksRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksResponse1>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `body` | [`ApiTasksRequest`](../../doc/models/api-tasks-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**201**: Task created, awaiting payment

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksResponse1`](../../doc/models/api-tasks-response-1.md).

## Example Usage

```ts
const body: ApiTasksRequest = {
  draft: {
    title: 'title2',
    category: CategoryEnum.DocumentCollection,
    location: 'location6',
    budget: 57.12,
  },
  providerId: 'providerId0',
};

try {
  const response = await tasksController.createTask(body);

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
| 422 | Error | [`CustomError`](../../doc/models/custom-error.md) |


# Get Task

```ts
async getTask(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksResponse1>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Task

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksResponse1`](../../doc/models/api-tasks-response-1.md).

## Example Usage

```ts
const id = 'id0';

try {
  const response = await tasksController.getTask(id);

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


# Transition Task

```ts
async transitionTask(
  id: string,
  body: ApiTasksTransitionRequest,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksTransitionResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `body` | [`ApiTasksTransitionRequest`](../../doc/models/api-tasks-transition-request.md) | Body, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Updated task

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksTransitionResponse`](../../doc/models/api-tasks-transition-response.md).

## Example Usage

```ts
const id = 'id0';

const body: ApiTasksTransitionRequest = {
  action: ActionEnum.Start,
};

try {
  const response = await tasksController.transitionTask(
    id,
    body
  );

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

