
# Api Health Response

## Structure

`ApiHealthResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `status` | `string \| undefined` | Optional | - |
| `tasks` | `number \| undefined` | Optional | - |
| `users` | `number \| undefined` | Optional | - |
| `ai` | `boolean \| undefined` | Optional | - |
| `paypal` | `boolean \| undefined` | Optional | - |
| `time` | `string \| undefined` | Optional | - |

## Example

```ts
import { ApiHealthResponse } from 'humanfallback-apilib';

const apiHealthResponse: ApiHealthResponse = {
  status: 'status8',
  tasks: 22,
  users: 244,
  ai: false,
  paypal: false,
};
```

