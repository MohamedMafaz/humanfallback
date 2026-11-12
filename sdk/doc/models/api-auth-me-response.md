
# Api Auth Me Response

## Structure

`ApiAuthMeResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `user` | [`ApiAuthMeResponseUser \| null \| undefined`](../../doc/models/containers/api-auth-me-response-user.md) | Optional | This is a container for one-of cases. |

## Example

```ts
import { ApiAuthMeResponse, RoleEnum } from 'humanfallback-apilib';

const apiAuthMeResponse: ApiAuthMeResponse = {
  user: {
    id: 'id6',
    name: 'name6',
    email: 'email0',
    role: RoleEnum.Customer,
    headline: 'headline4',
  },
};
```

