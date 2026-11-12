
# Api Tasks Response

## Structure

`ApiTasksResponse`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `tasks` | [`Task[] \| undefined`](../../doc/models/task.md) | Optional | - |

## Example

```ts
import { ApiTasksResponse, CategoryEnum } from 'humanfallback-apilib';

const apiTasksResponse: ApiTasksResponse = {
  tasks: [
    {
      id: 'id0',
      code: 'code8',
      title: 'title6',
      description: 'description0',
      category: CategoryEnum.PhysicalInspection,
    },
    {
      id: 'id0',
      code: 'code8',
      title: 'title6',
      description: 'description0',
      category: CategoryEnum.PhysicalInspection,
    }
  ],
};
```

