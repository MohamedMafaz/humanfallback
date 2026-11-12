
# Api Tasks Response 1

## Structure

`ApiTasksResponse1`

## Fields

| Name | Type | Tags | Description |
|  --- | --- | --- | --- |
| `task` | [`Task \| undefined`](../../doc/models/task.md) | Optional | - |

## Example

```ts
import { ApiTasksResponse1, CategoryEnum } from 'humanfallback-apilib';

const apiTasksResponse1: ApiTasksResponse1 = {
  task: {
    id: 'id4',
    code: 'code2',
    title: 'title0',
    description: 'description4',
    category: CategoryEnum.DocumentCollection,
  },
};
```

