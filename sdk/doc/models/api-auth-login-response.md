
# Api Auth Login Response

## Structure

`ApiAuthLoginResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `user` | [`User \| undefined`](../../doc/models/user.md) | Optional | - |

## Example

```ts
import { ApiAuthLoginResponse, RoleEnum } from 'humanfallback-apilib';

const apiAuthLoginResponse: ApiAuthLoginResponse = {
  user: {
    id: 'id0',
    name: 'name0',
    email: 'email6',
    role: RoleEnum.Customer,
    headline: 'headline0',
  },
};
```

