
# Api Mcp Request

## Structure

`ApiMcpRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `jsonrpc` | `string` | Required, Constant | **Value**: `'2.0'` |
| `id` | [`ApiMcpRequestId \| undefined`](../../doc/models/containers/api-mcp-request-id.md) | Optional | This is a container for one-of cases. |
| `method` | [`MethodEnum`](../../doc/models/method-enum.md) | Required | - |
| `params` | `unknown \| undefined` | Optional | - |

## Example

```ts
import { ApiMcpRequest, MethodEnum } from 'humanfallback-apilib';

const apiMcpRequest: ApiMcpRequest = {
  jsonrpc: '2.0',
  method: MethodEnum.Initialize,
  id: 'String3',
  params: { 'key1': 'val1', 'key2': 'val2' },
};
```

