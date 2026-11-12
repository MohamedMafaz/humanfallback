
# Api Humans Response

## Structure

`ApiHumansResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `providers` | [`User[] \| undefined`](../../doc/models/user.md) | Optional | - |

## Example

```ts
import { ApiHumansResponse, RoleEnum } from 'humanfallback-apilib';

const apiHumansResponse: ApiHumansResponse = {
  providers: [
    {
      id: 'id0',
      name: 'name0',
      email: 'email6',
      role: RoleEnum.Admin,
      headline: 'headline0',
    },
    {
      id: 'id0',
      name: 'name0',
      email: 'email6',
      role: RoleEnum.Admin,
      headline: 'headline0',
    },
    {
      id: 'id0',
      name: 'name0',
      email: 'email6',
      role: RoleEnum.Admin,
      headline: 'headline0',
    }
  ],
};
```

