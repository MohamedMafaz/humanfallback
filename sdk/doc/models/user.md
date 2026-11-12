
# User

## Structure

`User`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `id` | `string \| undefined` | Optional | - |
| `name` | `string \| undefined` | Optional | - |
| `email` | `string \| undefined` | Optional | - |
| `role` | [`RoleEnum \| undefined`](../../doc/models/role-enum.md) | Optional | - |
| `headline` | `string \| undefined` | Optional | - |
| `bio` | `string \| undefined` | Optional | - |
| `location` | `string \| undefined` | Optional | - |
| `skills` | `string[] \| undefined` | Optional | - |
| `languages` | `string[] \| undefined` | Optional | - |
| `hourlyRate` | `number \| undefined` | Optional | - |
| `rating` | `number \| undefined` | Optional | - |
| `reviews` | `number \| undefined` | Optional | - |
| `completedTasks` | `number \| undefined` | Optional | - |
| `earned` | `number \| undefined` | Optional | - |
| `isAvailable` | `boolean \| undefined` | Optional | - |
| `verified` | `boolean \| undefined` | Optional | - |

## Example

```ts
import { RoleEnum, User } from 'humanfallback-apilib';

const user: User = {
  id: 'id0',
  name: 'name0',
  email: 'email6',
  role: RoleEnum.Customer,
  headline: 'headline0',
};
```

