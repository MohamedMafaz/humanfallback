
# Api Auth Signup Request

## Structure

`ApiAuthSignupRequest`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `name` | `string` | Required | - |
| `email` | `string` | Required | - |
| `password` | `string` | Required | **Constraints**: *Minimum Length*: `8` |
| `role` | [`Role1Enum \| undefined`](../../doc/models/role-1-enum.md) | Optional | **Default**: `Role1Enum.Customer` |
| `location` | `string \| undefined` | Optional | - |
| `headline` | `string \| undefined` | Optional | - |
| `skills` | `string \| undefined` | Optional | Comma-separated |

## Example

```ts
import { ApiAuthSignupRequest, Role1Enum } from 'humanfallback-apilib';

const apiAuthSignupRequest: ApiAuthSignupRequest = {
  name: 'name4',
  email: 'email2',
  password: 'password8',
  role: Role1Enum.Customer,
  location: 'location8',
  headline: 'headline4',
  skills: 'skills2',
};
```

