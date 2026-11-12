
# Api Auth Signup Response

## Structure

`ApiAuthSignupResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `user` | [`User \| undefined`](../../doc/models/user.md) | Optional | - |

## Example

```ts
import { ApiAuthSignupResponse, RoleEnum } from 'humanfallback-apilib';

const apiAuthSignupResponse: ApiAuthSignupResponse = {
  user: {
    id: 'id0',
    name: 'name0',
    email: 'email6',
    role: RoleEnum.Customer,
    headline: 'headline0',
  },
};
```

