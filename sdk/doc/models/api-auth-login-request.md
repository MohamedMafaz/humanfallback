
# Api Auth Login Request

## Structure

`ApiAuthLoginRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `email` | `string` | Required | - |
| `password` | `string` | Required | - |

## Example

```ts
import { ApiAuthLoginRequest } from 'humanfallback-apilib';

const apiAuthLoginRequest: ApiAuthLoginRequest = {
  email: 'alex@humanfallback.ai',
  password: 'demo1234',
};
```

