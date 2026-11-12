
# Api Humans Response 1

## Structure

`ApiHumansResponse1`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `provider` | [`User \| undefined`](../../doc/models/user.md) | Optional | - |
| `recentWork` | [`TaskSummary[] \| undefined`](../../doc/models/task-summary.md) | Optional | - |

## Example

```ts
import { ApiHumansResponse1, RoleEnum } from 'humanfallback-apilib';

const apiHumansResponse1: ApiHumansResponse1 = {
  provider: {
    id: 'id8',
    name: 'name8',
    email: 'email8',
    role: RoleEnum.Provider,
    headline: 'headline2',
  },
  recentWork: [
    {
      id: 'id0',
      code: 'code8',
      title: 'title6',
      category: 'category8',
      price: 40.12,
    },
    {
      id: 'id0',
      code: 'code8',
      title: 'title6',
      category: 'category8',
      price: 40.12,
    }
  ],
};
```

