# Evidence

```ts
const evidenceController = new EvidenceController(client);
```

## Class Name

`EvidenceController`

## Methods

* [Submit Evidence](../../doc/controllers/evidence.md#submit-evidence)
* [Verify Evidence](../../doc/controllers/evidence.md#verify-evidence)


# Submit Evidence

```ts
async submitEvidence(
  id: string,
  file: FileWrapper,
  note?: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksEvidenceResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `file` | `FileWrapper` | Form, Required | - |
| `note` | `string \| undefined` | Form, Optional | **Constraints**: *Maximum Length*: `500` |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**201**: Evidence stored

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksEvidenceResponse`](../../doc/models/api-tasks-evidence-response.md).

## Example Usage

```ts
const id = 'id0';

const file = new FileWrapper(fs.createReadStream('dummy_file'));

try {
  const response = await evidenceController.submitEvidence(
    id,
    file
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
| 413 | Error | [`CustomError`](../../doc/models/custom-error.md) |


# Verify Evidence

```ts
async verifyEvidence(
  id: string,
  requestOptions?: RequestOptions
): Promise<ApiResponse<ApiTasksVerifyResponse>>
```

## Parameters

| Parameter | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string` | Template, Required | - |
| `requestOptions` | `RequestOptions \| undefined` | Optional | Pass additional request options. |

## Response Type

**200**: Structured verdict

This method returns an [`ApiResponse`](../../doc/api-response.md) instance. The `result` property of this instance returns the response data which is of type [`ApiTasksVerifyResponse`](../../doc/models/api-tasks-verify-response.md).

## Example Usage

```ts
const id = 'id0';

try {
  const response = await evidenceController.verifyEvidence(id);

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

